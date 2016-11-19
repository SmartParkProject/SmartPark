var express = require("express"),
    Ajv = require("ajv"),
    jwt = require("jsonwebtoken");

var config = require("../config"),
    error = require("../utilities/error");

var ajv = new Ajv();
var transactionSchema = {
  "properties":{
    "spot":{"$ref":"/parkingspot"},
    "reserve_length":{
      "type":"integer",
      "minimum":config.min_reserve_length,
      "maximum":config.max_reserve_length
    },
    "token":{
      "type":"string"
    }
  },
  "required":["spot", "reserve_length", "token"]
};

var useridSchema = {
  "type":"string",
  "minLength":15,
  "maxLength":15
}

var parkingspotSchema = {
  "type":"integer",
  "minimum":0,
  "maximum":config.max_parking_spots
}

ajv.addSchema(parkingspotSchema, "/parkingspot");
ajv.addSchema(useridSchema, "/userid");

module.exports = function Parking(database, logger){
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
      return next(new error.BadRequest("Token error: " + e.message));
    }

    database.getConnection(function(err, connection){
      if(err) throw err;
      connection.query("SELECT * FROM transactions", function(err, results){
        if(err) throw err;
        if(results.find(a => a.spot == data.spot))
          return next(new error.Conflict("Transaction already exists for parking spot with id: " + data.spot));

        if(results.find(a => a.userid == token_data.userid))
          return next(new error.Conflict("Transaction already exists for user: " + token_data.userid));

        connection.query("INSERT INTO transactions (userid, spot, reserve_time, reserve_length) VALUES(?, ?, ?, ?)", [token_data.userid, data.spot, new Date(), data.reserve_length], function(err, results){
          connection.release();
          if(err) throw err;
          res.status(201);
          res.json({status:"201", result:"Successfully checked-out parking spot."});
        });
      });
    });
  });

  router.get("/available", function(req, res, next){
    var converted_array = new Array(config.max_parking_spots);
    for(var i = 0; i < config.max_parking_spots; i++){
      converted_array[i] = 1;
    }
    database.getConnection(function(err, connection){
      if(err) throw err;
      connection.query("SELECT * FROM transactions", function(err, results){
        connection.release();
        if(err) throw err;
        for(var item in results){
          converted_array[results[item].spot] = 0;
        }
        res.json({status:200, result:converted_array, count:converted_array.reduce((a, b) => a + b)});
      });
    });
  });

  router.get("/available/:id(\\d+)/", function(req, res, next){
    req.params.id = parseInt(req.params.id);
    var valid = ajv.validate(parkingspotSchema, req.params.id);
    if(!valid)
      return next(new error.BadRequest("Bad request: " + ajv.errorsText()));

    database.getConnection(function(err, connection){
      if(err) throw err;
      connection.query("SELECT * FROM transactions", function(err, results){
        connection.release();
        if(err) throw err;
        if(results.find(a => a.spot == req.params.id)){
          res.json({status:200, result:0});
        }else{
          res.json({status:200, result:1});
        }
      });
    });
  });

  router.get("/spot/:id(\\d+)/", function(req, res, next){
    req.params.id = parseInt(req.params.id);
    var valid = ajv.validate(parkingspotSchema, req.params.id);
    if(!valid)
      return next(new error.BadRequest("Bad request: " + ajv.errorsText()));

    database.getConnection(function(err,connection){
      if(err) throw err;
      connection.query("SELECT reserve_time, reserve_length FROM transactions WHERE spot=?", req.params.id, function(err, results){
        connection.release();
        if(err) throw err;
        if(results[0]){
          res.status(200);
          res.json({status:200, result:results[0]});
        }else{
          next(new error.NotFound("No transactional information for parking spot with id: " + req.params.id));
        }
      });
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
      return next(new error.BadRequest("Token error: " + e.message));
    }

    database.getConnection(function(err,connection){
      if(err) throw err;
      connection.query("SELECT spot, reserve_time, reserve_length FROM transactions WHERE userid=?", token_data.userid, function(err, results){
        connection.release();
        if(err) throw err;
        if(results[0]){
          res.status(200);
          res.json({status:200, result:results[0]});
        }else{
          next(new error.NotFound("No transactional information for user."));
        }
      });
    });
  });

  return router;
}
