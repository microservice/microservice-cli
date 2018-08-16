[![CircleCI](https://circleci.com/gh/microservices/omg-cli.svg?style=svg)](https://circleci.com/gh/microservices/omg-cli)
[![codecov](https://codecov.io/gh/microservices/omg-cli/branch/master/graph/badge.svg)](https://codecov.io/gh/microservices/omg-cli)

# NOTICE
Still a work in progress :smile:. Check back soon.

# cli
The microservice.guide CLI allows you to verify your `microservice.yml` and execute the microservice's commands.

## Installation
`npm install -g omg`

## Commands
### Validate
When ran in a directory of a microservice (a directory containing a `microservice.yml`), validation will begin against that file.
```sh
omg utils
```
#### Example output
##### Valid `microservice.yml`
```json
{
  "valid": true,
  "microsericeYaml": {
    "commands": {
      "boolean": {
        "output": "boolean",
        "help": "Generates a random boolean"
      },
      "string": {
        "help": "Generates a random string",
        "format": "{{length}}",
        "output": "string",
        "arguments": {
          "length": {
            "type": "int",
            "required": true,
            "help": "Length of string"
          }
        }
      }
    }
  },
  "errors": null
}
```
##### Invalid `microservice.yml`
```json
{
  "valid": false,
  "microsericeYaml": {
    "commands": {
      "boolean": {
        "output": "boolean",
        "help": "Generates a random boolean"
      },
      "string": {
        "help": "Generates a random string",
        "format": "{{length}}",
        "arguments": {
          "length": {
            "required": true,
            "help": "Length of string"
          }
        }
      }
    }
  },
  "errors": [
    {
      "keyword": "required",
      "dataPath": ".commands['string']",
      "schemaPath": "#/properties/commands/patternProperties/%5E%5BA-Za-z%7C_%5D%2B%24/required",
      "params": {
        "missingProperty": "output"
      },
      "message": "should have required property 'output'"
    },
    {
      "keyword": "required",
      "dataPath": ".commands['string'].arguments['length']",
      "schemaPath": "#/properties/commands/patternProperties/%5E%5BA-Za-z%7C_%5D%2B%24/properties/arguments/patternProperties/%5E%5Cw%2B%24/required",
      "params": {
        "missingProperty": "type"
      },
      "message": "should have required property 'type'"
    }
  ]
}
```
## Exec
When ran in a directory of a microservice (a directory containing a `microservice.yml` and `Dockerfile`) this command will build
the microservice and execute a given command.
### Usage
```
exec [-e] [command] [args...]
```

#### command
Command is a required argument. The given command will be executed.

#### args...
If a command required arguments they can be passed as follows: `key:val`. If required arguments are not given `exec` will fail.

#### Environment variables
If the microservice has any required environment variables they must be passed in with the `exec` command. Much like Docker,
environment variables can be passed as follows: `-e FOO='bar'`. If a required environment variable is not supplied `exec` will fail.

### Example `exec` call
```sh
omg exec -e BOT_TOKEN='xoxb-****' send message:'Hello, World!' to:CAFAF9C
```
```sh
✔ Built Docker image with name: 067a8912-a1fe-4e00-ba4b-ffcc363ca0ab
✔ Started Docker container with id: a941268edae7
✔ Ran command: send with output: {
  "ok": true,
  "reply_to": 1,
  "ts": "1528904352.000735",
  "text": "Hello, World!"
}
✔ Stopped Docker container: a941268edae7
```
