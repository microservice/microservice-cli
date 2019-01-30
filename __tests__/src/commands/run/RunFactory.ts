import RunFactory from '../../../../src/commands/run/RunFactory';
import FormatRun from '../../../../src/commands/run/FormatRun';
import Microservice from '../../../../src/models/Microservice';
import Action from '../../../../src/models/Action';
import EventRun from '../../../../src/commands/run/EventRun';
import HttpRun from '../../../../src/commands/run/HttpRun';

describe('RunFactory.ts', () => {
  describe('.getRun', () => {
    test('gets a FormatRun', () => {
      const rawFormatAction = {
        format: {
          command: ['foo.sh'],
        },
      };
      const m = new Microservice({
        omg: 1,
        info: {
          version: '1.0.0',
          title: 'test',
          description: 'for tests',
        },
        actions: {
          foo: rawFormatAction,
        },
      });
      const formatRun = new RunFactory('dockerImage', m, {}, {}).getRun(new Action('foo', rawFormatAction));

      expect(formatRun.constructor.name).toBe('FormatRun');
      expect(formatRun).toEqual(new FormatRun('dockerImage', m, {}, {}));
    });

    test('gets an HttpRun', () => {
      const rawHttpAction = {
        http: {
          method: 'post',
          path: '/foo',
          port: 5000,
        },
      };
      const m = new Microservice({
        omg: 1,
        info: {
          version: '1.0.0',
          title: 'test',
          description: 'for tests',
        },
        actions: {
          foo: rawHttpAction,
        },
        lifecycle: {
          startup: {
            command: ['startup.sh'],
          },
        },
      });
      const httpRun = new RunFactory('dockerImage', m, {}, {}).getRun(new Action('foo', rawHttpAction));

      expect(httpRun.constructor.name).toBe('HttpRun');
      expect(httpRun).toEqual(new HttpRun('dockerImage', m, {}, {}));
    });

    test('gets an EventRun', () => {
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
        info: {
          version: '1.0.0',
          title: 'test',
          description: 'for tests',
        },
        actions: {
          foo: rawEventAction,
        },
      });
      const eventRun = new RunFactory('dockerImage', m, {}, {}).getRun(new Action('foo', rawEventAction));

      expect(eventRun.constructor.name).toBe('EventRun');
      expect(eventRun).toEqual(new EventRun('dockerImage', m, {}, {}));
    });
  });
});
