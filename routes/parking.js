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
    },
    "lot":{
      "type":"integer",
      "minimum":0
    }
  },
  "required":["spot", "token"]
};

var parkingspotSchema = {
  "type":"integer",
  "minimum":0
};

ajv.addSchema(parkingspotSchema, "/parkingspot");

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
  models.Lot.findOne({where: {id:data.lot}}).then(function(lot){ //Check if lot id is valid
    if(!lot)
      throw new error.BadRequest("No lot with id: " + data.lot);

    if(data.lot > lot.spots)
      throw new error.BadRequest("Spot number out of bounds for lot");

    models.Transaction.findAll({include: [models.User]}).then(function(transactions){
      if(transactions.find(a => a.spot == data.spot && a.lot == data.lot))
        throw new error.Conflict("Transaction already exists for parking spot with id: " + data.spot);

      if(transactions.find(a => a.User.id == token_data.userid))
        throw new error.Conflict("Transaction already exists for user.");

      models.Transaction.create({lot: data.lot, spot: data.spot, reserve_time: new Date(), UserId: token_data.userid}).then(function(transaction){
        res.status(201);
        res.json({status:"201", result:"Successfully checked-out parking spot."});
      });
    }).catch(next);
  }).catch(next);
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
      res.json({status:200, result:user.Transaction});
    }else{
      throw new error.NotFound("No transactional information for user.");
    }
  }).catch(next);
});

module.exports = router;
