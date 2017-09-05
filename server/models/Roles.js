export default (sequelize, DataTypes) => {
  const Roles = sequelize.define('Roles', {
    roleId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true
    },
  });

  Roles.associate = (models) => {
    Roles.hasMany(models.Users, {
      foreignKey: 'roleId',
      onDelete: 'cascade',
    });
  };
  return Roles;
};
