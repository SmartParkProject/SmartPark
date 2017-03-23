var express = require("express");

var router = express.Router();

router.post("/traffic", function(req, res, next){
  var data = req.body;
  console.log(JSON.stringify(data));
  res.status(200);
  res.json({status:200});
});

module.exports = router;
