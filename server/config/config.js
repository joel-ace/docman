require('dotenv').config();

module.exports = {
  development: {
    username: 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'docman',
    host: '127.0.0.1',
    port: 5432,
    dialect: 'postgres'
  },
  test: {
    username: 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'docman',
    host: '127.0.0.1',
    port: 5432,
    dialect: 'postgres'
  },
  production: {
    username: 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'database_production',
    host: '127.0.0.1',
    port: 5432,
    dialect: 'postgres'
  }
};
