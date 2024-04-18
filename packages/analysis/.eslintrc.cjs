const baseConfig = require("../../.eslintrc.cjs");
module.exports = {
  ...baseConfig,
  extends: [...baseConfig.extends, "next/core-web-vitals"],
};
