module.exports = function(sequelize, DataTypes){
  var Infraction = sequelize.define("Infraction", {
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    image_data: DataTypes.TEXT("medium") // Storing base64 encoded image
  }, {
    classMethods: {
      associate: function(models){
        Infraction.belongsTo(models.User, {
          onDelete: "CASCADE",
          foreignKey: {allowNull: false}
        });
        Infraction.belongsTo(models.Lot, {
          onDelete: "CASCADE",
          foreignKey: {allowNull: false}
        });
      }
    }
  });

  return Infraction;
};
