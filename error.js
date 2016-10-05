var exports = module.exports;

var ERROR_API=1;

exports.handler = function(err, req, res, next){
  if(err.type==ERROR_API){
    res.status(err.statusCode);
    res.send(JSON.stringify({status:err.statusCode, message:err.message}));
  }else{
    next(err);
  }
}

exports.BadRequest = function(message, errorCode){
  this.message = message || "Bad request.";
  this.statusCode = 400;
  this.errorCode = errorCode || 400;
  this.type = ERROR_API;
}

exports.Forbidden = function(message, errorCode){
  this.message = message || "Permissions not met for the request.";
  this.statusCode = 403;
  this.errorCode = errorCode || 403;
  this.type = ERROR_API;
}

exports.NotFound = function(message, errorCode){
  this.message = message || "The requested resource couldn't be found.";
  this.statusCode = 404;
  this.errorCode = errorCode || 404;
  this.type = ERROR_API;
}

exports.Conflict = function(message, errorCode){
  this.message = message || "There was a conflict with the request.";
  this.statusCode = 409;
  this.errorCode = errorCode || 409;
  this.type = ERROR_API;
}
