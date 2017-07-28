module.exports = {
  up: (queryInterface, Sequelize) => (
    queryInterface.createTable('Documents', {
      documentId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      access: {
        allowNull: false,
        type: Sequelize.ENUM,
        references: {
          model: 'Roles',
          key: 'roleId',
        },
        values: ['public', 'private', 'role']
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'userId',
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
    })
  ),
  down: queryInterface => (
    queryInterface.dropTable('Documents')
  )
};
