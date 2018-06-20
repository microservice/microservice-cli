const Lifecycle = require('../../src/Lifecycle');

describe('Https.js', () => {
  describe('.startup', () => {
    test('gets the startup', () => {
      const l = new Lifecycle({
        run: {
          command: ['node', 'app.js', 'foo'],
          port: 5000,
        },
        startup: {
          command: 'go',
          timeout: 100,
          method: 'run_once',
        },
      });

      expect(l.startup).toEqual({
        command: 'go',
        timeout: 100,
        method: 'run_once',
      });
    });
  });

  describe('.run', () => {
    test('gets the run', () => {
      const l = new Lifecycle({
        run: {
          command: ['node', 'app.js', 'foo'],
          port: 5000,
        },
      });

      expect(l.run).toEqual({
        command: 'node',
        args: 'app.js foo ',
        port: 5000,
      });
    });
  });

  describe('.shutdown', () => {
    test('gets the shutdown', () => {
      const l = new Lifecycle({
        run: {
          command: ['node', 'app.js', 'foo'],
          port: 5000,
        },
        shutdown: {
          command: 'bye',
          timeout: 100,
          method: 'run_many',
        },
      });

      expect(l.shutdown).toEqual({
        command: 'bye',
        timeout: 100,
        method: 'run_many',
      });
    });
  });
});
