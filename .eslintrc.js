module.exports = {
  extends: ['alloy', 'alloy/typescript'],
  env: {
    // Your environments (which contains several predefined global variables)
    //
    node: true,
    // mocha: true,
    jest: true,
  },
  globals: {
    // Your global variables (setting to false means it's not allowed to be reassigned)
    //
    // myGlobal: false
  },
  rules: {
    // Customize your rules
  },
}
