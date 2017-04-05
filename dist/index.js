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
  stateParsers: [],
  onCreate: function onCreate(api) {}
};

var defaultStateParser = function defaultStateParser(Api) {
  return arguments.length <= 1 ? undefined : arguments[1];
};

var ApiFactory = function ApiFactory() {
  var modules = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (!is.array(modules)) modules = [modules];

  if (!validModules(modules)) throw new Error('Expected modules to be an array of functions');

  options = Object.assign({}, defaultOptions, options);

  ensureOptions(options);

  var _options = options,
      getStateKey = _options.getStateKey,
      isState = _options.isState,
      exposeState = _options.exposeState,
      stateParsers = _options.stateParsers,
      onCreate = _options.onCreate;


  stateParsers.push(defaultStateParser);

  var parseState = function parseState(Api) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var state = void 0;

    stateParsers.forEach(function (parser) {
      if (is.undefined(state)) state = parser.apply(undefined, [Api].concat(args));
    });

    return state;
  };

  var apiCache = new Map();
  var stateCache = new Map();

  var getState = function getState(instance) {
    return stateCache.get(instance);
  };

  var Api = function Api() {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var state = parseState.apply(undefined, [Api].concat(args));

    if (!Api.isState(state)) throw new Error('Api state argument fails isState test');

    var key = Api.getStateKey(state);

    if (apiCache.has(key)) return apiCache.get(key);

    var api = function api() {
      return Api.apply(undefined, arguments);
    };

    var plugin = function plugin(mod) {
      var modApi = mod(api, state, getState);

      Object.keys(modApi).forEach(function (key) {
        if (key.startsWith('$')) {
          modApi[key.slice(1)] = modApi[key];
          delete modApi[key];
        }
      });

      Object.assign(api, modApi);
    };

    if (exposeState) Object.assign(api, { state: state });

    stateCache.set(api, state);

    modules.forEach(plugin);

    apiCache.set(key, api);

    Api.onCreate(api);

    return api;
  };

  var statics = Statics(Api, modules);

  Object.assign(Api, statics, { isState: isState, getStateKey: getStateKey, onCreate: onCreate });

  return Api;
};

var validModules = function validModules(modules) {
  return is.array(modules) && modules.every(is.function);
};

var ensureOptions = function ensureOptions(options) {
  var getStateKey = options.getStateKey,
      isState = options.isState,
      exposeState = options.exposeState,
      stateParsers = options.stateParsers,
      onCreate = options.onCreate;


  if (!is.function(getStateKey)) throw new Error('getStateKey option should be a function');

  if (!is.function(isState)) throw new Error('isState option should be a function');

  if (!is.function(onCreate)) throw new Error('onCreate option should be a function');

  if (!is.boolean(exposeState)) throw new Error('exposeState option should be a boolean');

  if (!is.array(stateParsers) || !stateParsers.every(is.function)) throw new Error('stateParsers option should be an array of functions');
};

var Statics = function Statics(Api, modules) {
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
  }, Api);
};

module.exports = ApiFactory;