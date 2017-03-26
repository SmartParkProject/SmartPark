var express = require("express");

var router = express.Router();

router.post("/traffic", function(req, res, next){
  var data = req.body;
  //data.cars is going to be the number of cars entering in the period
  //To determine whether someone is parked incorrectly, compare the sensor data to transactions for a lot.
  //If our margin of error passes a certain threshold, set a value to be returned on security guard update requests.
  console.log(JSON.stringify(data));
  res.status(200);
  res.json({status:200});
});

module.exports = router;
