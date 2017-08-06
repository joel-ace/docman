const bcrypt = require('bcrypt');

module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Users',
    [
      {
        fullname: 'Docman Admin',
        password: bcrypt.hashSync('password', 10),
        email: 'admin@docman.com',
        roleId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        fullname: 'Docman User',
        password: bcrypt.hashSync('password1', 10),
        email: 'user1@docman.com',
        roleId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        fullname: 'Second User',
        password: bcrypt.hashSync('password2', 10),
        email: 'user2@docman.com',
        roleId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ],
    {}),

  down: queryInterface => queryInterface.bulkDelete('Users', null, {})
};
