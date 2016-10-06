var express = require("express");

var config = require("./config"),
    error = require("./error");

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
    res.send(JSON.stringify(parkingState));
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
            res.send(JSON.stringify({status:"201", transaction_id:results[0].id}));
          });
        });
      });
    });
  });

  router.get("/:id", function(req, res, next) {
    if(parkingState[req.params.id]){
      res.send(JSON.stringify(parkingState[req.params.id]));
    }else{
      next(new error.NotFound("No transactional information for parking spot with id: " + req.params.id));
    }
  });

  return router;
}
