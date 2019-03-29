module.exports = {
  properties: {
    help: {
      type: 'string',
    },
    http: {
      type: 'object',
      properties: {
        port: {
          type: 'integer',
        },
        subscribe: {
          type: 'object',
        },
        unsubscribe: {
          type: 'object',
        },
      },
      required: [
        'subscribe',
      ],
      additionalProperties: false,
    },
    output: {
      type: 'object',
      properties: {
        commands: {
          type: 'object',
        },
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
  required: [
    'http',
  ],
  additionalProperties: false,
};
