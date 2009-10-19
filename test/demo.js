var Gateway = require('../lib/gateway.js');

function MyApp(request, response) {
  return {
    status: 200,
    headers: {'Content-Type': 'text/plain'},
    body: "Hello World!"
  };
}


var builder = Gateway.createBuilder();

builder.use(Gateway.Middleware.Lint);
builder.use(Gateway.Middleware.CommonLogger);
builder.use(Gateway.Middleware.Static, {
  root: node.path.dirname(__filename),
  urls: ["/favicon.ico", "/css"]
});
builder.use(Gateway.Middleware.SimpleResponse);
builder.use(MyApp);

builder.boot(Gateway.Handler.NodeHttp, {port: 8000});
