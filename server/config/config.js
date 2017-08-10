require('dotenv').config();

module.exports = {
  development: {
    use_env_variable: 'DEV_DATABASE',
    dialect: 'postgres',
  },
  test: {
    use_env_variable: 'TEST_DATABASE',
    dialect: 'postgres',
  },
  production: {
    use_env_variable: 'PRODUCTION_DB',
    dialect: 'postgres',
  }
};
