var Gateway = require('./../lib/gateway');
var path = require('path');

function MyApp(request, response) {
  var contents = 'Hello World!';
  response.sendHeader(200, {
    'content-type': 'text/plain',
    'content-length': contents.length
  });
  response.write(contents);
  response.close();
}


var builder = new Gateway.Builder();

// builder.use(Gateway.Middleware.Lint);
builder.use(Gateway.Middleware.Head);
builder.use(Gateway.Middleware.CommonLogger);
builder.use(Gateway.Middleware.ContentType);
builder.use(Gateway.Middleware.Static, {
  root: __dirname,
  urls: ["/favicon.ico", "/css", "/images"]
});
builder.use(MyApp);

builder.listen(Gateway.Handler.NodeHttp, {port: 8000});
