var assert  = require('assert');
var mock    = require('../lib/gateway/mock');

exports.tests = [

function testParseCookie() {
  var req = mock.requestFor('GET', '', {'headers': {'cookie': "foo=bar;quux=h&m"}});
  
  assert.deepEqual({'foo': 'bar', 'quux': 'h&m'}, req.getCookies());
  assert.deepEqual({'foo': 'bar', 'quux': 'h&m'}, req.getCookies());
  delete req.headers.cookie;
  assert.deepEqual({}, req.getCookies());
},

function testParseCookiesRFC2109() {
  var req = mock.requestFor('GET', '', {'headers': {'cookie': "foo=bar;foo=car"}});
  assert.deepEqual({'foo': 'bar'}, req.getCookies());
},

function testMediaType() {
  var req = mock.requestFor('GET', '', {'headers': {'contentType': 'text/html'}});
  assert.equal('text/html', req.mediaType());
  assert.equal('text/html', req.headers.contentType);
  
  var req = mock.requestFor('GET', '', {'headers': {'contentType': "text/html; charset=utf-8"}});
  assert.equal('text/html', req.mediaType());
  assert.equal('text/html; charset=utf-8', req.headers.contentType);
  assert.equal('utf-8', req.mediaTypeParams().charset);
  
  var req = mock.requestFor('GET', '', {});
  assert.equal(null, req.mediaType());
  assert.equal(undefined, req.headers.contentType);
},

function testHasFormData() {
  var req = mock.requestFor('GET', '', {'headers': {'contentType': "application/x-www-form-urlencoded"}});
  assert.equal(true, req.hasFormData());
  
  var req = mock.requestFor('GET', '', {'headers': {'contentType': "multipart/form-data"}});
  assert.equal(true, req.hasFormData());
  
  var req = mock.requestFor('GET', '', {});
  assert.equal(true, req.hasFormData(), "No content type should make hasFormData return true");
  
  var req = mock.requestFor('GET', '', {'headers': {'contentType': "text/html"}});
  assert.equal(false, req.hasFormData());
},

function testParseURLEncodedBody() {
  var content = "hello=world"
  var input = mock.createMockInput();
  
  var req = mock.requestFor('POST', '', {
    'input': input,
    'headers': {
      'content-type': "application/x-www-form-urlencoded",
      'content-length': content.length
    }
  });
  
  var data;
  req.parseURLEncodedBody(function (body) {
    data = body;
  });
  
  input.sendData(content);
  
  return function () {
    assert.deepEqual({'hello': 'world'}, data);
  }
},

function testParseURLEncodedBodyViaPost() {
  var content = "hello=world"
  var input = mock.createMockInput();
  
  var req = mock.requestFor('POST', '', {
    'input': input,
    'headers': {
      'content-type': "application/x-www-form-urlencoded",
      'content-length': content.length
    }
  });
  
  var data;
  req.post(function (body) {
    data = body;
  });
  
  input.sendData(content);
  
  return function () {
    assert.deepEqual({'hello': 'world'}, data);
  }
}

];

exports.tests.map(function (test) {
  return test();
}).forEach(function (test) {
  process.addListener('exit', function () {
    if (typeof(test) === 'function') {
      test();
    }
  });
});

