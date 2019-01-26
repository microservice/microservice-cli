import RunFactory from '../../../../src/commands/run/RunFactory';
import FormatExec from '../../../../src/commands/run/FormatExec';
import Microservice from '../../../../src/models/Microservice';
import Action from '../../../../src/models/Action';
import EventExec from '../../../../src/commands/run/EventExec';
import HttpExec from '../../../../src/commands/run/HttpExec';

describe('RunFactory.ts', () => {
  describe('.getExec', () => {
    test('gets a FormatExec', () => {
      const rawFormatAction = {
        format: {
          command: ['foo.sh'],
        },
      };
      const m = new Microservice({
        omg: 1,
        actions: {
          foo: rawFormatAction,
        },
      });
      const formatExec = new RunFactory('dockerImage', m, {}, {}).getExec(new Action('foo', rawFormatAction));

      expect(formatExec.constructor.name).toBe('FormatExec');
      expect(formatExec).toEqual(new FormatExec('dockerImage', m, {}, {}));
    });

    test('gets an EventExec', () => {
      expect(1).toBe(1);
      const rawEventAction = {
        events: {
          bar: {
            http: {
              port: 5000,
              subscribe: {
                method: 'post',
                path: '/sub',
              },
              unsubscribe: {
                method: 'delete',
                path: '/unsub',
              },
            },
          },
        },
      };
      const m = new Microservice({
        omg: 1,
        actions: {
          foo: rawEventAction,
        },
      });
      const eventExec = new RunFactory('dockerImage', m, {}, {}).getExec(new Action('foo', rawEventAction));

      expect(eventExec.constructor.name).toBe('EventExec');
      expect(eventExec).toEqual(new EventExec('dockerImage', m, {}, {}));
    });

    test('gets an HttpExec', () => {
      const rawHttpAction = {
        http: {
          method: 'post',
          path: '/foo',
          port: 5000,
        },
      };
      const m = new Microservice({
        omg: 1,
        actions: {
          foo: rawHttpAction,
        },
        lifecycle: {
          startup: {
            command: ['startup.sh'],
          },
        },
      });
      const httpExec = new RunFactory('dockerImage', m, {}, {}).getExec(new Action('foo', rawHttpAction));

      expect(httpExec.constructor.name).toBe('HttpExec');
      expect(httpExec).toEqual(new HttpExec('dockerImage', m, {}, {}));
    });
  });
});
