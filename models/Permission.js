module.exports = function(sequelize, DataTypes) {
  var Permission = sequelize.define("Permission", {
    level: DataTypes.INTEGER
  });

  return Permission;
};
