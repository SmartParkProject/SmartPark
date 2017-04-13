var express = require("express"),
    Ajv = require("ajv");

var error = require("../utilities/error"),
    auth = require("../utilities/authenticator"),
    models = require("../models");

var ajv = new Ajv();
var infractionSchema = {
  "properties": {
    "description": {"type": "string"},
    "token": {"type": "string"},
    "image": {"type": "string"},
    "lotid": {
      "type": "integer",
      "minimum": 0
    }
  },
  "required": ["description", "token", "lotid"]
};

var authSchema = {
  "properties": {"token": {type: "string"}},
  "required": ["token"]
};

var router = express.Router();

router.post("/", auth, function(req, res, next){
  var data = req.body;
  var valid = ajv.validate(infractionSchema, data);
  if(!valid)
    return next(new error.BadRequest("Bad parameter: " + ajv.errorsText()));

  // TODO: preprocess images to save space
  models.Infraction.create({
    description: data.description,
    image_data: data.image,
    UserId: req.token_data.userid,
    LotId: data.lotid
  }).then(function(infraction){
    res.status(201);
    res.json({
      status: "201",
      result: "Infraction submitted successfully.",
      id: infraction.id
    });
  });
});

// This post method isn't totally restful and actually gets an infraction.
// For future projects, it would be better to have clients include the token in request headers.
router.post("/:id(\\d+)/", auth, function(req, res, next){
  req.params.id = parseInt(req.params.id);
  var data = req.body;
  var valid = ajv.validate(authSchema, data);
  if(!valid)
    return next(new error.BadRequest("Bad parameter: " + ajv.errorsText()));

  models.Infraction.findOne({where: {id: req.params.id}}).then(function(infraction){
    if(!infraction)
      return next(new error.NotFound("No infraction with that id."));

    infraction.getLot().then(function(lot){
      lot.checkPermissions(req.token_data.userid, 1).then(function(authorized){
        if(!authorized)
          return next(new error.Forbidden());

        res.status(200);
        res.json({
          status: "200",
          result: infraction
        });
      });
    });
  });
});

module.exports = router;
