module.exports = {
  type: 'object',
  properties: {
    http: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          pattern: '^/.*'
        },
        port: {
          type: 'integer'
        }
      },
      required: ['path', 'port'],
      additionalProperties: false
    }
  },
  required: ['http'],
  additionalProperties: false
}
