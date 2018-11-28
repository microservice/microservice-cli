module.exports = {
  type: 'object',
  properties: {
    type: {
      type: [
        'array',
        'string',
      ],
      items: {
        type: 'string',
        enum: [
          'int',
          'number',
          'float',
          'string',
          'uuid',
          'list',
          'object',
          'boolean',
          'path',
          'any',
        ],
      },
      pattern: '^(number|int|float|string|uuid|list|map|boolean|path|object|any)$',
    },
    help: {
      type: 'string',
    },
    in: {
      type: 'string',
      enum: [
        'query',
        'path',
        'requestBody',
      ],
    },
    pattern: {
      type: 'string',
    },
    enum: {
      type: 'array',
    },
    range: {
      type: 'object',
      properties: {
        min: {
          type: 'integer',
        },
        max: {
          type: 'integer',
        },
      },
      additionalProperties: false,
    },
    required: {
      type: 'boolean',
    },
    default: {
      type: [
        'boolean',
        'integer',
        'number',
        'array',
        'string',
        'object',
      ],
    },
  },
  required: [
    'type',
  ],
  additionalProperties: false,
};
