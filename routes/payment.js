var express = require("express"),
    jwt = require("jsonwebtoken");

var config = require("../config"),
    error = require("../utilities/error"),
    auth = require("../utilities/authenticator"),
    models = require("../models");

var router = express.Router();

router.post("/checkout", auth, function(req, res, next){
  var data = req.body;
  if(!data.token)
    return next(new error.BadRequest("No token provided."));

  //TODO: This is temporary. The transaction should be moved to cold storage, not deleted.
  models.Transaction.destroy({where: {UserId: req.token_data.userid}}).then(function(rows){
    if(rows == 0)
      throw new error.NotFound("No transactions for user.");

    res.status(200);
    res.json({status:"200", result:"Successfully removed transaction for user."});
  }).catch(next);
  //Payment stuff will be added later. For now we are just removing user from spot.
});

module.exports = router;
