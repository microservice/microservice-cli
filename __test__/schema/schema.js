const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;
const validate = require('../../schema/schema');

describe('schema.js', () => {
  describe('validate(json)', () => {
    it('correctly validates a valid json structure', () => {
      const validJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/valid.json'), 'utf8'));
      const valid = validate(validJson);

      expect(valid.valid).to.be.true;
      expect(valid.microsericeYaml).to.deep.equal(validJson);
      expect(valid.errors).to.equal(null);
    });

    it('correctly invalidates an invalid json structure', () => {
      const invalidJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/invalid.json'), 'utf8'));
      const valid = validate(invalidJson);

      expect(valid.valid).to.be.false;
      expect(valid.microsericeYaml).to.deep.equal(invalidJson);
      expect(valid.errors).to.deep.equal([
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
