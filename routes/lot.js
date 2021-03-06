var express = require("express"),
    Ajv = require("ajv"),
    GeoPoint = require("geopoint");

var error = require("../utilities/error"),
    auth = require("../utilities/authenticator"),
    models = require("../models");

var ajv = new Ajv();
var searchSchema = {
  "properties": {
    "lat": {"type": "string"},
    "lng": {"type": "string"},
    "distance": {
      "type": "integer",
      "minimum": 10,
      "maximum": 100
    }
  },
  "required": ["lat", "lng", "distance"]
};

var userSchema = {
  "username": {"type": "string"},
  "level": {"type": "integer"},
  "required": ["username", "level"]
};

var lotSchema = {
  "name": {"type": "string"},
  "lat": {"type": "string"},
  "lng": {"type": "string"},
  "spots": {
    "type": "integer",
    "minimum": 1
  },
  "required": ["name", "lat", "lng", "spots", "image_data", "lot_data", "spot_data", "token"]
};

var router = express.Router();

router.get("/:id(\\d+)/available", function(req, res, next){
  req.params.id = parseInt(req.params.id);

  models.Lot.findOne({where: {id: req.params.id}}).then(function(lot){
    if(!lot)
      return next(new error.BadRequest("No lot with id: " + req.params.id));

    if(lot.spots < 1)
      return next(new error.Internal("Requested lot is missing spot definition."));

    var converted_array = new Array(lot.spots);
    for(var i = 0; i < lot.spots; i++)
      converted_array[i] = 1;

    lot.getTransactions().then(function(transactions){
      for(var item in transactions)
        converted_array[transactions[item].spot] = 0;

      res.json({
        status: 200,
        result: converted_array,
        count: converted_array.reduce((a, b) => a + b)
      });
    }).catch(next);
  }).catch(next);
});

router.post("/:id(\\d+)/infractions", auth, function(req, res, next){
  req.params.id = parseInt(req.params.id);

  models.Lot.getIfAuthorized(req.params.id, req.token_data.userid, 1).then(function(lot){
    lot.getInfractions().then(function(infractions){
      if(infractions.length < 1)
        return next(new error.NotFound("No infractions for lot."));

      res.json({
        status: 200,
        result: infractions
      });
    });
  }).catch(next);
});

router.post("/:id(\\d+)/events", auth, function(req, res, next){
  req.params.id = parseInt(req.params.id);

  models.Lot.getIfAuthorized(req.params.id, req.token_data.userid, 1).then(function(lot){
    lot.getEvents().then(function(events){
      if(events.length < 1)
        return next(new error.NotFound("No events for lot."));

      res.json({
        status: 200,
        result: events
      });
    });
  }).catch(next);
});

router.post("/:id(\\d+)/users", auth, function(req, res, next){
  req.params.id = parseInt(req.params.id);

  models.Lot.getIfAuthorized(req.params.id, req.token_data.userid, 0).then(function(lot){
    models.Permission.findAll({
      where: {LotId: lot.id},
      include: {
        model: models.User,
        attributes: ["username"]
      }
    }).then(function(permissions){
      if(permissions.length < 1)
        return next(new error.NotFound("No permissions for lot."));

      res.json({
        status: 200,
        result: permissions
      });
    });
  }).catch(next);
});

router.post("/:id(\\d+)/user", auth, function(req, res, next){
  req.params.id = parseInt(req.params.id);
  var data = req.body;
  var valid = ajv.validate(userSchema, data);
  if(!valid)
    return next(new error.BadRequest("Bad parameter: " + ajv.errorsText()));

  if(data.level === -1){
    models.User.findOne({where: {username: data.username}}).then(function(user){
      if(!user)
        return next(new error.NotFound("User does not exist."));

      models.Permission.findOne({
        where: {
          LotId: req.params.id,
          UserId: user.id
        }
      }).then(function(permission){
        if(!permission)
          return next(new error.NotFound("User has no permissions."));
        permission.destroy().then(function(){
          res.json({
            status: 200,
            result: "Updated permission."
          });
        });
      });
    });
    return;
  }
  models.Lot.getIfAuthorized(req.params.id, req.token_data.userid, 0).then(function(lot){
    models.User.findOne({where: {username: data.username}}).then(function(user){
      if(!user)
        return next(new error.NotFound("User does not exist"));

      lot.addUser(user, {level: data.level}).then(function(){
        res.json({
          status: "200",
          result: "Updated permission.",
          id: lot.id
        });
      });
    });
  }).catch(next);
});

router.post("/:id(\\d+)/event/:id2(\\d+)/resolve", auth, function(req, res, next){
  var lotid = parseInt(req.params.id);
  var eventid = parseInt(req.params.id2);

  models.Lot.getIfAuthorized(lotid, req.token_data.userid, 1).then(function(lot){
    lot.getEvents({where: {id: eventid}}).then(function(events){
      if(events.length < 1)
        return next(new error.NotFound("No event with id: " + eventid));
      else if(events.length > 1)
        return next(new error.Internal());

      events[0].destroy().then(function(rows){
        if(rows === 0)
          return next(new error.Internal());

        res.json({
          status: 200,
          result: "Event resolved."
        });
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

  models.Lot.findOne({
    where: {id: req.params.id},
    attributes: attributes
  }).then(function(lot){
    if(!lot)
      return next(new error.BadRequest("No lot with id: " + req.params.id));

    res.status(200);
    res.json({
      status: "200",
      result: lot
    });
  }).catch(next);
});

router.post("/:id(\\d+)/", auth, function(req, res, next){
  req.params.id = parseInt(req.params.id);
  var data = req.body;
  var valid = ajv.validate(lotSchema, data);
  if(!valid)
    return next(new error.BadRequest("Bad parameter: " + ajv.errorsText()));

  if(Math.abs(parseFloat(data.lat)) > 90 || Math.abs(parseFloat(data.lng)) > 180)
    return next(new error.BadRequest("Lat/Long out of range."));

  var attributes = {
    name: data.name,
    lat: parseFloat(data.lat),
    lng: parseFloat(data.lng),
    spots: data.spots,
    image_data: data.image_data,
    lot_data: data.lot_data,
    spot_data: data.spot_data
  };
  models.Lot.getIfAuthorized(req.params.id, req.token_data.userid, 0).then(function(lot){
    lot.update(attributes).then(function(lot){
      res.status(200);
      res.json({
        status: "200",
        result: "Lot updated.",
        id: lot.id
      });
    });
  }).catch(next);
});

router.post("/", auth, function(req, res, next){
  var data = req.body;
  var valid = ajv.validate(lotSchema, data);
  if(!valid)
    return next(new error.BadRequest("Bad parameter: " + ajv.errorsText()));

  if(Math.abs(parseFloat(data.lat)) > 90 || Math.abs(parseFloat(data.lng)) > 180)
    return next(new error.BadRequest("Lat/Long out of range."));

  var attributes = {
    name: data.name,
    lat: parseFloat(data.lat),
    lng: parseFloat(data.lng),
    spots: data.spots,
    image_data: data.image_data,
    lot_data: data.lot_data,
    spot_data: data.spot_data
  };
  models.User.findOne({where: {id: req.token_data.userid}}).then(function(user){
    if(!user)
      return next(new error.BadRequest());

    models.Lot.create(attributes).then(function(lot){
      lot.addUser(user, {level: 0}).then(function(){
        res.json({
          status: "201",
          result: "Lot created.",
          id: lot.id
        });
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
    lat: {$between: [bounds[0].latitude(), bounds[1].latitude()]},
    lng: {$between: [bounds[0].longitude(), bounds[1].longitude()]}
  };
  models.Lot.findAll({
    attributes: ["id", "name", "lat", "lng", "spots"],
    where: searchParams
  }).then(function(lots){
    if(lots.length < 1)
      return next(new error.NotFound("No lots matching search criteria"));

    // Get availability for each lot.
    var requests = [];
    for(let i = 0; i < lots.length; i++)
      requests.push(lots[i].getAvailable().then(function(available){
        lots[i] = lots[i].get({plain: true});
        lots[i].available = available;
      }));

    Promise.all(requests).then(function(){
      res.json({
        status: 200,
        result: lots
      });
    }).catch(next);
  }).catch(next);
});

module.exports = router;
