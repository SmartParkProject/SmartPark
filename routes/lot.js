var express = require("express"),
    Ajv = require("ajv"),
    GeoPoint = require("geopoint");

var config = require("../config"),
    error = require("../utilities/error"),
    auth = require("../utilities/authenticator"),
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

var lotSchema = {
  "name":{
    "type":"string"
  },
  "lat":{
    "type":"string"
  },
  "lng":{
    "type":"string"
  },
  "spots":{
    "type":"integer",
    "minimum":0
  },
  "required":["name", "lat", "lng", "spots", "image_data", "lot_data", "spot_data", "token"]
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
    }).catch(next);
  }).catch(next);
});

router.get("/:id(\\d+)/", function(req, res, next){
  req.params.id = parseInt(req.params.id);

  var attributes = [
    "name",
    "lat",
    "lng",
    "spots",
    "image_data",
    "spot_data"
  ];

  models.Lot.findOne({where: {id:req.params.id}, attributes: attributes}).then(function(lot){
    if(!lot)
      return next(new error.BadRequest("No lot with id: " + req.params.id));

    res.status(200);
    res.json({status:"200", result:lot});
  }).catch(next);
});

router.post("/", auth, function(req, res, next){
  var data = req.body;
  var valid = ajv.validate(lotSchema, data);
  if(!valid)
    return next(new error.BadRequest("Bad parameter: " + ajv.errorsText()));

  var attributes = {
    name: data.name,
    lat: parseFloat(data.lat),
    lng: parseFloat(data.lng),
    spots: data.spots,
    image_data: data.image_data,
    lot_data: data.lot_data,
    spot_data: data.spot_data,
    UserId: req.token_data.userid
  }

  models.Lot.findOrCreate({where:{UserId: req.token_data.userid}, defaults: attributes})
  .spread(function(lot, created){
    if(created){
      res.status(201);
      res.json({status:"201", result:"Lot created.", id:lot.id});
    }else{
      lot.update(attributes).then(function(){
        res.status(200);
        res.json({status:"200", result:"Lot updated.", id:lot.id});
      }).catch(next);
    }
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
