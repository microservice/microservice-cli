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
          'map',
          'boolean',
          'object',
          'path',
          'any',
        ],
      },
      pattern: '^(number|int|float|string|uuid|list|map|boolean|path|any|object)$',
    },
    pattern: {
      type: 'string',
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
      ],
    },
    help: {
      type: 'string',
    },
  },
  required: [
    'type',
  ],
  additionalProperties: false,
};
