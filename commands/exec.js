const { parseArgs, areRequiredArgumentsSuppied } = require('../lib/utils');

function exec(command, args) {
  const argsObj = parseArgs(args);
  const bool = areRequiredArgumentsSuppied();
  console.log(argsObj);
  console.log(bool);
  return 'hi';
}

module.exports = exec;
