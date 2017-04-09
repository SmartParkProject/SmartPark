var express = require("express"),
    Ajv = require("ajv"),
    jwt = require("jsonwebtoken");

var config = require("../config"),
    error = require("../utilities/error"),
    auth = require("../utilities/authenticator"),
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
  "required":["spot", "token", "lot"]
};

var parkingspotSchema = {
  "type":"integer",
  "minimum":0
};

ajv.addSchema(parkingspotSchema, "/parkingspot");

var router = express.Router();

router.post("/", auth, function(req, res, next){
  var data = req.body;
  var valid = ajv.validate(transactionSchema, data);
  if(!valid)
    return next(new error.BadRequest("Bad parameter: " + ajv.errorsText()));

  models.Lot.findOne({where: {id:data.lot}}).then(function(lot){ //Check if lot id is valid
    if(!lot)
      throw new error.BadRequest("No lot with id: " + data.lot);

    if(data.spot > lot.spots)
      throw new error.BadRequest("Spot number out of bounds for lot");

    lot.getTransactions({include: [models.User]}).then(function(transactions){
      if(transactions.find(a => a.spot == data.spot))
        throw new error.Conflict("Transaction already exists for parking spot with id: " + data.spot);

      if(transactions.find(a => a.User.id == req.token_data.userid))
        throw new error.Conflict("Transaction already exists for user.");

      models.Transaction.create({LotId: data.lot, spot: data.spot, reserve_time: new Date(), UserId: req.token_data.userid}).then(function(transaction){
        res.status(201);
        res.json({status:"201", result:"Successfully checked-out parking spot."});
      });
    }).catch(next);
  }).catch(next);
});


router.post("/status", auth, function(req, res, next){
  var data = req.body;
  if(!data.token)
    return next(new error.BadRequest("No token provided."));

  models.User.findOne({where: {id: req.token_data.userid}, include: [models.Transaction]}).then(function(user){
    if(user.Transaction){ //For some reason this "Transaction" needs to be capitalized
      res.status(200);
      res.json({status:200, result:user.Transaction});
    }else{
      throw new error.NotFound("No transactional information for user.");
    }
  }).catch(next);
});

module.exports = router;
