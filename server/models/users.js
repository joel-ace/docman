export default (sequelize, DataTypes) => {
  const Users = sequelize.define('Users', {
    userId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    fullname: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    password: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    email: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true,
    },
    roleId: {
      allowNull: false,
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
