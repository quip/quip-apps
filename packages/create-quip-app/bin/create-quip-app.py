#!/usr/bin/env python2.7
#
# Copyright 2017 Quip

import argparse
import fnmatch
import json
import logging
import os
import re
import subprocess
import sys
import time
import zipfile


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


def init_app():
    # TODO: continue supporting yarn
    check_environment("npm")
    script_path = os.path.dirname(os.path.realpath(sys.argv[0]))
    quip_cli_path = os.path.join(
        script_path, "..", "node_modules", "quip-cli", "bin", "run")
    subprocess.check_call(
        "%s init" % quip_cli_path,
        shell=True,
    )


def read_manifest():
    if not os.path.exists("manifest.json"):
        raise Exception("Missing manifest.json file")

    with open("manifest.json", "r") as f:
        manifest = json.loads(f.read())
        return manifest


def warn_missing_paths(manifest, written_paths, app_dir):
    js_filenames = set(manifest.get("js_files", []))
    css_filenames = set(manifest.get("css_files", []))
    migrations = migration_paths(manifest)
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
    for migration in migrations:
        if not migration in written_paths:
            logging.error(
                "Could not find migration: '%s' in %s" % (migration, app_dir))
            missing = True
    return missing


def migration_paths(manifest):
    return set(
        [os.path.normpath(m["js_file"]) for m in manifest.get("migrations", [])
         ])


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
    migrations = migration_paths(manifest)

    def matches_resource_pattern(resource_patterns, path):
        for pattern in resource_patterns:
            if fnmatch.fnmatch(path, pattern):
                return True
        return False
    return path == "manifest.json" or \
        path in js_filenames or \
        path in css_filenames or \
        path in migrations or \
        matches_resource_pattern(resource_patterns, path)


def create_package(app_dir, package_path=None):
    # TODO(plinehan): Validate the directory structure and manifest.
    # Some combination of what run_sandbox and the server-side code already
    # do.
    if not os.path.exists(app_dir):
        logging.error("No app directory found at '%s'" % app_dir)
        return
    if not package_path:
        package_path = os.path.basename(os.path.abspath(app_dir)) + ".ele"
    # make sure the package_path exists even if its in a non-existent subdir
    package_dir = os.path.dirname(package_path)
    try:
        if package_dir:
            os.makedirs(package_dir)
    except OSError:
        if not os.path.isdir(package_dir):
            raise
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
    if len(args.args) and args.args[0] == "pack":
        app_location = args.args[1] if len(args.args) > 1 else "."
        create_package(app_location, args.output)
    else:
        init_app()


if __name__ == "__main__":
    main()
