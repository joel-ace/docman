export default (sequelize, DataTypes) => {
  const Documents = sequelize.define('Documents', {
    title: {
      allowNull: false,
      required: true,
      type: DataTypes.STRING,
      unique: true,
    },
    author: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    access: {
      type: DataTypes.INTEGER,
    },
    userId: {
      type: DataTypes.INTEGER,
    },
    roleId: {
      type: DataTypes.INTEGER,
    }
  });

  Documents.associate = (models) => {
    Documents.belongsTo(models.Users, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    });
    Documents.belongsTo(models.Roles, {
      foreignKey: 'roleId',
      onDelete: 'CASCADE'
    });
  };
  return Documents;
};
