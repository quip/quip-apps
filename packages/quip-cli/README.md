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
quip-cli/1.0.0-alpha.28 linux-x64 node-v12.18.2
$ qla --help [COMMAND]
USAGE
  $ qla COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`qla help [COMMAND]`](#qla-help-command)
* [`qla init`](#qla-init)
* [`qla login`](#qla-login)
* [`qla migration [NAME]`](#qla-migration-name)

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
  -h, --help  show CLI help
```

_See code: [src/commands/init.ts](https://github.com/quip/quip-apps/blob/v1.0.0-alpha.28/src/commands/init.ts)_

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

_See code: [src/commands/login.ts](https://github.com/quip/quip-apps/blob/v1.0.0-alpha.28/src/commands/login.ts)_

## `qla migration [NAME]`

Creates a new migration

```
USAGE
  $ qla migration [NAME]

ARGUMENTS
  NAME  A short description to generate the filename with

OPTIONS
  -f, --folder=folder      [default: migrations] The folder where your migrations are stored
  -h, --help               show CLI help
  -m, --manifest=manifest  A manifest.json file to add the migration to. By default, we'll use the first one we find.

  -v, --version=version    The version to generate this migration for. By default, it will use the current
                           version_number in the manifest
```

_See code: [src/commands/migration.ts](https://github.com/quip/quip-apps/blob/v1.0.0-alpha.28/src/commands/migration.ts)_
<!-- commandsstop -->

## Running locally

When developing locally, you'll iterate by calling `bin/run <your-command>`.

## Adding new commands

This tool uses [oclif](https://oclif.io/) to handle arg parsing and user interactivity.

To add a command to this repo, run `npx oclif command <name>`. For other options, check `npx oclif --help`
