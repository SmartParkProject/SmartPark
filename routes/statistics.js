var express = require("express");

var router = express.Router();

router.post("/traffic", function(req, res, next){
  var data = req.body;
  console.log(JSON.stringify(data));
});

module.exports = router;
