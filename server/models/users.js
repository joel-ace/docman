export default (sequelize, DataTypes) => {
  const Users = sequelize.define('Users', {
    fullname: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    username: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true,
    },
    password: DataTypes.STRING,
    email: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true,
    },
    roleId: {
      type: DataTypes.INTEGER,
    }
  });

  Users.associate = (models) => {
    Users.hasMany(models.Documents, {
      foreignKey: 'userId',
    });
    Users.belongsTo(models.Roles, {
      foreignKey: 'roleId',
      onDelete: 'CASCADE',
    });
  };
  return Users;
};
