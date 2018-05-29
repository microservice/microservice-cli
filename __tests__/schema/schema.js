const fs = require('fs');
const path = require('path');
const validate = require('../../schema/schema');

describe('schema.js', () => {
  describe('validate(json)', () => {
    test('correctly validates a valid json structure', () => {
      const validJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/valid.json'), 'utf8'));
      const valid = validate(validJson);

      expect(valid.valid).toBeTruthy();
      expect(valid.microsericeYaml).toBe(validJson);
      expect(valid.errors).toBeNull();
    });

    test('correctly invalidates an invalid json structure', () => {
      const invalidJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/invalid.json'), 'utf8'));
      const valid = validate(invalidJson);

      expect(valid.valid).toBeFalsy();
      expect(valid.microsericeYaml).toBe(invalidJson);
      expect(valid.errors).toEqual([
        {
          keyword: 'type',
          dataPath: '.metrics.port',
          schemaPath: '#/properties/metrics/properties/port/type',
          params: {
            type: 'integer'
          },
          message: 'should be integer'
        }
      ]);
    });
  });
});
