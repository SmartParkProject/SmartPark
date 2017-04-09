var express = require("express"),
    Ajv = require("ajv");

var config = require("../config"),
    error = require("../utilities/error"),
    models = require("../models");

var ajv = new Ajv();
var trafficSchema = {
  "properties":{
    "lotid":{
      "type":"integer"
    },
    "cars":{
      "type":"integer"
    }
  },
  "required":["lotid", "cars"]
};
var lastUpdate = new Date(); //Stores the time of the last update for query

var router = express.Router();

//TODO: auth on lot's hardware secret
router.post("/traffic", function(req, res, next){
  var data = req.body;
  var valid = ajv.validate(trafficSchema, data);
  if(!valid)
    return next(new error.BadRequest("Bad parameter: " + ajv.errorsText()));

  models.Lot.findOne({where:{id: data.lotid}}).then(function(lot){
    if(!lot)
      return next(new error.NotFound("No lot with id: " + data.lotid));

    const parameters = {
      createdAt: {
        $lt: new Date(),
        $gt: lastUpdate
      }
    };

    lot.getTransactions({where: parameters}).then(function(transactions){
      lastUpdate = new Date();
      if(data.cars > (transactions.length + config.stat_traffic_error_margin)){
        lot.createEvent({message:"High traffic - potential infraction detected.", code:1001});
      }
    });
    res.json({status:200});
  });
});

module.exports = router;
