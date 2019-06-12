module.exports = {
  type: 'object',
  properties: {
    interval: {
      type: ['string', 'integer'],
      pattern: '^[0-9]+(ms|s)$'
    },
    timeout: {
      type: ['string', 'integer'],
      pattern: '^[0-9]+(ms|s)$'
    },
    start_period: {
      type: ['string', 'integer'],
      pattern: '^[0-9]+(ms|s)$'
    },
    retries: {
      type: 'integer',
      minimum: 0
    },
    command: {
      type: 'string'
    }
  },
  required: ['command'],
  additionalProperties: false
}
