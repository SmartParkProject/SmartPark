var express = require("express"),
    Ajv = require("ajv");

var config = require("../config"),
    error = require("../utilities/error"),
    models = require("../models");

var ajv = new Ajv();
var parkingspotSchema = {
  "type":"integer",
  "minimum":0
};

var router = express.Router();

router.get("/:id(\\d+)/available", function(req, res, next){
  req.params.id = parseInt(req.params.id);

  models.Lot.findOne({where: {id:req.params.id}}).then(function(lot){
    if(!lot)
      return next(new error.BadRequest("No lot with id: " + req.params.id));

    var converted_array = new Array(lot.spots);
    for(var i = 0; i < lot.spots; i++){
      converted_array[i] = 1;
    }
    models.Transaction.findAll({where: {lot:req.params.id}}).then(function(transactions){
      for(var item in transactions){
        converted_array[transactions[item].spot] = 0;
      }
      res.json({status:200, result:converted_array, count:converted_array.reduce((a, b) => a + b)});
    });
  }).catch(next);
});

module.exports = router;
