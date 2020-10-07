#!/bin/bash

# create-quip-app is deprecated in favor of quip-cli init.
# This script aliases similar functionality to make transition easier.

PARAMS=""
while (( "$#" )); do
  case "$1" in
    --output)
      if [ -n "$2" ] && [ ${2:0:1} != "-" ]; then
        PARAMS="$PARAMS --dir $2"
        shift 2
      else
        echo "Error: Argument for $1 is missing" >&2
        exit 1
      fi
      ;;
    *) # preserve positional arguments
      PARAMS="$PARAMS $1"
      shift
      ;;
  esac
done

echo "$(dirname $(realpath $0))/node_modules/.bin/quip-cli init --no-create --json --name \"A Quip Live App\" --id \"LIVE_APP_ID\" $PARAMS > /dev/null"

# --json puts the quip-cli in programatic mode, --no-create just creates an app locally without creating on the server.
# later arguments override earlier ones, so we can just pass --name and --id as defaults and it will still work to specify them on the command line.
$(dirname $(realpath $0))/node_modules/.bin/quip-cli init --no-create --json --name "A Quip Live App" --id "LIVE_APP_ID" $PARAMS > /dev/null

OK=$?
if [[ "$OK" -eq "0" ]]; then
    echo "App created."
else
    echo "Failed"
    exit 1
fi