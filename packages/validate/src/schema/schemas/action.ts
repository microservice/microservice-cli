export default {
  properties: {
    help: {
      type: 'string',
    },
    format: {
      type: 'object',
    },
    rpc: {
      type: 'object',
    },
    http: {
      type: 'object',
    },
    events: {
      type: 'object',
    },
    output: {
      type: 'object',
      properties: {
        items: {
          type: 'object',
        },
        type: {
          type: 'string',
          enum: ['int', 'number', 'float', 'string', 'uuid', 'list', 'map', 'object', 'boolean', 'path', 'any', 'null'],
        },
        contentType: {
          type: 'string',
        },
        properties: {
          patternProperties: {
            '^[A-Za-z|_]+$': {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: [
                    'int',
                    'number',
                    'float',
                    'string',
                    'uuid',
                    'list',
                    'map',
                    'object',
                    'boolean',
                    'path',
                    'any',
                    'null',
                  ],
                },
              },
              required: ['type'],
            },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    arguments: {
      type: 'object',
      patternProperties: {
        '^\\w+$': {
          type: 'object',
        },
      },
      additionalProperties: false,
    },
  },
  oneOf: [
    {
      required: ['http'],
    },
    {
      required: ['format'],
    },
    {
      required: ['rpc'],
    },
    {
      required: ['events'],
    },
  ],
  additionalProperties: false,
}
