module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Roles',
    [{
      name: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'subscriber',
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {}),

  down: queryInterface => queryInterface.bulkDelete('Users', null, {})
};
