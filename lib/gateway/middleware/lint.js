var unit = require('/mjsunit.js');

/**
 * Lint is a Gateway middleware that inspects the request and response to
 * ensure it is to spec. This is mainly to be used in development as it
 * will slow the application down a bit as it checks everything. 
 * 
 * @param {Function} app The next application/middleware in the stack
 * @returns {Function} The actual Lint middleware piece
 */
exports.Lint = function Lint(app) {
  return function (request, response) {
    var requestErrors = checkRequest(request);
    
    if (requestErrors.length > 0) {
      requestErrors.unshift('Lint Failure:');
      var content = requestErrors.join('\n');
      response.sendHeader(500, {
        'content-type': 'text/plain',
        'content-length': content.length
      });
      response.sendBody(content);
      response.finish();
      
      if (request && request.error && request.error.write) {
        errorStream.write(content + "\n");
      } else {
        process.stdio.write(content + "\n");
      }
    } else {
      app(request, response);
    }
  };
}


/**
 * Ensures that the request is to spec.
 * 
 * @private
 * @param {Object} request The object to ensure meets the request spec
 * @returns {Array} Errors 
 */
function checkRequest(request) {
  var requestErrors = [];
  
  function addFieldError(name) {
    requestErrors.push("'" + name + "' is required on the Request.");
  }
  
  // request is required to have an input field.
  if (!request.input) {
    addFieldError('input');
  }
  
  // request is required to have an error field. This field is used to write
  // output for logging.
  if (!request.gateway.errors) {
    addFieldError('gateway.errors');
  }
  
  // These are all required fields on the Request.
  var requiredFields = [
    'requestMethod',
    'scriptName',
    'pathInfo',
    'queryString',
    'serverName',
    'serverPort'
  ];
  
  requiredFields.filter(function (field) {
    return !assertExists(request[field], field);
  }).forEach(function (failure) {
    addFieldError(failure);
  });
  
  return requestErrors;
}

function assertExists(item, name) {
  if (typeof(item) === 'undefined') {
    return false;
  } else {
    return true;
  }
}
