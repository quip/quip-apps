# Quip CLI

This package contains the Quip command line interface, which is used for interacting with the Quip Live Apps platform.

<!-- toc -->
* [Quip CLI](#quip-cli)
* [Requirements](#requirements)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Requirements

Node v10 or higher.

# Usage

<!-- usage -->
```sh-session
$ npm install -g quip-cli
$ quip-cli COMMAND
running command...
$ quip-cli (-v|--version|version)
quip-cli/0.2.0-alpha.37 darwin-x64 node-v14.18.1
$ quip-cli --help [COMMAND]
USAGE
  $ quip-cli COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`quip-cli apps`](#quip-cli-apps)
* [`quip-cli bump [INCREMENT]`](#quip-cli-bump-increment)
* [`quip-cli help [COMMAND]`](#quip-cli-help-command)
* [`quip-cli init`](#quip-cli-init)
* [`quip-cli login`](#quip-cli-login)
* [`quip-cli migration [NAME]`](#quip-cli-migration-name)
* [`quip-cli publish`](#quip-cli-publish)
* [`quip-cli release [BUILD]`](#quip-cli-release-build)

## `quip-cli apps`

Browse, inspect, and manipulate your Apps

```
USAGE
  $ quip-cli apps

OPTIONS
  -h, --help             show CLI help
  -i, --id=id            show the details of an app ID
  -j, --json             output responses in JSON
  -s, --site=site        [default: quip.com] use a specific quip site rather than the standard quip.com login
  -v, --version=version  which version to show the details for. Only useful with --id
```

_See code: [src/commands/apps.ts](https://github.com/quip/quip-apps/blob/v0.2.0-alpha.37/src/commands/apps.ts)_

## `quip-cli bump [INCREMENT]`

Bump the application version (and create a version commit/tag)

```
USAGE
  $ quip-cli bump [INCREMENT]

ARGUMENTS
  INCREMENT  [default: none] which number to bump - can be one of 'prerelease', 'major', 'minor', 'patch', or 'none' -
             defaults to 'none'

OPTIONS
  -h, --help                             show CLI help
  -m, --message=message                  Specify a commit message to use as the version commit message
  -n, --no-git                           Don't perform git operations even when available (just makes changes inline)

  -p, --prerelease-name=prerelease-name  When specifying prerelease, use this as the prefix, e.g. -p alpha will produce
                                         v0.x.x-alpha.x

  -v, --version-number=version-number    Bump the version to a specific number rather than just incrementing to the next
                                         integer
```

_See code: [src/commands/bump.ts](https://github.com/quip/quip-apps/blob/v0.2.0-alpha.37/src/commands/bump.ts)_

## `quip-cli help [COMMAND]`

display help for quip-cli

```
USAGE
  $ quip-cli help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.1.0/src/commands/help.ts)_

## `quip-cli init`

Initialize a new Live App Project

```
USAGE
  $ quip-cli init

OPTIONS
  -d, --dir=dir    specify directory to create app in (defaults to the name provided)
  -h, --help       show CLI help
  -i, --id=id      set the ID of the application
  -j, --json       output responses in JSON (must provide --name and --id)
  -n, --name=name  set the name of the application
  -s, --site=site  [default: quip.com] use a specific quip site rather than the standard quip.com login
  --no-create      only create a local app (don't create an app in the dev console or assign an ID)
  --no-release     don't release the initial version (leave app uninstallable and in the "unreleased" state)
```

_See code: [src/commands/init.ts](https://github.com/quip/quip-apps/blob/v0.2.0-alpha.37/src/commands/init.ts)_

## `quip-cli login`

Logs in to Quip and stores credentials in the .quiprc file

```
USAGE
  $ quip-cli login

OPTIONS
  -e, --export            Display token in terminal after login without store it in config file.
                          NOTE: this cannot work with `--with-token` together.

  -f, --force             forces a re-login even if a user is currently logged in

  -h, --help              show CLI help

  -s, --site=site         [default: quip.com] use a specific quip site rather than the standard quip.com login

  -t, --with-token=token  log in users with your specified access token instead of redirecting to a login page.
                          SEE ALSO: https://quip.com/dev/automation/documentation/current#tag/Authentication
```

_See code: [src/commands/login.ts](https://github.com/quip/quip-apps/blob/v0.2.0-alpha.37/src/commands/login.ts)_

## `quip-cli migration [NAME]`

Creates a new migration

```
USAGE
  $ quip-cli migration [NAME]

ARGUMENTS
  NAME  A short description to generate the filename with

OPTIONS
  -d, --dry-run          Print what this would do, but don't create any files.
  -f, --folder=folder    [default: migrations] The folder where your migrations are stored
  -h, --help             show CLI help

  -v, --version=version  The version to generate this migration for. By default, it will use the current version_number
                         in the manifest
```

_See code: [src/commands/migration.ts](https://github.com/quip/quip-apps/blob/v0.2.0-alpha.37/src/commands/migration.ts)_

## `quip-cli publish`

Uploads this bundle to the developer console, and sets it as the latest development version.

```
USAGE
  $ quip-cli publish

OPTIONS
  -h, --help           show CLI help
  -i, --ignore=ignore  [default: node_modules] blob to ignore. Defaults to 'node_modules'
  -j, --json           output responses in JSON
  -s, --site=site      [default: quip.com] use a specific quip site rather than the standard quip.com login
```

_See code: [src/commands/publish.ts](https://github.com/quip/quip-apps/blob/v0.2.0-alpha.37/src/commands/publish.ts)_

## `quip-cli release [BUILD]`

Release an app to Beta or Production

```
USAGE
  $ quip-cli release [BUILD]

ARGUMENTS
  BUILD  the build number to release

OPTIONS
  -b, --beta       release beta version
  -h, --help       show CLI help
  -j, --json       output responses in JSON
  -p, --prod       release production version
  -s, --site=site  [default: quip.com] use a specific quip site rather than the standard quip.com login
```

_See code: [src/commands/release.ts](https://github.com/quip/quip-apps/blob/v0.2.0-alpha.37/src/commands/release.ts)_
<!-- commandsstop -->
