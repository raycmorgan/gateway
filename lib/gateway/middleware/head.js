var Response = require("./../response");

exports.Head = function Head(app) {
  return function (request, response) {
    if (request.method === 'HEAD') {
      var myResponse = new Response();

      myResponse.
        addListener('headers', function (status, headers) {
          response.sendHeaders(status, headers);
          response.close();
        }).
        addListener('data', function () {}).
        addListener('end', function () {});
        
      app(request, myResponse);
    } else {
      app(request, response);
    }
  }
}