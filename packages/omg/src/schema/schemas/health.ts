module.exports = {
  type: 'object',
  properties: {
    http: {
      properties: {
        path: {
          type: 'string',
          pattern: '^/.*'
        },
        port: {
          type: 'integer'
        }
      },
      required: ['path', 'port']
    }
  },
  required: ['http'],
  additionalProperties: false
}
