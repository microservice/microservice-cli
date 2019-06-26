module.exports = {
  properties: {
    command: {
      type: ['array', 'string'],
      items: {
        type: 'string',
      },
    },
  },
  additionalProperties: false,
  required: ['command'],
};
