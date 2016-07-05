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
 
const MiddlewareExtension = require('./middlewareExtension').default,
     iopaHTTP = require('../middleware/iopaHTTP').default,
     iopaReqRes = require('../middleware/iopaReqRes').default,
    iopa = require('iopa'),
    IopaApp = iopa.App,
    constants = iopa.constants,
    IOPA = constants.IOPA,
    SERVER = constants.SERVER

  /***
    * Method to build a node http compatible server (vs. IOPA)
    *
    * @return {function(context)} IOPA application 
    * @public
    */
 IopaApp.prototype.buildHttp = function ( opts ) {
	 return iopaHTTP ( this.build ( opts ) ) ;  
 };
 
// SAVE Original AppBuilder.Use and pass to proxy
  var nextMiddlewareProxy = IopaApp.prototype.middlewareProxy;
  IopaApp.prototype.middlewareProxy = MiddlewareExtension.bind(this, nextMiddlewareProxy); 

  /***
    * Proxy Method to use both Connect style and IOPA style Middleware
    *
    * @return {function(context)} IOPA application 
    * @public
    */
IopaApp.prototype.useLegacy = function useLegacy() {
    this.use(iopaReqRes);
}

exports.default = "IOPA-CONNECT SUCCESSFULLY REGISTERED";