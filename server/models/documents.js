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
      values: ['public', 'private', 'role']
    },
    userId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
  });

  Documents.associate = (models) => {
    Documents.belongsTo(models.Users, {
      foreignKey: 'userId',
    });
  };
  return Documents;
};
