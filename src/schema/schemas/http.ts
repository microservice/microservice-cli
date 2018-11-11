module.exports = {
  type: 'object',
  properties: {
    method: {
      type: 'string',
      enum: [
        'get',
        'post',
        'put',
        'delete',
        'patch',
      ],
    },
    port: {
      type: 'integer',
    },
    path: {
      type: 'string',
      pattern: '^/.*',
    },
    contentType: {
      type: 'string',
    },
  },
  required: [
    'method',
    'port',
    'path',
  ],
  additionalProperties: false,
};
