module.exports = function(sequelize, DataTypes) {
  var Lot = sequelize.define("Lot", {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      lat: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: false
      },
      lng: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false
      },
      spots: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      image_data: {
        type: DataTypes.TEXT("medium"),
        allowNull: false
      },
      lot_data: {
        type: DataTypes.TEXT("medium"),
        allowNull: false
      },
      spot_data: {
        type: DataTypes.TEXT("medium"),
        allowNull: false
      }
  }, {
    classMethods: {
      associate: function(models) {
        Lot.belongsTo(models.User, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
      }
    }
  });
  return Lot;
};
