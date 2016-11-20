var express = require("express"),
    jwt = require("jsonwebtoken");

var config = require("../config"),
    error = require("../utilities/error");

module.exports = function Payment(database, logger){
  var router = express.Router();

  router.post("/checkout",function(req, res, next){
    var data = req.body;
    if(!data.token)
      return next(new error.BadRequest("No token provided."));

    var token_data;
    try{
      token_data = jwt.verify(data.token, config.secret);
    }catch(e){
      return next(new error.Authentication("Token error: " + e.message));
    }

    //TODO: This is temporary. The transaction should be moved to cold storage, not deleted.
    database.getConnection(function(err,connection){
      if(err) throw err;
      connection.query("DELETE FROM transactions WHERE userid = ?", [token_data.userid], function(err, results){
        connection.release();
        if(err) throw err;
        if(results.affectedRows == 0){
          return next(new error.NotFound("No transactions for user."));
        }else{
          res.status(200);
          res.json({status:"200", result:"Successfully removed transaction for user."});
        }
      });
    });
    //Payment stuff will be added later. For now we are just removing user from spot.
  });

  return router;
}
