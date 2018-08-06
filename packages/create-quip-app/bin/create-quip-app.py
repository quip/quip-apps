#!/usr/bin/env python2.7
#
# Copyright 2017 Quip

import argparse
import collections
import copy
import fnmatch
import json
import logging
import re
import os
import shutil
import subprocess
import sys
import time
import zipfile


def sanitize_app_name(app_name):
    for remove in ["\"", "$", "'", "\\"]:
        app_name = app_name.replace(remove, "")
    return app_name


def create_app_dir_name(app_name):
    app_dir_name = app_name.lower()
    for illegal in [" ", "/", "\\", "*", "_"]:
        app_dir_name = app_dir_name.replace(illegal, "-")
    for remove in ["'", '"', ".", ",", "(", ")", "&", "?", "^"]:
        app_dir_name = app_dir_name.replace(remove, "")
    return app_dir_name


def check_environment(yarn_or_npm):
    def check_min_major_version(command, min_version):
        version_re = re.compile("^v?(\d+)\.\d+\.\d+")
        try:
            installed_version = subprocess.check_output(
                "%s --version" % command, shell=True)
        except:
            return False
        if installed_version:
            match = version_re.match(installed_version.strip())
            if match and match.group(1):
                major_version = int(match.group(1))
                if major_version >= min_version:
                    return True
        return False
    min_npm = 3
    min_node = 6
    if yarn_or_npm == "npm":
        if not check_min_major_version("npm", min_npm):
            logging.error("Requires npm version >= %d" % (min_npm))
            return False
    if not check_min_major_version("node", min_node):
        logging.error("Requires node version >= %d" % (min_node))
        return False
    return True


def init_app(app_dir_name):
    yarn_or_npm = "npm"
    try:
        FNULL = open(os.devnull, 'w')
        subprocess.check_call("%s --version" % yarn_or_npm, shell=True,
                              stdout=FNULL, stderr=subprocess.STDOUT)
    except:
        yarn_or_npm = "yarn"

    if not check_environment(yarn_or_npm):
        logging.error("Initialization failed.")
        return

    cwd = os.getcwd()
    app_dir = os.path.join(cwd, app_dir_name)
    if os.path.exists(app_dir):
        logging.error("Directory '%s' already exists" % app_dir)
        return

    logging.info("Creating a new Quip App in %s\n", app_dir)
    lib_path = os.path.dirname(os.path.realpath(__file__))
    shutil.copytree(os.path.join(lib_path, "template"), app_dir,
                    ignore=shutil.ignore_patterns("*node_modules*", "*dist*"))

    def replace_placeholders(file_path):
        with open(os.path.join(app_dir, file_path), "r+") as f:
            content = f.read()
            f.seek(0)
            f.write(content.replace("$APP_DIR_NAME", app_dir_name))
            f.truncate()
    for file_path in ["app/manifest.json", "package.json"]:
        replace_placeholders(file_path)

    installed_packages = False


    try:
        logging.info(
            "Installing packages. This might take a couple of minutes.")
        os.chdir(app_dir)
        subprocess.check_call("%s install" % yarn_or_npm, shell=True)
        os.chdir(cwd)
        installed_packages = True
    except:
        #logging.error("Unexpected error: %s", sys.exc_info())
        pass

    logging.info(init_success_msg(app_dir_name, app_dir, yarn_or_npm))

    if not installed_packages:
        logging.error(
            "Heads up that we were unable to run `%s install`, "
            "you will need to do that yourself.", yarn_or_npm)


def init_success_msg(app_dir_name, app_dir, yarn_or_npm):
    return """
Success! Created {0} at {1}
Inside that directory, you can run several commands:

  {2} start
    Starts the development server (for Use Local Resources mode).

  {2} run build
    Builds and packages your {0}/app/app.ele for upload to production.

Quip Live Apps Getting Started Guide:
https://quip.com/dev/liveapps

Happy Hacking!
""".format(app_dir_name, app_dir, yarn_or_npm)


def read_manifest():
    if not os.path.exists("manifest.json"):
        raise Exception("Missing manifest.json file")

    with open("manifest.json", "r") as f:
        manifest = json.loads(f.read())
        return manifest


def warn_missing_paths(manifest, written_paths, app_dir):
    js_filenames = set(manifest.get("js_files", []))
    css_filenames = set(manifest.get("css_files", []))
    missing = False
    for js_filename in js_filenames:
        if not js_filename in written_paths:
            logging.error(
                "Could not find js_file: '%s' in %s" % (js_filename, app_dir))
            missing = True
    for css_filename in css_filenames:
        if not css_filename in written_paths:
            logging.error(
                "Could not find css_file: '%s' in %s" % (css_filename, app_dir))
            missing = True
    return missing


def is_enumerated_path(manifest, path):
    old_resources = manifest.get("resources", [])
    if old_resources:
        logging.error("Please rename 'resources' to 'other_resources'.")
    resource_patterns = old_resources + manifest.get("other_resources", [])
    toolbar_icon = manifest.get("toolbar_icon")
    if toolbar_icon:
        resource_patterns.append(toolbar_icon)
    thumbnail = manifest.get("thumbnail")
    if thumbnail:
        resource_patterns.append(thumbnail)
    js_filenames = set(manifest.get("js_files", []))
    css_filenames = set(manifest.get("css_files", []))

    def matches_resource_pattern(resource_patterns, path):
        for pattern in resource_patterns:
            if fnmatch.fnmatch(path, pattern):
                return True
        return False
    return path == "manifest.json" or \
        path in js_filenames or \
        path in css_filenames or \
        matches_resource_pattern(resource_patterns, path)


# We don't want to warn about webpack JS/CSS map files missing from the
# manifest.json.
def is_map_path(manifest, path):
    def is_map(manifest, path, suffix):
        return path.endswith(suffix) and is_enumerated_path(manifest, path[:-4])
    return is_map(manifest, path, ".js.map") or \
        is_map(manifest, path, ".css.map")


def create_package(app_dir, package_path=None):
    # TODO(plinehan): Validate the directory structure and manifest.
    # Some combination of what run_sandbox and the server-side code already
    # do.
    if not os.path.exists(app_dir):
        logging.error("No app directory found at '%s'" % app_dir)
        return
    if not package_path:
        package_path = os.path.basename(os.path.abspath(app_dir)) + ".ele"
    os.chdir(app_dir)
    manifest = read_manifest()
    written_paths = set()
    for root, dirs, files in os.walk("."):
        for name in files:
            path = os.path.join(root, name)
            assert path.startswith("./")
            path = path[2:]
            if path == package_path:
                continue
            if is_enumerated_path(manifest, path):
                written_paths.add(path)

    if not warn_missing_paths(manifest, written_paths, app_dir):
        with zipfile.ZipFile(package_path, 'w') as zfile:
            for path in written_paths:
                info = zipfile.ZipInfo(path, date_time=time.gmtime(315576000))
                with open(path, "rb") as f:
                    zfile.writestr(info, f.read())

        logging.info("Built package at '%s/%s'" % (app_dir, package_path))
    else:
        sys.exit(1)


def main():
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    parser = argparse.ArgumentParser(prog="quip-apps")
    parser.add_argument("--output", type=str, default=None)
    parser.add_argument("args", nargs=argparse.REMAINDER)
    args = parser.parse_args()
    if len(args.args) == 0:
        logging.error(
            "Please specify the directory to create your live app in")
        sys.exit(1)
    if args.args[0] == "pack":
        if len(args.args) != 2:
            logging.error("Please specify the app directory location")
            sys.exit(1)
        create_package(args.args[1], args.output)
    else:
        init_app(args.args[0])


if __name__ == "__main__":
    main()
