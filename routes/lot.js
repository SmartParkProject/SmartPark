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
    "minimum":1
  },
  "required":["name", "lat", "lng", "spots", "image_data", "lot_data", "spot_data", "token"]
};

var router = express.Router();

router.get("/:id(\\d+)/available", function(req, res, next){
  req.params.id = parseInt(req.params.id);

  models.Lot.findOne({where: {id:req.params.id}}).then(function(lot){
    if(!lot)
      return next(new error.BadRequest("No lot with id: " + req.params.id));

    if(lot.spots < 1)
      return next(new error.Internal("Requested lot is missing spot definition."));

    var converted_array = new Array(lot.spots);
    for(var i = 0; i < lot.spots; i++){
      converted_array[i] = 1;
    }
    lot.getTransactions().then(function(transactions){
      for(var item in transactions){
        converted_array[transactions[item].spot] = 0;
      }
      res.json({status:200, result:converted_array, count:converted_array.reduce((a, b) => a + b)});
    }).catch(next);
  }).catch(next);
});

router.post("/:id(\\d+)/infractions", auth, function(req, res, next){
  req.params.id = parseInt(req.params.id);

  models.Lot.findOne({where: {id:req.params.id}}).then(function(lot){
    if(!lot)
      return next(new error.BadRequest("No lot with id: " + req.params.id));

    lot.checkPermissions(req.token_data.userid, 1).then(function(authorized){
      if(!authorized)
        return next(new error.Forbidden("User does not have permissions for lot."));

      lot.getInfractions().then(function(infractions){
        if(infractions.length < 1) return next(new error.NotFound("No infractions for lot."));
        res.json({status:200, result:infractions});
      });
    });
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

router.post("/:id(\\d+)/", auth, function(req, res, next){
  req.params.id = parseInt(req.params.id);
  var data = req.body;
  var valid = ajv.validate(lotSchema, data);
  if(!valid)
    return next(new error.BadRequest("Bad parameter: " + ajv.errorsText()));

  if(Math.abs(parseFloat(data.lat)) > 90 || Math.abs(parseFloat(data.lng)) > 180){
    return next(new error.BadRequest("Lat/Long out of range."));
  }

  var attributes = {
    name: data.name,
    lat: parseFloat(data.lat),
    lng: parseFloat(data.lng),
    spots: data.spots,
    image_data: data.image_data,
    lot_data: data.lot_data,
    spot_data: data.spot_data
  }
  models.Lot.findOne({where:{id:req.params.id}}).then(function(lot){
    lot.checkPermissions(req.token_data.userid, 0).then(function(authorized){
      if(!authorized)
        return next(new error.Forbidden("User does not have permissions for lot."));
      lot.update(attributes).then(function(lot){
        res.status(200);
        res.json({status:"200", result:"Lot updated.", id:lot.id});
      });
    });
  });
});

router.post("/", auth, function(req, res, next){
  var data = req.body;
  var valid = ajv.validate(lotSchema, data);
  if(!valid)
    return next(new error.BadRequest("Bad parameter: " + ajv.errorsText()));

  if(Math.abs(parseFloat(data.lat)) > 90 || Math.abs(parseFloat(data.lng)) > 180){
    return next(new error.BadRequest("Lat/Long out of range."));
  }

  var attributes = {
    name: data.name,
    lat: parseFloat(data.lat),
    lng: parseFloat(data.lng),
    spots: data.spots,
    image_data: data.image_data,
    lot_data: data.lot_data,
    spot_data: data.spot_data
  }
  models.User.findOne({where: {id: req.token_data.userid}}).then(function(user){
    if(!user) return next(new error.BadRequest());
    models.Lot.create(attributes).then(function(lot){
      lot.addUser(user, {level: 0}).then(function(){
        res.json({status:"201", result:"Lot created.", id:lot.id});
      });
    });
  });
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
