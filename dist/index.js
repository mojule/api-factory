'use strict';

var is = require('@mojule/is');

var defaultOptions = {
  getStateKey: function getStateKey(state) {
    return state;
  },
  isState: function isState(state) {
    return true;
  },
  exposeState: false,
  removePrivate: true,
  removeStatic: true
};

var ApiFactory = function ApiFactory() {
  var modules = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (!is.array(modules)) modules = [modules];

  if (!validModules(modules)) throw new Error('Expected modules to be an array of functions');

  var _Object$assign = Object.assign({}, defaultOptions, options),
      getStateKey = _Object$assign.getStateKey,
      isState = _Object$assign.isState,
      exposeState = _Object$assign.exposeState,
      removePrivate = _Object$assign.removePrivate,
      removeStatic = _Object$assign.removeStatic;

  var internalCache = new Map();
  var externalCache = new Map();
  var apiToState = new Map();

  var Api = function Api(state) {
    return CachedApi(state, externalCache, function (state, key) {
      var api = Internal(state);

      var prefixes = [];

      if (removePrivate) prefixes.push('_');

      if (removeStatic) prefixes.push('$');

      if (prefixes.length > 0) {
        api = withoutPrefixes(api, prefixes);

        handleResults(api);

        apiToState.set(api, state);
      }

      return api;
    });
  };

  var Internal = function Internal(state) {
    return CachedApi(state, internalCache, function (state) {
      var api = function api(newState) {
        return Internal(newState);
      };

      apiToState.set(api, state);

      api._getState = function (currentApi) {
        return apiToState.get(currentApi);
      };

      addModules(modules, api, state);

      if (exposeState) Object.assign(api, { state: state });

      return api;
    });
  };

  var CachedApi = function CachedApi(state, cache, getApi) {
    if (!isState(state)) throw new Error('Api state argument fails isState test');

    var key = getStateKey(state);

    if (cache.has(key)) return cache.get(key);

    var api = getApi(state, key);

    cache.set(key, api);

    return api;
  };

  var addModules = function addModules(modules, api, state) {
    var addModule = function addModule(module) {
      return Object.assign(api, module(api, state));
    };

    modules.forEach(addModule);
  };

  var addStatics = function addStatics(modules, api) {
    var addStatic = function addStatic(module) {
      var fns = module(api);
      var fnames = Object.keys(fns);

      var staticNames = fnames.filter(function (name) {
        return name.startsWith('$');
      });

      var staticFns = staticNames.reduce(function (statics, name) {
        var externalName = name.slice(1);

        statics[externalName] = fns[name];

        return statics;
      }, {});

      Object.assign(api, staticFns);
    };

    modules.forEach(addStatic);
  };

  var handleResult = function handleResult(result) {
    if (result && is.function(result._getState)) {
      var resultState = result._getState();

      return Api(resultState);
    }

    if (is.array(result)) {
      return result.map(handleResult);
    }

    if (is.object(result)) {
      Object.keys(result).forEach(function (key) {
        result[key] = handleResult(result[key]);
      });
    }

    return result;
  };

  var handleResults = function handleResults(api) {
    Object.keys(api).forEach(function (propertyName) {
      var fn = api[propertyName];

      if (is.function(fn)) api[propertyName] = mapResult(fn, handleResult);
    });
  };

  var statics = {};

  addStatics(modules, statics);

  Object.assign(Api, statics, { isState: isState });

  return Api;
};

var validModules = function validModules(modules) {
  return is.array(modules) && modules.every(is.function);
};

var withoutPrefixes = function withoutPrefixes(api, prefixes) {
  var propertyNames = Object.keys(api);

  return propertyNames.reduce(function (newApi, name) {
    var hasPrefix = prefixes.some(function (prefix) {
      return name.startsWith(prefix);
    });

    if (!hasPrefix) newApi[name] = api[name];

    return newApi;
  }, {});
};

var mapResult = function mapResult(fn, map) {
  return function () {
    return map(fn.apply(undefined, arguments));
  };
};

module.exports = ApiFactory;