var express = require("express"),
    Ajv = require("ajv"),
    jwt = require("jsonwebtoken");

var config = require("../config"),
    error = require("../utilities/error"),
    auth = require("../utilities/authenticator"),
    models = require("../models");

var ajv = new Ajv();
var infractionSchema = {
  "properties":{
    "description":{
      "type":"string"
    },
    "token":{
      "type":"string"
    },
    "image":{
      "type":"string"
    }
  },
  "required":["description", "token"]
};

var authSchema = {
  "properties":{
    "token":{
      type:"string"
    }
  },
  "required":["token"]
};

var router = express.Router();

router.post("/", auth, function(req, res, next){
  var data = req.body;
  var valid = ajv.validate(infractionSchema, data);
  if(!valid)
    return next(new error.BadRequest("Bad parameter: " + ajv.errorsText()));

  //TODO: preprocess images to save space
  models.Infraction.create({description: data.description, image_data: data.image, UserId: req.token_data.userid}).then(function(infraction){
    res.status(201);
    res.json({status:"201", result:"Infraction submitted successfully.", id:infraction.id});
  });
});

//This post method isn't totally restful and actually gets an infraction.
//For future projects, it would be better to have clients include the token in request headers.
router.post("/:id(\\d+)/", function(req, res, next){
  req.params.id = parseInt(req.params.id);
  var data = req.body;
  var valid = ajv.validate(authSchema, data);
  if(!valid)
    return next(new error.BadRequest("Bad parameter: " + ajv.errorsText()));

  //TODO: check user rights req.token_data.userid
  models.Infraction.findOne({where: {id:req.params.id}}).then(function(infraction){
    res.status(200);
    res.json({status:"200", result:infraction});
  });
});


module.exports = router;
