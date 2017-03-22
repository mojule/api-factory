'use strict';

var is = require('@mojule/is');

var defaultOptions = {
  getStateKey: function getStateKey(state) {
    return state;
  },
  isState: function isState(state) {
    return true;
  },
  exposeState: true
};

var ApiFactory = function ApiFactory() {
  var modules = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (!is.array(modules)) modules = [modules];

  if (!validModules(modules)) throw new Error('Expected modules to be an array of functions');

  var _Object$assign = Object.assign({}, defaultOptions, options),
      getStateKey = _Object$assign.getStateKey,
      isState = _Object$assign.isState,
      exposeState = _Object$assign.exposeState;

  var apiCache = new Map();

  var Api = function Api(state) {
    if (!isState(state)) throw new Error('Api state argument fails isState test');

    var key = getStateKey(state);

    if (apiCache.has(key)) return apiCache.get(key);

    var api = function api(newState) {
      return Api(newState);
    };

    var plugin = function plugin(mod) {
      return Object.assign(api, mod(api, state));
    };

    if (exposeState) Object.assign(api, { state: state });

    modules.forEach(plugin);

    apiCache.set(key, api);

    return api;
  };

  Object.assign(Api, { isState: isState });

  return Api;
};

var validModules = function validModules(modules) {
  return is.array(modules) && modules.every(is.function);
};

module.exports = ApiFactory;