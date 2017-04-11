module.exports = function(sequelize, DataTypes){
  var Event = sequelize.define("Event", {
    message: DataTypes.STRING,
    code: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models){
        Event.belongsTo(models.Lot, {
          onDelete: "CASCADE",
          foreignKey: {allowNull: false}
        });
      }
    }
  });

  return Event;
};
