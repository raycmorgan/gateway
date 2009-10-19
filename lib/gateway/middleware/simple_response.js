/**
 * SimpleResponse is a Gateway middleware that allows the middleware/app next
 * in line return a simple object instead of having to use the response object
 * directly.
 * 
 * This is not very useful in practice, since it won't allow for anything in
 * the response to be async. This is more to show a simple middleware piece.
 * 
 * @param {Function} app The next application/middleware in the stack.
 * @returns {Function} The callback function that is the actual middleware.
 */
exports.SimpleResponse = function SimpleResponse(app) {
  return function (request, response) {
    var r = app(request, response);
    if (typeof(r) !== 'undefined') {
      response.sendHeader(r.status, r.headers);
      response.sendBody(r.body);
      response.finish();
    }
  }
}
