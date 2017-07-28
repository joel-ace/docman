const bcrypt = require('bcrypt');

module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Users', [{
    fullname: 'Docman Admin',
    password: bcrypt.hashSync('password', 10),
    email: 'admin@docman.com',
    roleId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }], {}),

  down: queryInterface => queryInterface.bulkDelete('Users', null, {})
};
