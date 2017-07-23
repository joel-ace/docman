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
        unique: true,
        required: true
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      access: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        references: {
          model: 'Roles',
          key: 'roleId',
        }
      },
      userId: {
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
