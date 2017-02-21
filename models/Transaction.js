module.exports = function(sequelize, DataTypes) {
  var Transaction = sequelize.define("Transaction", {
    lot: DataTypes.INTEGER,
    spot: DataTypes.INTEGER,
    reserve_time: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        Transaction.belongsTo(models.User, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
      }
    }
  });

  return Transaction;
};
