var Gateway = require('../lib/gateway.js');

function MyApp(request, response) {
  var contents = 'Hello World!';
  response.sendHeader(200, {
    'content-type': 'text/plain',
    'content-length': contents.length
  });
  response.sendBody(contents);
  response.finish();
}


var builder = Gateway.createBuilder();

builder.use(Gateway.Middleware.Lint);
builder.use(Gateway.Middleware.Head);
builder.use(Gateway.Middleware.CommonLogger);
builder.use(Gateway.Middleware.ContentType);
builder.use(Gateway.Middleware.Static, {
  root: node.path.dirname(__filename),
  urls: ["/favicon.ico", "/css", "/images"]
});
builder.use(MyApp);

builder.boot(Gateway.Handler.NodeHttp, {port: 8000});
