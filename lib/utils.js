const validator = require('../commands/validate');

// TODO docs list -> object
function parseArgs(args) {
  const dictionary = {};
  for (let i = 0; i < args.length; i += 1) {
    const split = args[i].split(':');
    dictionary[split[0]] = split[1];
  }
  return dictionary;
}

function getRequieredArguemnts() {
  const path = '/Users/tomped/Desktop/test.yml'; // TODO don't hard code this
  const valid = validator(path);
  console.log(valid);
  return true;
}

module.exports = {
  parseArgs,
  areRequiredArgumentsSuppied,
};
