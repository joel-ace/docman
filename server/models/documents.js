export default (sequelize, DataTypes) => {
  const Documents = sequelize.define('Documents', {
    documentId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    title: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    access: {
      allowNull: false,
      type: DataTypes.ENUM,
      values: ['public', 'private']
    },
    userId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
  });

  Documents.associate = (models) => {
    Documents.belongsTo(models.Users, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    });
    // Documents.belongsTo(models.Roles, {
    //   foreignKey: 'roleId',
    //   onDelete: 'CASCADE'
    // });
  };
  return Documents;
};
