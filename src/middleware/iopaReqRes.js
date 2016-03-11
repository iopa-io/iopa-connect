/*
 * Copyright (c) 2015 Internet of Protocols Alliance (IOPA)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * Module dependencies.
 */
const path = require('path'),
    url = require('url'),
    Stream = require('stream'),
    Writable = Stream.Writable,
    Readable = Stream.Readable,
    EventEmitter = require('events').EventEmitter,

    connectConstants = require('../util/constants.js'),
    CONNECT_REQ = connectConstants.CONNECT_REQ,
    CONNECT_RES = connectConstants.CONNECT_RES,
    HTTP = connectConstants.HTTP,
    IOPA_CONNECT = connectConstants.IOPA_CONNECT,
  
    iopa = require('iopa'),
    IopaApp = iopa.app,
    cloneKeyBehaviors = iopa.util.prototype.cloneKeyBehaviors,
    constants = iopa.constants,
    IOPA = constants.IOPA,
    SERVER = constants.SERVER,
    
   packageVersion = require('../../package.json').version;

 
// PUBLIC EXPORTS

  /**
 * IOPA Middleware to add context.req and context.res items to context record to mirror node ('http') incoming and outgoing messages
 *
 * @class CoAPClientChannelParser
 * @this app.properties  the IOPA AppBuilder Properties Dictionary, used to add server.capabilities
 * @constructor
 * @public
 */
function iopaReqResMiddleware(app) {
    if (app.properties[SERVER.Capabilities][IOPA_CONNECT.CAPABILITY])
        throw ("iopa-connect already registered for this application; app.useLegacy() not required if app.use(legacy middleware) used earlier");

    app.properties[SERVER.Capabilities][IOPA_CONNECT.CAPABILITY] = {};
    app.properties[SERVER.Capabilities][IOPA_CONNECT.CAPABILITY][SERVER.Version] = packageVersion;
}


iopaReqResMiddleware.prototype.invoke = function iopaReqResMiddleware_invoke(context, next){
    
    if (context.hasOwnProperty(IOPA_CONNECT.reqres))
    {
        context.req = context.reqres;
        context.res = context.response.reqres;
        context[IOPA_CONNECT.expanded]  = true;
    } else if (!context.hasOwnProperty(IOPA_CONNECT.req)) {
        context.req = new IopaReq(context);
        context.res = new IopaRes(context);
        context[IOPA_CONNECT.expanded]  = true;
    } else
      context[IOPA_CONNECT.expanded]  = false;
  
    return next()
    .then(function(value){
        if (context[IOPA_CONNECT.expanded])
                 delete context.req; 
                 delete context.res;
                 delete context[IOPA_CONNECT.expanded]
        return value;
    });  
};

exports.default = iopaReqResMiddleware;

/**
 * Representss an IOPA bridge to Node.js http ServerRequest Object
 *
 * @class IopaReq
 * @constructor
 */
function IopaReq(iopa){ this.context = iopa;  };

/**
 * Representss an IOPA bridge to Node.js http ServerResponse Object
 *
 * @class Res
 * @constructor
 */
function IopaRes(iopa){ this.context = iopa;  };

/**
 * Self initiating method to create the prototype properties on the bridges to match http ServerRequest and ServerResponse objects
 *
 * @method init_InstallRequestResponsePrototypes
 * @private
 */
(function runonce()
 {
 
 //REQUEST
 var req= IopaReq;
 
 Object.defineProperty(req.prototype, CONNECT_REQ.socket, { get: function () {  return this.context[SERVER.RawStream];  } });
 Object.defineProperty(req.prototype, CONNECT_REQ.connection, { get: function () {  return {}  } });
 
 Object.defineProperty(req.prototype, CONNECT_REQ.httpVersion, {
                       get: function () { return  this.context[IOPA.Protocol].split("/")[1];
                       },
                       set: function (val) { throw ("not implemented");    }
                       });
 
 Object.defineProperty(req.prototype, CONNECT_REQ.httpVersionMajor, {
                       get: function () { return this.context[IOPA.Protocol].split("/")[1].split(".")[0];
                       },
                       set: function (val) { throw ("not implemented");    }
                       });
 
 Object.defineProperty(req.prototype, CONNECT_REQ.httpVersionMinor, {
                       get: function () { return this.context[IOPA.Protocol].split("/")[1].split(".")[1];
                       },
                       set: function (val) { throw ("not implemented");    }
                       });
 
 Object.defineProperty(req.prototype, CONNECT_REQ.originalUrl, {
                       get: function () {
                           return this.context[SERVER.OriginalUrl];
                       }
                       });
 
 Object.defineProperty(req.prototype, CONNECT_REQ.url, {
                       get: function () {
                       var uri =
                       this.context[IOPA.Path];
                       
                       if (this.context[IOPA.QueryString] != "")
                       uri += "?" + this.context[IOPA.QueryString];
                       return uri;
                       
                       }, set: function (val) {
                       if (!this._originalurl)
                       var urlParsed = url.parse(val);
                       this.context[IOPA.PathBase] = "";
                       this.context[IOPA.Path] = urlParsed.pathName;
                       this.context[IOPA.QueryString] = urlParsed.query;
                       }
                       });
 
 Object.defineProperty(req.prototype, CONNECT_REQ.complete, {
                       get: function () {  return false;   }
                       });
 
 Object.defineProperty(req.prototype, CONNECT_REQ.headers, {
                       get: function () {  return this.context[IOPA.Headers];   }
                       });
 
 Object.defineProperty(req.prototype, CONNECT_REQ.rawHeaders, {
                       get: function () {
                       var ret = [];
                       for(var key in this.context[IOPA.Headers]){
                       ret.push(key);
                       ret.push(this.context[IOPA.Headers]);
                       };
                       return ret;
                       }
                       });
 
 Object.defineProperty(req.prototype, CONNECT_REQ.trailers, {
                       get: function () {  return {};   }
                       });
 
 Object.defineProperty(req.prototype, CONNECT_REQ.rawTrailers, {
                       get: function () {  return []; }
                       });
 
 
 Object.defineProperty(req.prototype, CONNECT_REQ.readable, {
                       get: function () {  return true ; }
                       });
 
 
 Object.defineProperty(req.prototype, CONNECT_REQ.method, {
                       get: function () {  return this.context[IOPA.Method];   },
                       set: function (val) {  this.context[IOPA.Method] = val;    }
                       });
 
 req.prototype[CONNECT_REQ.getHeader] = function(key)
 {
 return this.context.request.getHeader(key);
 }

 
 
 //RESPONSE
  var res= IopaRes;
 
 Object.defineProperty(res.prototype, CONNECT_RES.socket, { get: function () {  return this.context.response[SERVER.RawStream]; } });
 Object.defineProperty(res.prototype, CONNECT_RES.connection, { get: function () {  return {}  } });
 
 Object.defineProperty(res.prototype, CONNECT_RES.statusCode, {
                       get: function () { return this.context.response[IOPA.StatusCode];  },
                       set: function (val) {  this.context.response[IOPA.StatusCode] = val;
                                                this.context.response[IOPA.ReasonPhrase] = HTTP[val]; 
                             },
                       });
                       
 Object.defineProperty(res.prototype, CONNECT_RES.statusMessage, {
                       get: function () { return this.context.response[IOPA.ReasonPhrase] || HTTP[this.context.response[IOPA.StatusCode]] },
                       set: function (val) { this.context.response[IOPA.ReasonPhrase] = val;  },
                       });
 
 Object.defineProperty(res.prototype, CONNECT_RES.headersSent, {
                       get: function () { return  context.response[IOPA.HeadersSent];  }
                       });
 
 Object.defineProperty(res.prototype, CONNECT_RES.sendDate, {
                       get: function () { return true; },
                       set: function (val) { /* ignore */  },
                       });
 
 
 res.prototype[CONNECT_RES.status] =  function (code) { this.context.response[IOPA.StatusCode] = code; return this;}
 
 res.prototype[CONNECT_RES.writeContinue] = function writeContinue(statusCode, headers)
 {
 throw {name : "NotImplementedError", message : "writeContinue HTTP 100 not implemented per IOPA spec;  instead server must implement"};
 }
 
 res.prototype[CONNECT_RES.setTimeout] = function setTimeout(msecs, callback)
 {
 throw {name : "NotImplementedError", message : "set Timeout not implemented as not needed in IOPA"};
 }
 
 res.prototype[CONNECT_RES.addTrailers] = function addTrailers(trailers)
 {
 throw {name : "NotImplementedError", message : "HTTP Trailers (trailing headers) not supported"};
 }
 
 res.prototype[CONNECT_RES.setHeader] = function(key, value)
 {
 this.context.response.setHeader(key, value);
 }
 
 res.prototype[CONNECT_RES.getHeader] = function(key)
 {
 return this.context.response.getHeader(key);
 }
 
 res.prototype[CONNECT_RES.removeHeader] = function(key)
 {
 this.context.response.removeHeader(key);
 }
 
 res.prototype[CONNECT_RES.writeHead] = function(statusCode, reasonPhrase, headers)
 {
 this.context.response.writeHead(statusCode, reasonPhrase, headers);
 }
 
 //ADD BODY PROTOYPE ALIASES FOR REQUEST AND RESPONSE

 cloneKeyBehaviors(req.prototype,EventEmitter.prototype, IOPA.Body, false);
 cloneKeyBehaviors(req.prototype,Stream.prototype, IOPA.Body, false);
 cloneKeyBehaviors(req.prototype,Readable.prototype, IOPA.Body, false);
 
 cloneKeyBehaviors(res.prototype,EventEmitter.prototype, IOPA.Body, true);
 cloneKeyBehaviors(res.prototype,Stream.prototype, IOPA.Body, false);
 cloneKeyBehaviors(res.prototype,Writable.prototype, IOPA.Body, false);
 
 }).call(global);
