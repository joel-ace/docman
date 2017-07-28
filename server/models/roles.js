export default (sequelize, DataTypes) => {
  const Roles = sequelize.define('Roles', {
    name: DataTypes.STRING,
    description: DataTypes.STRING
  });

  Roles.associate = (models) => {
    Roles.hasMany(models.Users, {
      foreignKey: 'roleId',
    });
    Roles.hasMany(models.Documents, {
      foreignKey: 'access',
    });
  };
  return Roles;
};
