#!/usr/bin/env python2.7
#
# Copyright 2017 Quip

import argparse
import collections
import copy
import fnmatch
import json
import logging
import os
import shutil
import sys
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


def init_app(app_dir_name):
    app_dir = os.path.join(os.getcwd(), app_dir_name)
    if os.path.exists(app_dir):
        logging.error("Directory '%s' already exists" % app_dir)
        return
    lib_path = os.path.dirname(os.path.realpath(__file__))
    shutil.copytree(os.path.join(lib_path, "template"), app_dir,
                    ignore=shutil.ignore_patterns("*node_modules*", "*dist*"))

    def replace_placeholders(file_path):
        with open(os.path.join(app_dir, file_path), "r+") as f:
            content = f.read()
            f.seek(0)
            f.write(content
                    .replace("$APP_DIR_NAME", app_dir_name))
            f.truncate()
    for file_path in ["app/manifest.json", "package.json"]:
        replace_placeholders(file_path)
    logging.info("Successfully initialized %s" % (app_dir))


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
                zfile.write(path)

        logging.info("Built package at '%s/%s'" % (app_dir, package_path))


def main():
    logging.basicConfig(level=logging.INFO)
    parser = argparse.ArgumentParser(prog="quip-apps")
    parser.add_argument("--output", type=str, default=None)
    # Webpack, for example, uses `eval` when compiling in debug mode.
    #parser.add_argument("command", choices=["pack"])
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
