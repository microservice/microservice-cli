export default {
  type: 'object',
  properties: {
    method: {
      type: 'string',
      enum: ['get', 'post', 'put', 'delete', 'patch'],
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
      enum: ['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data'],
    },
  },
  required: ['method', 'port', 'path'],
  additionalProperties: false,
}
