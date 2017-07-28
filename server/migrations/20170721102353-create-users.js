module.exports = {
  up: (queryInterface, Sequelize) => (
    queryInterface.createTable('Users', {
      userId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fullname: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      roleId: {
        onDelete: 'CASCADE',
        type: Sequelize.INTEGER,
        references: {
          model: 'Roles',
          key: 'roleId',
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
    queryInterface.dropTable('Users')
  )
};
