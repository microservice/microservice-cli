module.exports = {
  type: 'object',
  properties: {
    target: {
      type: 'string',
    },
    persist: {
      type: 'boolean',
    },
  },
  required: [
    'target',
  ],
  additionalProperties: false,
};
