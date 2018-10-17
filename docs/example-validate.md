# `omg validate` example

## Vanila

### Valid `microservice.yml`
#### Input
```
omg validate
```

#### Output
```
No errors
```

### Invalid `microservice.yml`
#### Input
```
omg validate
```

#### Output
```
actions.list_channels.http should have required property 'port'
```

## `--silent`, or `-s` tag
### Valid `microservice.yml`
#### Input
```
omg validate -s
```

#### Output
Will exit with status code `0`

### Invalid `microservice.yml`
#### Input
```
omg validate -s
```

#### Output
Will exit with status code `1`

## `--json`, or `-j` tag
### Valid `microservice.yml`
#### Input
```
omg validate -j
```

### Valid `microservice.yml`
#### Output
```json
{
  "valid": true,
  "yaml": {
    ...
  },
  "errors": null,
  "text": "No errors"
}
```

### Invalid `microservice.yml`
#### Input
```
omg validate -j
```

#### Output
```json
{
  "valid": false,
  "issue": {
    "required": true,
    "help": "Lowest possible integer value"
  },
  "errors": [
    {
      "keyword": "required",
      "dataPath": "",
      "schemaPath": "#/required",
      "params": {
        "missingProperty": "type"
      },
      "message": "should have required property 'type'"
    }
  ],
  "text": "actions.integer.arguments.low should have required property 'type'"
}
```
