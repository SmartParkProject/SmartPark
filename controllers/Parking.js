var express = require("express");

var config = require("../config"),
    error = require("../utilities/error");

module.exports = function Parking(database){
  var router = express.Router();
  var parkingState = new Array(config.range_parking_spots);

  //TODO(Seth): Consider moving parking state to own module
  var buildParkingState = function(){
    database.query("SELECT * FROM transactions",function(err, results){
      if(err) throw err;
      results.map(function(current, index){
        parkingState[current.spot] = current;
      });
    });
  };

  buildParkingState();

  //Routes
  router.get("/", function(req, res, next) {
    res.json(parkingState);
  });

  router.post("/", function(req, res, next) {
    //TODO(Seth): Full validation of json object
    data = req.body;
    if(data.spot > config.range_parking_spots)
      return next(new error.BadRequest("Parking spot id exceeds maximum range for value."));

    if(parkingState[data.spot])
      return next(new error.Conflict("Transaction already exists for parking spot with id: " + data.spot));

    if(parkingState.find(a => a != null && a.userid == data.userid))
      return next(new error.Conflict("Transaction already exists for user: " + data.userid));

    //We use a transaction here to guarantee the integrity of the state object.
    database.beginTransaction(function(err){
      if(err) throw err;
      database.query("INSERT INTO transactions (userid, spot, reserve_time, reserve_length) VALUES(?, ?, ?, ?)", [data.userid, data.spot, new Date(), data.reserve_length], function(err, results){
        if (err) return database.rollback(function() { throw err; });
        database.query("SELECT * FROM transactions WHERE id = ?", results.insertId, function(err,results){
          if (err) return database.rollback(function() { throw err; });
          database.commit(function(err){
            if (err) return database.rollback(function() { throw err; });
            parkingState[data.spot] = results[0];
            res.status(201);
            res.json({status:"201", transaction_id:results[0].id});
          });
        });
      });
    });
  });

  router.get("/available", function(req, res, next) {
    //TODO(Seth): validate id
    //Array.map stops after encountering the last non-null value. Lame.
    var converted_array = new Array(parkingState.length);
    for(var i = 0; i < parkingState.length; i++){
      converted_array[i] = parkingState[i] ? 0 : 1;
    }
    res.json(converted_array);
  });

  router.get("/available/:id", function(req, res, next) {
    //TODO(Seth): validate id
    if(parkingState[req.params.id]){
      res.json({status:200, result:0});
    }else{
      res.json({status:200, result:1});
    }
  });

  router.get("/:id", function(req, res, next) {
    //TODO(Seth): validate id and consider mapping /id to the transaction id to better conform to rest standards
    if(parkingState[req.params.id]){
      res.json(parkingState[req.params.id]);
    }else{
      next(new error.NotFound("No transactional information for parking spot with id: " + req.params.id));
    }
  });

  return router;
}
