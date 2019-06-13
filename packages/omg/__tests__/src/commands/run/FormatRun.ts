import * as sinon from 'sinon';
import FormatRun from '../../../../src/commands/run/FormatRun';
import Microservice from '../../../../src/models/Microservice';
import * as utils from '../../../../src/utils';

describe('FormatRun.ts', () => {
  beforeEach(() => {
    sinon.stub(utils, 'getOpenPort').callsFake(async () => 5555);
  });

  afterEach(() => {
    (utils.getOpenPort as any).restore();
  });

  describe('.startService()', () => {
    let utilsDockerCreateContainer;

    beforeEach(() => {
      utilsDockerCreateContainer = sinon.stub(utils.docker, 'createContainer').callsFake(async (data) => {
        return {
          $subject: {
            id: 'fake_docker_id',
          },
          start: () => {},
        };
      });
    });

    afterEach(() => {
      (utils.docker.createContainer as any).restore();
    });

    test('starts service with dev null default', async () => {
      const containerID = await new FormatRun('fake_docker_id', new Microservice({
        omg: 1,
        info: {
          version: '1.0.0',
          title: 'test',
          description: 'for tests',
        },
        health: {
          http: {
            path: '/health',
            port: 5000
          }
        },
        actions: {
          test: {
            format: {
              command: 'test.sh',
            },
            output: {type: 'string'},
          },
        },
      }), {}, {}).startService();

      expect(utilsDockerCreateContainer.calledWith({
        Image: 'fake_docker_id',
        Cmd: ['tail', '-f', '/dev/null'],
        Env: [],
      })).toBeTruthy();
      expect(containerID).toBe('fake_docker_id');
    });

    test('starts service with lifecycle', async () => {
      const containerID = await new FormatRun('fake_docker_id', new Microservice({
        omg: 1,
        info: {
          version: '1.0.0',
          title: 'test',
          description: 'for tests',
        },
        health: {
          http: {
            path: '/health',
            port: 5000
          }
        },
        actions: {
          test: {
            format: {
              command: 'test.sh',
            },
            output: {type: 'string'},
          },
        },
        lifecycle: {
          startup: {
            command: ['node', 'start.js'],
          },
        },
      }), {}, {}).startService();

      expect(utilsDockerCreateContainer.calledWith({
        Image: 'fake_docker_id',
        Cmd: ['node', 'start.js'],
        Env: [],
      })).toBeTruthy();
      expect(containerID).toBe('fake_docker_id');
    });
  });

  describe('.isRunning()', () => {
    let utilsDockerGetContainer;

    beforeEach(() => {
      utilsDockerGetContainer = sinon.stub(utils.docker, 'getContainer').callsFake((container) => {
        return {
          inspect: async () => {
            return {
              State: {
                Running: false,
              },
            };
          },
        };
      });
    });

    afterEach(() => {
      (utils.docker.getContainer as any).restore();
    });

    test('not running', async () => {
      expect(await new FormatRun('fake_docker_id', new Microservice({
        omg: 1,
        info: {
          version: '1.0.0',
          title: 'test',
          description: 'for tests',
        },
        health: {
          http: {
            path: '/health',
            port: 5000
          }
        },
        actions: {
          test: {
            format: {
              command: 'test.sh',
            },
            output: {type: 'string'},
          },
        },
        lifecycle: {
          startup: {
            command: ['node', 'start.js'],
          },
        },
      }), {}, {}).isRunning()).toBeFalsy();
    });

    test('running', async () => {
      (utils.docker.getContainer as any).restore();
      utilsDockerGetContainer = sinon.stub(utils.docker, 'getContainer').callsFake((container) => {
        return {
          inspect: async () => {
            return {
              State: {
                Running: true,
              },
            };
          },
        };
      });

      expect(await new FormatRun('fake_docker_id', new Microservice({
        omg: 1,
        info: {
          version: '1.0.0',
          title: 'test',
          description: 'for tests',
        },
        health: {
          http: {
            path: '/health',
            port: 5000
          }
        },
        actions: {
          test: {
            format: {
              command: 'test.sh',
            },
            output: {type: 'string'},
          },
        },
        lifecycle: {
          startup: {
            command: ['node', 'start.js'],
          },
        },
      }), {}, {}).isRunning()).toBeTruthy();
    });
  });

  describe('.exec(action)', () => {
    test('throws an exception because not all required arguments are supplied', async () => {
      try {
        await new FormatRun('fake_docker_id', new Microservice({
          omg: 1,
          info: {
            version: '1.0.0',
            title: 'test',
            description: 'for tests',
          },
          health: {
            http: {
              path: '/health',
              port: 5000
            }
          },
          actions: {
            tom: {
              format: {
                command: 'tom.sh',
              },
              arguments: {
                foo: {
                  type: 'string',
                  required: true,
                },
              },
            },
          },
        }), {}, {}).exec('tom');
      } catch (e) {
        expect(e).toBe('Need to supply required arguments: `foo`');
      }
    });

    test('throws an exception because not all required environment variables are supplied', async () => {
      try {
        await new FormatRun('fake_docker_id', new Microservice({
          omg: 1,
          info: {
            version: '1.0.0',
            title: 'test',
            description: 'for tests',
          },
          health: {
            http: {
              path: '/health',
              port: 5000
            }
          },
          actions: {
            tom: {
              format: {
                command: 'tom.sh',
              },
              arguments: {
                foo: {
                  type: 'float',
                  required: true,
                },
              },
            },
          },
          environment: {
            TOKEN: {
              type: 'string',
              required: true,
            },
          },
        }), {
          foo: '1.1',
        }, {}).exec('tom');
      } catch (e) {
        expect(e).toBe('Need to supply required environment variables: `TOKEN`');
      }
    });
  });
});
