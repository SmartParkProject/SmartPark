/*
* NOTE: Should mirror the Transaction model. This may not be an ideal solution,
* but I couldn't find a better way to handle archiving with sequelize.
*/
module.exports = function(sequelize, DataTypes) {
  var ArchivedTransaction = sequelize.define("ArchivedTransaction", {
    spot: DataTypes.INTEGER,
    reserve_time: DataTypes.DATE,
    LotId: DataTypes.INTEGER,
    UserId: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },{
    createdAt: "archivedAt",
    updatedAt: false
  });

  return ArchivedTransaction;
};
