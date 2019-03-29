# Open Microservice CLI
[![CircleCI](https://circleci.com/gh/microservices/omg-cli.svg?style=svg)](https://circleci.com/gh/microservices/omg-cli)
[![codecov](https://codecov.io/gh/microservices/omg-cli/branch/master/graph/badge.svg)](https://codecov.io/gh/microservices/omg-cli)

[![omg](https://user-images.githubusercontent.com/11602092/47048623-f3aff880-d168-11e8-98df-41baa301b242.png)](https://microservice.guide/)

Verify, test, and execute microservices built with the [OMG](https://microservice.guide/) standard.

## Overview
The goals of this project is to provide a utility for developers to test/execute their microservices before being used in a production environment.

## Installation
```
npm install -g omg
```

## Commands
### `omg validate`
```
  Usage: validate [options]

  Validate the structure of a `microservice.yml` in the current directory

  Options:

    -j --json    Formats output to JSON
    -s --silent  Only feedback is the status exit code
    -h, --help   output usage information
```

## `omg build`
```
  Usage: build [options]

  Builds the microservice defined by the `Dockerfile`. Image will be tagged with `omg/$gihub_user/$repo_name`, unless the tag flag is given. If no git config present a random string will be used

  Options:

    -t --tag, <t>  The tag name of the image
    -h, --help     output usage information
```

## `omg run`
```
  Usage: run [options] <action>

  Run actions defined in your `microservice.yml`. Must be ran in a directory with a `Dockerfile` and a `microservice.yml`

  Options:

    -i --image <i>  The name of the image to spin up the microservice, if not provided a fresh image will be build based of the `Dockerfile`
    -a --args <a>   Arguments to be passed to the command, must be of the form `key="val"` (default: )
    -e --envs <e>   Environment variables to be passed to run environment, must be of the form `key="val"` (default: )
    -r --raw        All logging is suppressed expect for the output of the action.
    -h, --help      output usage information
```

## `omg subscribe`
```
  Usage: subscribe [options] <action> <event>

  Subscribe to an event defined in your `microservice.yml`. Must be ran in a directory with a `Dockerfile` and a `microservice.yml`

  Options:

    -a --args <a>  Arguments to be passed to the event, must be of the form `key="val"` (default: )
    -e --envs <e>  Environment variables to be passed to run environment, must be of the form `key="val"` (default: )
    -h, --help     output usage information
```

## `omg shutdown`
```
  Usage: shutdown [options]

  Shutdown a microservice process that was started by an event command

  Options:

    -h, --help  output usage information
```

More information can be found in the [docs](/docs).
