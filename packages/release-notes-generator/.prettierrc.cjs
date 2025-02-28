const baseConfig = require(`${__dirname}/../../.prettierrc.cjs`);

module.exports = {
  ...baseConfig,
  trailingComma: "all",
  tabWidth: 2,
  semi: true,
  singleQuote: false,
};
