/*
 * Copyright (c) 2016 Internet of Protocols Alliance (IOPA)
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
const constants = require('iopa').constants,
    IOPA = constants.IOPA,
    SERVER = constants.SERVER
    
/**
 * Assures that the middleware is represented as IOPA middleware promise format (promise) fn(context, next)  where next = (promise) function()
 *
 * @method Middleware
 * @this app (object)  the appBuilder instance which will contain at least "server.Capabilities"
 * @param nextMiddlewareProxy (function) the next function in the middleware sequence to call
 * @param middleware (function)  the function which may already be in IOPA format or may be an Express/Connect middleware component
 * @returns (function)   the same middleware, wrapped as needed, to assure it is a (promise) function(next)
 */
function MiddlewareProxy(nextMiddlewareProxy, app, middleware, action) {
     var args;
    action = action || "invoke";
   
   if (action !== 'invoke')
     return nextMiddlewareProxy(app, middleware, action);
   
   // ONLY SERVER REQUEST INVOKES ARE REQUIRED FOR LEGACY CONNECTION
   
    if (typeof middleware === 'function') {
        switch (middleware.length) {
                       
            //fn(req,res) or fn(context, next)
            case 2:

                args = private_getParamNames(middleware);
                if (arrayEqual(args, ["req", "res"])) {
                    checkConnect(app);
                    return proxyConnect2(middleware);
                } else {
                    // likely IOPA format, but pass to rest of chain
                    return nextMiddlewareProxy(app, middleware, action);
                }
             break;    
            //fn(req,res,next)
            case 3:
                checkConnect(app);
                return proxyConnect3(middleware);
                break;
            //fn(err,req,res,next)
            case 4:
                checkConnect(app);
                return proxyConnect4(middleware);
                break;
            // pass to next in chain
            default:
                return nextMiddlewareProxy(app, middleware, action);
        }
    }
    else {
         return nextMiddlewareProxy(app, middleware, action);
    }

};

function checkConnect(app){
    if (!app.properties["server.Capabilities"]["iopa-connect.Version"])
    {
        app.useLegacy();
    }
}

/**
 * DEFAULT EXPORT
 */
exports.default = MiddlewareProxy;

// PRIVATE HELPER FUNCTIONS

/**
 * Gets the parameter names of a javascript function
 *
 * @method private_getParamNames
 * @param func (function)  the function to parse
 * @returns (array[string])   the names of each argument (e.g., function (a,b) returns ['a', 'b']
 * @private
 */
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
function private_getParamNames(func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '')
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(/([^\s,]+)/g)
    if (result === null)
        result = []
    return result
}

/**
 * Check if two arrays have same elements
 *
 * @method arrayEqual
 *
 * @param array1 (Array[string])  the first array to compare
 * @param array2 (Array[string])  the second array to compare
 * @returns  (bool) true if the two arrays are equal, false if not  (e.g., ['a', 'c'], ['a', 'c'] is true)
 * @private
 */
function arrayEqual(array1, array2) {
    // if the other array is a falsy value, return
    if (!array2)
        return false;
    
    // compare lengths - can save a lot of time
    if (array1.length != array2.length)
        return false;

    for (var i = 0, l = array1.length; i < l; i++) {
        // Check if we have nested arrays
        if (array1[i] instanceof Array && array2[i] instanceof Array) {
            // recurse into the nested arrays
            if (!array1[i].compare(array2[i]))
                return false;
        }
        else if (array1[i] != array2[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}

/**
 * Converts an Connect Func to an IOPA AppFunc
 *
 * @method promiseFromConnect2
 *
 * @param {function (req, res): void} fn - Connect/Express style middleware with 2 parameters
 * @returns {function (context, next):promise} - IOPA style middlware where next is accepted as {function():Promise} 
 * @private
 */
function proxyConnect2(fn) {
    return function iopaFromConnect2(context, next) {
        if (context[IOPA.Error])
            return next();


        return new Promise(function (resolve, reject) {
            try {
                fn.call(context, context.req, context.res);
                context = null;
                resolve(next());
            } catch (ex) {
                context[IOPA.Error] = ex;
                context = null;
                reject(ex);
            }
        });
    };
}

/**
 * Converts a Connect NextFunc to an IOPA AppFunc
 *
 * @method promiseFromConnect3
 *
 * @param {function (req, res, next): void} fn - Connect/Express style middleware with 3 parameters
 * @returns {function (context, next):promise} - IOPA style middlware where next is proxied from {function():Promise} 
 * @private
 */
function proxyConnect3(fn) {
    return function iopaFromConnect3(context, next) {
        if (context[IOPA.Error])
            return next();

        var nextConnect = nextSyncFromIopaNextPromise(next);
        return new Promise(function (resolve, reject) {
            try {
                fn.call(context, context.req, context.res, nextConnect);
                context = null;
                nextConnect = null;
                resolve(null);
            } catch (ex) {
                context[IOPA.Error] = ex;
                context = null;
                nextConnect = null;
                reject(ex);
            }
        });
    };
}

/**
 * Converts an IOPA NodeFunc to an IOPA AppFunc
 *
 * @method promiseFromConnect4
 *
 * @param {function (err, req, res, next): void} fn - Connect/Express style middleware with 4 paramaters
 * @returns {function (context, next):promise} - IOPA style middlware where next is proxied from {function():Promise} 
 * @private
 */
function proxyConnect4(fn) {
    return function iopaFromConnect4(context, next) {
        var nextConnect = nextSyncFromIopaNextPromise(next);
        return new Promise(function (resolve, reject) {
            try {
                fn.call(context, context[IOPA.Error], context.req, context.res, nextConnect);
                context = null;
                nextConnect = null;
                resolve(null);
            } catch (ex) {
                context[IOPA.Error] = ex;
                context = null;
                nextConnect = null;
                reject(ex);
            }
        });
    };
}

/**
 * Converts an IOPA promise-based Next() function  to an synchronous Connect-style Next() function
 *
 * @method nextSyncFromIopaNextPromise
 *
 * @param {function():Promise} fn
 * @returns  (void) fn(err)
 * @private
 */
function nextSyncFromIopaNextPromise(fn) {
    return function connectFromIopaNext(err) {
        if (err) {
            this[IOPA.Error] = err;   // store err for subsequent Connect error handlers
            fn.call(this);
        }
        else
            fn.call(this);
    }
}
