module.exports = function(sequelize, DataTypes){
  var Permission = sequelize.define("Permission", {level: DataTypes.INTEGER}, {
    classMethods: {
      associate: function(models){
        Permission.belongsTo(models.User);
        Permission.belongsTo(models.Lot);
      }
    }
  });

  return Permission;
};
