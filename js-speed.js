/*! js-speed.js -v0.0.1 | Copyright (c) 2017 Subversivo58 <https://github.com/subversivo58> | Licensed MIT */
;(function (root, factory) {
    if ( typeof define === 'function' && define.amd ) {
        define(['exports'], factory);
    } else if ( typeof exports !== 'undefined' ) {
        factory(exports);
    } else {
        factory((root.JsSpeed = {}));
    }
}(this, function (exports) {

    // scoped variables
    var dc = document,
        wd = window,
        nv = wd.navigator,
        sets = {
            promise: true,
            strict: true,
            cached: false,
            log: true
        },
        /**
         * Default resource link (because CORS and cause: Open Source)
         * File description:
         *     Logo Open Source Initiative (SVG)
         * License:
         *     Creative Commons Attribution 2.5 - 2014 Open Source Initiative official SVG
         * Attribution:
         *     By Open Source Initiative official SVG (Simon Phipps, former president of OSI)
         *     [CC BY 2.5 (http://creativecommons.org/licenses/by/2.5)], via Wikimedia Commons
         */
        uri = 'https://upload.wikimedia.org/wikipedia/commons/4/42/Opensource.svg';

    try{

        /**
         * Extend objects [expect object's]
         * @return {object}
         * @throw {object} [empty]
         * private API
         */
        var extend = function(){
            try{
                var hasOwnProperty = Object.prototype.hasOwnProperty,
                    target = {};
                for (var i = 0; i < arguments.length; i++) {
                    var source = arguments[i];
                    for (var key in source) {
                         if ( hasOwnProperty.call(source, key) ) {
                             target[key] = source[key];
                         }
                    }
                }
                return target;
            }catch(extend_ex){
                return {};
            }
        };

        /**
         * Human readable metrics
         * @param num {number}
         * @return {string}
         * private API
         */
         var prettyBytes = function(num) {
             var exponent,
                 unit,
                 neg = num < 0,
                 units = ['Kb/s', 'Mb/s', 'Gb/s'];
             if ( neg ) {
                 num = -num;
             }
             if ( num < 1 ) {
                 return (neg ? '-' : '') + num + ' Kbps';
             }
             exponent = Math.min(Math.floor(Math.log(num) / Math.log(1024)), units.length - 1);
             num = Number((num / Math.pow(1024, exponent)).toFixed(2));
             unit = units[exponent];
             return (neg ? '-' : '') + num + ' ' + unit;
         };

        /**
         * Extract querystring
         * @param query {object}
         * @return {object}
         * @throw {boolean}:false
         * private API
         */
        var extract_query = function(){
            //
            var query_to_obj = function(query){
                //
                try{
                    query = JSON.parse('{"' + decodeURI(query.replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}');
                    // chage strings to booleans
                    for (var k in query) {
                         if ( query.hasOwnProperty(k) ) {
                             if ( query[k] === "true" ) {
                                 query[k] = true;
                             }
                             if ( query[k] === "false" ) {
                                 query[k] = false;
                             }
                         }
                    }
                    sets = extend({}, sets, query);
                    return sets;
                }catch(ex){
                    return false;
                }
            };
            //
            var scripts = dc.body.getElementsByTagName('script'),
                query = false;
            for (var i = 0; i < scripts.length; i++) {
                 if ( (/\/js-speed\.js/g.test(scripts[i].src)) ) {
                     query = scripts[i].src.split('?')[1];
                 }
            }
            if ( (!!query) ) {
                return query_to_obj(query);
            } else {
                return false;
            }
        };

        /**
         * Bandwidth test
         * @param opt {object} [uri{string}|timeout{number}|cached{boolean}]
         * @return {Promise}
         * private|public API
         */
        var Bandwidth = {
            test: function(opt){
                var file = (!!opt && opt.uri) ? opt.uri : uri;
                var timeout = (!!opt && opt.timeout) ? opt.timeout : sets.timeout;
                var cached = (!!opt && opt.cached) ? opt.cached : sets.cached;
                return new Promise(function(resolve, reject){
                    var startTime, endTime, fileSize;
                    var xhr = new XMLHttpRequest();
                    xhr.timeout = timeout;
                    xhr.onreadystatechange = function(){
                        if ( xhr.readyState === 4 && xhr.status === 200 ) {
                            endTime = (new Date()).getTime();
                            fileSize = xhr.responseText.length;
                            var bandwidth = ((fileSize * 8) / ((endTime - startTime) / 1000) / 1024*2);
                            resolve(prettyBytes(bandwidth));
                        }
                    };
                    xhr.ontimeout = function(t){
                        reject(t);
                    };
                    xhr.onerror = function(e){
                        reject(e);
                    };
                    startTime = (new Date()).getTime();
                    // is cached ? if not, add timestamp to url for prevent cache
                    var final_url = cached ? file : file+'?'+startTime;
                    //
                    xhr.open('GET', final_url, true);
                    xhr.send();
                });
            }
        };

        /**
         * Plugin definition [extract querystring and return new or default sets]
         * @return {object}:Promise
         * @throw {object}:Promise
         * private API
         */
        var __DEFINE__ = function(){
            return new Promise(function(resolve, reject){
                try{
                    // expect object
                    var args = extract_query();
                    if ( (!!args) && (typeof args === 'object') ) {
                        resolve(args);
                    }
                    resolve(sets);
                }catch(ex_){
                    reject(ex_);
                }
            });
        };

        /**
         * Personal console output
         * @param param {string} (error|debug|warn|info|log)
         * @param msg {string|object} message content
         * @throw console.log as default
         * private API
         */
         var log = function(param, msg){
             try{
                 if ( sets.log ) {
                     console[ param ]( msg );
                 }
             }catch(log_ex){
                 console.log('['+param+'] ' + msg);
             }
         }
    }catch(ex_){
        //
    }
    /**
     *
     */
    var Plugin = function(options){
        //
        if ( !!options && typeof options === 'object' ) {
            if ( !!options.uri ) {
                this.uri = uri = options.uri;
            } else {
                this.uri = uri;
            }
            if ( !!options.timeout && options.timeout === 'number' ) {
                this.timeout = sets.timeout = options.timeout;
            } else {
                this.timeout = sets.timeout;
            }
            if ( !!options.cached && typeof options.cached === 'boolean' ) {
                this.cached = sets.cached = options.cached;
            } else {
                this.cached = sets.cached;
            }
        } else {
            this.uri = uri;
            this.timeout = sets.timeout;
            this.cached = sets.cached;
        }
    };

    // extend (prototype) Bandwith.test to Plugin
    Plugin.prototype.test = Bandwidth.test;

    /**
     * Initialize excential functions and load resources of Plugin
     * private API
     */
    Plugin.prototype.init = function(){
        //
        var self = this;
        __DEFINE__()
        .then(function(response){
            if ( response.promise && response.strict ) {
                JsSpeed = Plugin;
            } else if ( !response.promise && !response.strict ) {
                self.test({
                    uri: self.uri,
                    timeout: self.timeout,
                    cached: self.cached
                })
                .then(function(result){
                    JsSpeed = result;
                })
                .catch(function(e){
                    delete JsSpeed;
                    log('error', e);
                });
            } else if ( !response.promise && response.strict ) {
                self.test({
                    uri: self.uri,
                    timeout: self.timeout,
                    cached: self.cached
                })
                .then(function(res){
                    delete JsSpeed;
                    nv.JsSpeed = res;
                })
                .catch(function(e){
                    delete JsSpeed;
                    log('error', e);
                });
            }
        })
        .catch(function(error){
            log('error', error);
        });
    };

    /**
     * Prepare to extend (whith jQuery)
     */
    var PluginExtend = new Plugin();
    if ( typeof this.jQuery === 'undefined' ) {
        $.extend({
            JsSpeed: PluginExtend.test
        });
    }

    // AMD|COMMON exports
    exports.JsSpeed = Plugin;

    /**
     * auto initialize after DOM is loaded
     */
     document.addEventListener("DOMContentLoaded", PluginExtend.init(), false);
}));
