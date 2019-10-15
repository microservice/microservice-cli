# `oms validate` example

## Vanila

### Valid `oms.yml`
#### Input
```
oms validate
```

#### Output
```
No errors
```

### Invalid `oms.yml`
#### Input
```
oms validate
```

#### Output
```
actions.list_channels.http should have required property 'port'
```

## `--silent`, or `-s` tag
### Valid `oms.yml`
#### Input
```
oms validate -s
```

#### Output
Will exit with status code `0`

### Invalid `oms.yml`
#### Input
```
oms validate -s
```

#### Output
Will exit with status code `1`

## `--json`, or `-j` tag
### Valid `oms.yml`
#### Input
```
oms validate -j
```

### Valid `oms.yml`
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

### Invalid `oms.yml`
#### Input
```
oms validate -j
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
