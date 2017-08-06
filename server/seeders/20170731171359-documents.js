module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Documents',
    [
      {
        title: 'Admin Article',
        content: 'This is admin article',
        access: 'private',
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'DocMan User Article',
        content: 'This is DocMan User article',
        access: 'private',
        userId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'DocMan User Second Article',
        content: 'This is DocMan User Second article',
        access: 'public',
        userId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'DocMan User Third Article',
        content: 'This is DocMan User Third article',
        access: 'role',
        userId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    {}),

  down: queryInterface => queryInterface.bulkDelete('Documents', null, {})
};
