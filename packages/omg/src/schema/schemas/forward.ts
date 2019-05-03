module.exports = {
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
      }
    }
  }
}
