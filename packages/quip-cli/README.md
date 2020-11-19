# Quip CLI

This package contains the Quip command line interface, which is used for interacting with the Quip Live Apps platform.

<!-- toc -->
* [Quip CLI](#quip-cli)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->
```sh-session
$ npm install -g quip-cli
$ qla COMMAND
running command...
$ qla (-v|--version|version)
quip-cli/0.1.2-alpha.9 darwin-x64 node-v10.15.0
$ qla --help [COMMAND]
USAGE
  $ qla COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`qla apps`](#qla-apps)
* [`qla bump [INCREMENT]`](#qla-bump-increment)
* [`qla help [COMMAND]`](#qla-help-command)
* [`qla init`](#qla-init)
* [`qla login`](#qla-login)
* [`qla migration [NAME]`](#qla-migration-name)
* [`qla publish`](#qla-publish)

## `qla apps`

Browse, inspect, and manipulate your Apps

```
USAGE
  $ qla apps

OPTIONS
  -h, --help             show CLI help
  -i, --id=id            show the details of an app ID
  -j, --json             output responses in JSON
  -s, --site=site        [default: quip.com] use a specific quip site rather than the standard quip.com login
  -v, --version=version  which version to show the details for. Only useful with --id
```

_See code: [src/commands/apps.ts](https://github.com/quip/quip-apps/blob/v0.1.2-alpha.9/src/commands/apps.ts)_

## `qla bump [INCREMENT]`

Bump the application version (and create a version commit/tag)

```
USAGE
  $ qla bump [INCREMENT]

ARGUMENTS
  INCREMENT  which number to bump - can be one of 'prerelease', 'major', 'minor', or 'patch' - defaults to 'patch'

OPTIONS
  -h, --help                             show CLI help
  -m, --message=message                  Specify a commit message to use as the version commit message

  -p, --prerelease-name=prerelease-name  When specifying prerelease, use this as the prefix, e.g. -p alpha will produce
                                         v0.x.x-alpha.x
```

_See code: [src/commands/bump.ts](https://github.com/quip/quip-apps/blob/v0.1.2-alpha.9/src/commands/bump.ts)_

## `qla help [COMMAND]`

display help for qla

```
USAGE
  $ qla help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.1.0/src/commands/help.ts)_

## `qla init`

Initialize a new Live App Project

```
USAGE
  $ qla init

OPTIONS
  -d, --dir=dir    specify directory to create app in (defaults to the name provided)
  -h, --help       show CLI help
  -i, --id=id      set the ID of the application
  -j, --json       output responses in JSON (must provide --name and --id)
  -n, --name=name  set the name of the application
  -s, --site=site  [default: quip.com] use a specific quip site rather than the standard quip.com login
  --no-create      only create a local app (don't create an app in the dev console or assign an ID)
```

_See code: [src/commands/init.ts](https://github.com/quip/quip-apps/blob/v0.1.2-alpha.9/src/commands/init.ts)_

## `qla login`

Logs in to Quip and stores credentials in the .quiprc file

```
USAGE
  $ qla login

OPTIONS
  -f, --force      forces a re-login even if a user is currently logged in
  -h, --help       show CLI help
  -s, --site=site  [default: quip.com] use a specific quip site rather than the standard quip.com login
```

_See code: [src/commands/login.ts](https://github.com/quip/quip-apps/blob/v0.1.2-alpha.9/src/commands/login.ts)_

## `qla migration [NAME]`

Creates a new migration

```
USAGE
  $ qla migration [NAME]

ARGUMENTS
  NAME  A short description to generate the filename with

OPTIONS
  -d, --dry-run          Print what this would do, but don't create any files.
  -f, --folder=folder    [default: migrations] The folder where your migrations are stored
  -h, --help             show CLI help

  -v, --version=version  The version to generate this migration for. By default, it will use the current version_number
                         in the manifest
```

_See code: [src/commands/migration.ts](https://github.com/quip/quip-apps/blob/v0.1.2-alpha.9/src/commands/migration.ts)_

## `qla publish`

Uploads this bundle to the developer console, and sets it as the latest development version.

```
USAGE
  $ qla publish

OPTIONS
  -h, --help           show CLI help
  -i, --ignore=ignore  [default: node_modules] blob to ignore. Defaults to 'node_modules'
  -j, --json           output responses in JSON
  -s, --site=site      [default: quip.com] use a specific quip site rather than the standard quip.com login
```

_See code: [src/commands/publish.ts](https://github.com/quip/quip-apps/blob/v0.1.2-alpha.9/src/commands/publish.ts)_
<!-- commandsstop -->

## Running locally

When developing locally, you'll iterate by calling `bin/run <your-command>`.

## Adding new commands

This tool uses [oclif](https://oclif.io/) to handle arg parsing and user interactivity.

To add a command to this repo, run `npx oclif command <name>`. For other options, check `npx oclif --help`
