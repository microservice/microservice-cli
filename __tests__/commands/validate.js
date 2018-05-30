const fs = require('fs');
const path = require('path');
const YAML = require('yamljs');
const validate = require('../../commands/validate');

describe('schema.js', () => {
  describe('validate(path)', () => {
    test('correctly validates a valid json structure', () => {
      const valid = JSON.parse(validate(path.join(__dirname, '../assets/valid.yml')));
      const jsonOfYaml = YAML.parse(fs.readFileSync(path.join(__dirname, '../assets/valid.yml')).toString());

      expect(valid.valid).toBeTruthy();
      expect(valid.microsericeYaml).toEqual(jsonOfYaml);
      expect(valid.errors).toBeNull();
    });

    test('correctly invalidates an invalid json structure', () => {
      const valid = JSON.parse(validate(path.join(__dirname, '../assets/invalid.yml')));
      const jsonOfYaml = YAML.parse(fs.readFileSync(path.join(__dirname, '../assets/invalid.yml')).toString());

      expect(valid.valid).toBeFalsy();
      expect(valid.microsericeYaml).toEqual(jsonOfYaml);
      expect(valid.errors).toEqual([
        {
          keyword: 'type',
          dataPath: '.metrics.port',
          schemaPath: '#/properties/metrics/properties/port/type',
          params: {
            type: 'integer',
          },
          message: 'should be integer',
        },
      ]);
    });
  });
});
