module.exports = Builder;

function Builder() {
  this.stack = [];
}

Builder.prototype = {
  use: function (node, opts) {
    this.stack.push({node: node, opts: opts});
    return this;
  },
  
  listen: function (handler, opts) {
    var stack = this.stack.slice();
    var a = stack.pop();
    var app = function (request, response) {
      return a.node(request, response, a.opts);
    };
    
    while (stack.length > 0) {
      var item = stack.pop();
      app = item.node(app, item.opts);
    }
    
    var server = handler.createHandler(opts);
    server.start(app);
  }
};
