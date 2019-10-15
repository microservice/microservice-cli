# OMS

Welcome to OMS Repo! Check out [https://microservice.guide/][website] to see what it's all about

### Installation

```
$ yarn global add oms
```

### Usage

```
Usage: oms [options] [command]

For more details on the commands below, run `oms `(validate|build|run|subscribe)` --help`

Options:
  -V, --version                         output the version number
  -v --version                          Show OMS CLI version
  -d --directory                        Directory to use as root
  -h, --help                            output usage information

Commands:
  validate [options]                    Validate the structure of a `oms.yml` in the working directory
  build [options]                       Builds the microservice defined by the `Dockerfile`. Image will be tagged
                                        with `oms/$gihub_user/$repo_name`, unless the tag flag is
                                        given. If no git config present a random string will be used
  run [options] <action>                Run actions defined in your `oms.yml`. Must be ran in a working
                                        directory with a `Dockerfile` and a `oms.yml`
  subscribe [options] <action> <event>  Subscribe to an event defined in your `oms.yml`. Must be ran in
                                        a working directory with a `Dockerfile` and a `oms.yml`
  ui [options]                          Starts to oms-app which monitors your microservice.
  list [options]                        Lists all actions available in microservice.
```

### Contributing

After cloning this repository, open up a shell in said directory and execute the following

```
$ yarn
$ yarn bootstrap
$ cd packages/cli; yarn link
```

### License

OMS packages including the CLI, the UI package and the Validation package are licensed under the terms of the MIT License.
See the LICENSE file in the repository for more information.

[website]:https://microservice.guide/
