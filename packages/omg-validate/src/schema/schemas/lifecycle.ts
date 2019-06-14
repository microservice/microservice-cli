module.exports= {
  type: 'object',
  properties: {
    startup: {
      type: 'object',
      properties: {
        command: {
          type: ['array', 'string'],
          items: {
            type: 'string',
          },
        },
      },
      additionalProperties: false,
    },
    shutdown: {
      type: 'object',
      properties: {
        command: {
          type: ['array', 'string'],
          items: {
            type: 'string',
          },
        },
        timeout: {
          type: 'integer',
          minimum: 0,
        },
      },
      additionalProperties: false,
    },
  },
  oneOf: [
    {
      required: [
        'startup',
      ],
    },
    {
      required: [
        'shutdown',
      ],
    },
  ],
  additionalProperties: false,
};
