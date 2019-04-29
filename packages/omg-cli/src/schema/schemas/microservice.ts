module.exports = {
  properties: {
    omg: {
      type: 'integer',
    },
    info: {
      type: 'object',
      properties: {
        version: {
          type: 'string',
          pattern: '^\\d+\\.\\d+\\.\\d+$',
        },
        title: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        contact: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
            url: {
              type: 'string',
            },
            email: {
              type: 'string',
            },
          },
          additionalProperties: false,
        },
        license: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
            url: {
              type: 'string',
            },
          },
          required: [
            'name',
            'url',
          ],
          additionalProperties: false,
        },
      },
      required: [
        'version',
        'title',
        'description',
      ],
      additionalProperties: false,
    },
    actions: {
      type: 'object',
      patternProperties: {
        '^[A-Za-z|_]+$': {
          type: 'object',
        },
      },
      additionalProperties: false,
    },
    environment: {
      type: 'object',
      patternProperties: {
        '^[A-Za-z|_]+$': {
          type: 'object',
        },
      },
      additionalProperties: false,
    },
    volumes: {
      type: 'object',
      patternProperties: {
        '^[A-Za-z]+$': {
          type: 'object',
        },
      },
      additionalProperties: false,
    },
    metrics: {
      type: 'object',
      properties: {
        ssl: {
          type: 'boolean',
        },
        port: {
          type: 'integer',
          minimum: 5000,
          maximum: 9000,
        },
        uri: {
          type: 'string',
        },
      },
      required: ['port', 'uri'],
      additionalProperties: false,
    },
    system: {
      type: 'object',
      properties: {
        requests: {
          type: 'object',
          properties: {
            cpu: {
              type: 'integer',
            },
            gpu: {
              type: 'integer',
            },
            memory: {
              type: 'string',
              pattern: '[0-9]+[MB|GB].',
            },
          },
          additionalProperties: false,
        },
        limits: {
          type: 'object',
          properties: {
            cpu: {
              type: 'integer',
            },
            gpu: {
              type: 'integer',
            },
            memory: {
              type: 'string',
              pattern: '[0-9]+[MB|GB].',
            },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    scale: {
      type: 'object',
      properties: {
        metric_type: {
          type: 'string',
          enum: ['cpu', 'mem'],
        },
        metric_agg: {
          type: 'string',
          enum: ['avg', 'min', 'max', 'mean', 'mode'],
        },
        metric_interval: {
          type: 'integer',
          minimum: 1,
          maximum: 600000,
        },
        metric_target: {
          type: 'integer',
          minimum: 1,
        },
        min: {
          type: 'integer',
          minimum: 1,
        },
        max: {
          type: 'integer',
          minimum: 1,
        },
        desired: {
          type: 'integer',
          minimum: 1,
        },
        cooldown: {
          type: 'integer',
          minimum: 1,
        },
      },
      additionalProperties: false,
    },
    lifecycle: {
      type: 'object',
    },
  },
  _comment: 'arguments, commands, environment, lifecycle, and volumes checks are done in their respective constructors. The metrics, system, and scale checks are still done here as there was no need to create a class for those attributes yet.',
  additionalProperties: false,
  required: [
    'omg',
    'info',
  ],
};
