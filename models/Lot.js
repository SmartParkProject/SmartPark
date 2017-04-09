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
        Lot.hasMany(models.Infraction);
        Lot.belongsToMany(models.User, {through: models.Permission});
      }
    },
    instanceMethods: {
      checkPermissions:function(id, level){
        return this.getUsers({where:{id:id}, through: {where:{level: {$lte: level}}}}).then(function(users){
          return users.length == 1;
        });
      }
    }
  });
  return Lot;
};
