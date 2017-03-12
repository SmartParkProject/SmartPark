var express = require("express"),
    Ajv = require("ajv"),
    GeoPoint = require("geopoint");

var config = require("../config"),
    error = require("../utilities/error"),
    models = require("../models");

var ajv = new Ajv();
var searchSchema = {
  "properties":{
    "lat":{
      "type":"string"
    },
    "lng":{
      "type":"string"
    },
    "distance":{
      "type":"integer",
      "minimum":10,
      "maximum":100
    }
  },
  "required":["lat", "lng", "distance"]
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

router.post("/search", function(req, res, next){
  var data = req.body;
  var valid = ajv.validate(searchSchema, data);
  if(!valid)
    return next(new error.BadRequest("Bad parameter: " + ajv.errorsText()));

  var lat = parseFloat(data.lat);
  var lng = parseFloat(data.lng);
  if(isNaN(lat) || isNaN(lng))
    return next(new error.BadRequest("Incorrect format for latitude or longitude"));

  var distance = data.distance;
  var gp = new GeoPoint(lat, lng);
  var bounds = gp.boundingCoordinates(distance);
  var searchParams = {
    lat:{
      $between:[bounds[0].latitude(), bounds[1].latitude()]
    },
    lng:{
      $between:[bounds[0].longitude(), bounds[1].longitude()]
    }
  };
  models.Lot.findAll({attributes:["id", "name", "lat", "lng", "spots"], where: searchParams}).then(function(lots){
    if(lots.length < 1)
      return next(new error.NotFound("No lots matching search criteria"));

    res.json({status:200, result:lots});
  }).catch(next);
});

module.exports = router;
