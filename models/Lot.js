error = require("../utilities/error");

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
        Lot.hasMany(models.Transaction);
        Lot.hasMany(models.Event);
        Lot.belongsToMany(models.User, {through: models.Permission});
      },
      getIfAuthorized: function(lotid, userid, level){
        return Lot.findOne({where: {id:lotid}}).then(function(lot){
          if(!lot) throw new error.NotFound("No lot with id: " + lotid);
          return lot.checkPermissions(userid, level).then(function(authorized){
            if(!authorized) throw new error.Forbidden();
            return lot;
          });
        });
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
