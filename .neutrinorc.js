const airbnb = require('@neutrinojs/airbnb');
const reactComponents = require('@neutrinojs/react-components');

module.exports = {
  options: {
    root: __dirname,
  },
  use: [
    airbnb(),
    reactComponents(),
  ],
};
