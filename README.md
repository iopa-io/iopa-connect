# [![IOPA](http://iopa.io/iopa.png)](http://iopa.io)<br> iopa-connect

[![Build Status](https://api.shippable.com/projects/56e2594e9d043da07bb7cc62/badge?branchName=master)](https://app.shippable.com/projects/56e2594e9d043da07bb7cc62)
[![NPM](https://img.shields.io/badge/iopa-certified-99cc33.svg?style=flat-square)](http://iopa.io/)
[![limerun](https://img.shields.io/badge/limerun-certified-3399cc.svg?style=flat-square)](https://nodei.co/npm/limerun/)

[![NPM](https://nodei.co/npm/iopa.png?downloads=true)](https://nodei.co/npm/iopa/)

## About

This repository contains a Node Package Manager (NPM) package with helper functions for:
 
* Connect app bridge: An IOPA -> Connect/Express application bridge
* HTTP server bridge:  A Node.js Http Server --> IOPA application bridge

This package is intended for use in Node.js applications that either run on a web server that conform to the IOPA specifications (such as the embedded webserver inside [nodekit.io](https://github.com/nodekit-io/nodekit)) or run using the included iopa-http bridge for node-coap and node Http servers respectively.

## Middleware/Application Pipeline Builder: AppBuilder 
```js
app.use(middleware)
```

Adds a middleware node to the IOPA function pipeline. The middleware are
invoked in the order they are added: the first middleware passed to `app.use` will
be the outermost function, and the last middleware passed to Use will be the
innermost.

### middleware
The middleware parameter determines which behavior is being chained into the pipeline. 

* If the middleware given to use is a function that takes **one** argument, then it will be invoked with the `next` component in the chain as its parameter, and with the `this` context set to the IOPA context.  It MUST return a promise that conforms to the Promise/A specification.

* If the middleware given to use is a function that takes **two** arguments, then it will be invoked with the `next` component in the chain as its parameter, with a Node-based callback (`function(err, result){}`)as its second parameter, and with the `this` context set to the IOPA context.  This type of middleware should return void.

* Legacy middleware can also be invoked with  `app.use( function(req,res){ ... }  )`, `app.use( function(req, res, next){ ... }  )` or `app.use( function(err, req, res, next){ ... }  )`.  The AppBuilder is smart enough to detect the two argument function with parameters named req and res in this case (use of different naming conventions need to be wrapped in a `function(req,res){}`), and assumes three and four argument functions are legacy.

## Bridges

Three simple functions `iopa.connect()`, `iopa.COAP()` and `iopa.REST()` are provided to bridge between IOPA context applications/middleware and Node.js COAP and HTTP REST-style `function(req,res)` based  applications/middleware.   Often these are not used directly as the AppBuilder functionality automatically wraps legacy middleware and can even return a node.js-ready pipeline with `.buildREST()`

Note: The bridges are low overhead functions, binding by reference not by value wherever possible, so middleware can be interwoven throughout the pipeline, and open up the IOPA world to the entire Connect/Express based ecosystem and vice versa.   

We have not ported to Koa, Mach, Kraken or other similar frameworks but it would be relatively straightforward to do so.

* `iopa.connect()` consumes a Connect-based application function (one that would normally be passed to the http.CreateServer method) and returns an IOPA **AppFunc**.
* `iopa.http()` consumes an IOPA **AppFunc** and returns a function (that takes http.requestMessage and http.requestMessage as arguments) and one that can be passed directly to the http.createServer method    
* `app.buildHttp()` is syntactic sugar to build the pipleine and returns a node.js-ready function (that takes http.requestMessage and http.requestMessage as arguments) and one that can be passed directly to the http.createServer method   


## Example Usage

### Installation
``` js
npm install iopa
```

#### To run HTTP demo:
``` js
git clone https://github.com/limerun/iopa.git
cd iopa
npm install
node demo.js
```
    
### Hello World Example
``` js
const iopa = require('iopa'),
      http = require('iopa-connect').http;
var app = new iopa.App();
app.use(http);
app.use(function(context, next){
       context.response["iopa.WriteHead"](200, {'Content-Type': 'text/html'});
    context.response["iopa.Body"].end("<html><head></head><body>Hello World from HTTP Server</body>");
     return next();
    });
app.createServer("http:").listen();
```
   
### Automatic Connect Bridge to Legacy Connect/Express Middleware    
``` js
var iopa = require('iopa')
  , http = require('http');
  
require('iopa-connect');

var app = new iopa.App();  
app.use(function(req, res) {
    response.writeHead(200, {"Content-Type": "text/html"});
    response.end("<html><head></head><body>Hello World</body>");
});
http.createServer(app.buildHttp()).listen(); 
```    

### IOPA - HTTP Bridge
    
``` js
var iopa = require('iopa')
  , http = require('http'); 
var http = require('http');
var app = new iopa.App();
app.use(function(next){
    this.response.writeHead(200, {'Content-Type': 'text/html'});
    this.response.end("<html><head></head><body>Hello World</body>");
return next();
});
http.createServer(app.buildHttp()).listen();
```  

## Definitions

 * **appFunc** = `(Promise) function(context)` 
 * **app.use** = `(app)function(middleware)`
 * **middleware** = `(Promise) function(context, next)` with `next`=**appFunc**
 * OR **middleware** = `fn(req, res, next)` for compatibility with Connect/ExpressJS middleware
 * OR **middleware** = `fn(err, req, res, next)` for compatibility with Connect/ExpressJS middleware
 * **app.build** = `(appFunc) function(context)`   // builds middleware 
 * **app.buildHttp** = `(function(req, res)) function()`   // builds middleware for compatibility with Connect/ExpressJS hosts
 * **context** = IOPA context dictionary

## API Reference Specification

[![IOPA](http://iopa.io/iopa.png)](http://iopa.io)
 
[`IOPA-docs/IOPA-spec`](https://github.com/iopa-io/iopa-spec/blob/master/Specification.md)
