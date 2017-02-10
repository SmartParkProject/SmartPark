var express = require("express"),
    Ajv = require("ajv"),
    jwt = require("jsonwebtoken");

var config = require("../config"),
    error = require("../utilities/error"),
    models = require("../models");

var ajv = new Ajv();
var transactionSchema = {
  "properties":{
    "spot":{"$ref":"/parkingspot"},
    "token":{
      "type":"string"
    }
  },
  "required":["spot", "token"]
};

var useridSchema = {
  "type":"string",
  "minLength":15,
  "maxLength":15
};

var parkingspotSchema = {
  "type":"integer",
  "minimum":0,
  "maximum":config.max_parking_spots
};

ajv.addSchema(parkingspotSchema, "/parkingspot");
ajv.addSchema(useridSchema, "/userid");

var router = express.Router();

router.post("/", function(req, res, next){
  var data = req.body;
  var valid = ajv.validate(transactionSchema, data);
  if(!valid)
    return next(new error.BadRequest("Bad parameter: " + ajv.errorsText()));

  //Verify token and get user id.
  var token_data;
  try{
    token_data = jwt.verify(data.token, config.secret);
  }catch(e){
    return next(new error.Unauthorized("Token error: " + e.message));
  }
  models.Transaction.findAll({include: [models.User]}).then(function(transactions){
    if(transactions.find(a => a.spot == data.spot))
      throw new error.Conflict("Transaction already exists for parking spot with id: " + data.spot);

    if(transactions.find(a => a.User.id == token_data.userid))
      throw new error.Conflict("Transaction already exists for user.");

    models.Transaction.create({spot: data.spot, reserve_time: new Date(), UserId: token_data.userid}).then(function(transaction){
      res.status(201);
      res.json({status:"201", result:"Successfully checked-out parking spot."});
    });
  }).catch(next);
});

router.get("/available", function(req, res, next){
  var converted_array = new Array(config.max_parking_spots);
  for(var i = 0; i < config.max_parking_spots; i++){
    converted_array[i] = 1;
  }
  models.Transaction.findAll().then(function(transactions){
    for(var item in transactions){
      converted_array[transactions[item].spot] = 0;
    }
    res.json({status:200, result:converted_array, count:converted_array.reduce((a, b) => a + b)});
  });
});

router.get("/available/:id(\\d+)/", function(req, res, next){
  req.params.id = parseInt(req.params.id);
  var valid = ajv.validate(parkingspotSchema, req.params.id);
  if(!valid)
    return next(new error.BadRequest("Bad request: " + ajv.errorsText()));

  models.Transaction.findOne({where: {spot: req.params.id}}).then(function(transaction){
    if(transaction){
      res.json({status:200, result:0});
    }else{
      res.json({status:200, result:1});
    }
  });
});

router.post("/status", function(req, res, next){
  var data = req.body;
  if(!data.token)
    return next(new error.BadRequest("No token provided."));

  var token_data;
  try{
    token_data = jwt.verify(data.token, config.secret);
  }catch(e){
    return next(new error.Unauthorized("Token error: " + e.message));
  }

  models.User.findOne({where: {id: token_data.userid}, include: [models.Transaction]}).then(function(user){
    if(user.Transaction){ //For some reason this "Transaction" needs to be capitalized
      res.status(200);
      res.json({status:200, result:user.transaction});
    }else{
      throw new error.NotFound("No transactional information for user.");
    }
  }).catch(next);
});

module.exports = router;
