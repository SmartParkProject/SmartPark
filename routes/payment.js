var express = require("express"),
    jwt = require("jsonwebtoken");

var config = require("../config"),
    error = require("../utilities/error"),
    auth = require("../utilities/authenticator"),
    models = require("../models");

var router = express.Router();

router.post("/checkout", auth, function(req, res, next){
  var data = req.body;

  models.User.findOne({where: {id: req.token_data.userid}, include: [models.Transaction]}).then(function(user){
    if(!user.Transaction)
      return next(new error.NotFound("No transactions for user."));
    models.ArchivedTransaction.create(user.Transaction.get({plain: true})).then(function(archived){
      user.Transaction.destroy().then(function(rows){
        if(rows === 0)
          throw new error.Internal("Error removing transaction.");

        res.status(200);
        res.json({status:"200", result:"Successfully removed transaction for user."});
      }).catch(next);
    });
  });
  //Payment stuff will be added later. For now we are just removing user from spot.
});

module.exports = router;
