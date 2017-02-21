module.exports = function(sequelize, DataTypes) {
  var Lot = sequelize.define("Lot", {
      name: DataTypes.STRING,
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
      }
  });
  return Lot;
};
