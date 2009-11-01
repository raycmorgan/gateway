var Response = require("./../response");

exports.Head = function Head(app) {
  return function (request, response) {
    if (request.requestMethod === 'HEAD') {
      var myResponse = Response.createResponse();

      myResponse.
        addListener('headers', function (status, headers) {
          response.sendHeaders(status, headers);
          response.finish();
        }).
        addListener('body', function () {}).
        addListener('complete', function () {});
        
      app(request, myResponse);
    } else {
      app(request, response);
    }
  }
}