/* global "iopa.RemoveHeader" */
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
  util = require('util'),
  FreeList = require('../util/freelist.js').FreeList,
  Events = require('events'),
  iopa = require('iopa'),
  iopaContextFactory = new iopa.Factory(),
  
  connectConstants = require('../util/constants.js'),
  CONNECT = connectConstants.CONNECT,
  HTTP = connectConstants.HTTP,
 
  constants = iopa.constants,
  IOPA = constants.IOPA,
  SERVER = constants.SERVER
 
var initialized = false;

/**
 * Converts an IOPA promise-based AppFunc to a synchronous Node ('http').createServer request listener {function(req, res):void}
 *
 * @method nextSyncFromIopaNextPromise
 *
 * @param {function(context):Promise} appFunc
 * @returns {function(req, res):void}
 * @private
 */
exports.default = function iopaHTTP(appFunc) {
    if (!initialized)
    {
        var context = iopaContextFactory._create();   // for adding prototype methods only, request only
        ProtoInit(context);
        context.dispose();
        initialized = true;
    }
    
    return function iopaHttpListener(req, res) {
        var context = iopaContextFactory._create();    // skeleton context including response
        var response = iopaContextFactory._create();
        context.response = response;
        context.response[SERVER.ParentContext] = context;

        context.reqres = req;
        context.response.reqres = res;
        res[CONNECT.setHeader]('X-Powered-By', 'IOPA');
        
        context.using(appFunc);
       
    }
};

function ProtoInit(context){
    
    var iopa = Object.getPrototypeOf(context);
    
    Object.defineProperty(iopa, IOPA.Headers, {
                          get: function () {return this.reqres[CONNECT.headers] }
                          });
    
    Object.defineProperty(iopa, IOPA.Method, {
                          get: function () { return this.reqres[CONNECT.method]; },
                          set: function (val) { this.reqres[CONNECT.method] = val;    }
                          });
                          
    Object.defineProperty(iopa, SERVER.OriginalUrl, {
                          get: function () { return this.reqres[CONNECT.originalUrl]; },
                          set: function (val) {
                            this.reqres[CONNECT.originalUrl]=val;
                          }
                          });  
    
    Object.defineProperty(iopa, IOPA.Path, {
                          get: function () { return url.parse(this.reqres[CONNECT.url]).pathname; },
                          set: function (val) {
                          var uri = val;
                          var uriQuery =  url.parse(this.reqres[CONNECT.url]).query;
                          if (uriQuery != "")
                          uri += "?" + uriQuery;
                          this.reqres[CONNECT.url] = uri;
                          }
                          });
    
    Object.defineProperty(iopa, IOPA.PathBase, {
                          get: function () { return "" },
                          set: function (val) {
                          if (!this.reqres[CONNECT.originalUrl])
                          this.reqres[CONNECT.originalUrl] = this.reqres[CONNECT.url];
                          var uri = path.join(val, this.reqres[CONNECT.url]);
                          this.reqres[CONNECT.url] = uri;
                          }
                          });
    
    Object.defineProperty(iopa, IOPA.Protocol, {
                          get: function () {return (this.reqres[CONNECT.httpVersion]) ? "HTTP/" + this.reqres[CONNECT.httpVersion] : this.parent[CONNECT.httpVersion]; }
                          });
    
    Object.defineProperty(iopa, IOPA.QueryString, {
                          get: function () {  return  url.parse(this.req[CONNECT.url]).query; },
                          set: function (val) {
                          var uri = url.parse(this.req[CONNECT.url]).pathname;
                          var uriQuery =  val;
                          if (uriQuery != "")
                          uri += "?" + uriQuery;
                          this.req[CONNECT.url] = uri;
                          }
                          });
    
    Object.defineProperty(iopa, IOPA.Scheme, {
                          get: function () { return IOPA.SCHEMES.HTTP; }
                          });
    
    Object.defineProperty(iopa, IOPA.Body, {
                          get: function () {
                             return this.reqres;}
                          });
                             
    Object.defineProperty(iopa, IOPA.StatusCode, {
                          get: function () { return this.reqres[CONNECT.statusCode]; },
                          set: function (val) { this.reqres[CONNECT.statusCode] = val;    }
                          });
    
    Object.defineProperty(iopa, IOPA.ReasonPhrase, {
                          get: function () { return this.reqres[CONNECT.statusMessage] || HTTP[this.reqres[CONNECT.statusCode]]; },
                          set: function (val) { this.reqres[CONNECT.statusMessage] = val;   }
                          });
              
    iopa[IOPA.SetHeader] = function(){this.reqres[CONNECT.setHeader].apply(this.reqres, Array.prototype.slice.call(arguments));};
    iopa[IOPA.GetHeader] = function(){this.reqres[CONNECT.getHeader].apply(this.reqres, Array.prototype.slice.call(arguments));};
    iopa[IOPA.RemoveHeader] = function(){this.reqres[CONNECT.removeHeader].apply(this.reqres, Array.prototype.slice.call(arguments));};
    iopa[IOPA.WriteHead] = function(){
    this.reqres[CONNECT.writeHead].apply(this.reqres, Array.prototype.slice.call(arguments));};
    
   
    Object.defineProperty(iopa, SERVER.RawStream, {
                          get: function () {
                             return this.reqres[CONNECT.socket];}
                          });
 
    Object.defineProperty(iopa, SERVER.TLS, {
                          get: function () {
                             return false;}
                          });
    
    Object.defineProperty(iopa, SERVER.RemoteAddress, {
                          get: function () {
                             return this.reqres[CONNECT.socket].remoteAddress;}
                          });
         
    Object.defineProperty(iopa, SERVER.RemotePort, {
                          get: function () {
                             return this.reqres[CONNECT.socket].remotePort;}
                          });
                              
    Object.defineProperty(iopa, SERVER.LocalAddress, {
                          get: function () {
                             return this.reqres[CONNECT.socket].localAddress;}
                          });
                              
    Object.defineProperty(iopa, SERVER.LocalPort, {
                          get: function () {
                             return this.reqres[CONNECT.socket].localPort;}
                          });      
                          
    Object.defineProperty(iopa, SERVER.IsLocalOrigin, {
        get: function () {
            return !this.hasOwnProperty("response");
        }
      });
  
    Object.defineProperty(iopa, SERVER.IsRequest, {
                          get: function () {
            return this.hasOwnProperty("response");
        }
    });
    
      Object.defineProperty(iopa, SERVER.SessionId, {
        get: function () {
            return this.reqres[CONNECT.socket].remoteAddress + ":" + this.reqres[CONNECT.socket].remotePort;
        }
      });
      
    Object.defineProperty(iopa, IOPA.MessageId, {
        get: function () {
            return this[IOPA.Seq];
        }
      });

}
