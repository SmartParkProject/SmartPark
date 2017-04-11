module.exports = function(sequelize, DataTypes){
  var Transaction = sequelize.define("Transaction", {
    spot: DataTypes.INTEGER,
    reserve_time: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models){
        Transaction.belongsTo(models.User, {
          onDelete: "CASCADE",
          foreignKey: {allowNull: false}
        });
        Transaction.belongsTo(models.Lot, {
          onDelete: "CASCADE",
          foreignKey: {allowNull: false}
        });
      }
    }
  });

  return Transaction;
};
