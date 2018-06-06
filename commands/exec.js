const Microservice = require('../src/Microservice');
const { parseArgs } = require('../lib/utils');

function exec(command, args) {
  const argsObj = parseArgs(args);
  const microservice = new Microservice('/Users/tomped/Desktop/test.yml');

  // console.log(microservice.getCommand('sms'));
  console.log(microservice);
  return 'hi';
}

module.exports = exec;
