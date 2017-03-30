'use strict';

var is = require('@mojule/is');

var defaultOptions = {
  getStateKey: function getStateKey(state) {
    return state;
  },
  isState: function isState(state) {
    return true;
  },
  exposeState: false
};

var ApiFactory = function ApiFactory() {
  var modules = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (!is.array(modules)) modules = [modules];

  if (!validModules(modules)) throw new Error('Expected modules to be an array of functions');

  options = Object.assign({}, defaultOptions, options);

  var _options = options,
      getStateKey = _options.getStateKey,
      isState = _options.isState,
      exposeState = _options.exposeState;


  var apiCache = new Map();
  var stateCache = new Map();

  var getState = function getState(instance) {
    return stateCache.get(instance);
  };

  var Api = function Api(state) {
    if (!isState(state)) throw new Error('Api state argument fails isState test');

    var key = getStateKey(state);

    if (apiCache.has(key)) return apiCache.get(key);

    var api = function api(newState) {
      return Api(newState);
    };

    var plugin = function plugin(mod) {
      return Object.assign(api, mod(api, state, getState));
    };

    if (exposeState) Object.assign(api, { state: state });

    stateCache.set(api, state);

    modules.forEach(plugin);

    Object.keys(api).forEach(function (key) {
      if (key.startsWith('$')) {
        api[key.slice(1)] = api[key];

        delete api[key];
      }
    });

    apiCache.set(key, api);

    return api;
  };

  var statics = Statics(modules);

  Object.assign(Api, statics, { isState: isState });

  return Api;
};

var validModules = function validModules(modules) {
  return is.array(modules) && modules.every(is.function);
};

var Statics = function Statics(modules) {
  return modules.reduce(function (statics, mod) {
    var fns = mod(statics);

    var staticNames = Object.keys(fns).filter(function (name) {
      return name.startsWith('$');
    });

    staticNames.forEach(function (name) {
      var unprefixed = name.slice(1);

      statics[unprefixed] = fns[name];
    });

    return statics;
  }, {});
};

module.exports = ApiFactory;