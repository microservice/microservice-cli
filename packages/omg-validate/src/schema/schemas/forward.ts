export default {
  type: 'object',
  properties: {
    http: {
      properties: {
        path: {
          type: 'string',
          pattern: '^/.*',
        },
        port: {
          type: 'integer',
        },
      },
      required: ['path', 'port'],
      additionalProperties: false,
    },
  },
  required: ['http'],
  additionalProperties: false,
}
