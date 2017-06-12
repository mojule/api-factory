'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var is = require('./is');
var defaultPlugins = require('./plugins');
var combine = require('./combinePlugins');
var normalize = require('./normalizePlugins');

var ApiFactory = function ApiFactory() {
  for (var _len = arguments.length, plugins = Array(_len), _key = 0; _key < _len; _key++) {
    plugins[_key] = arguments[_key];
  }

  var apiCache = new Map();
  var stateCache = new Map();

  var coreState = { core: [function (coreApi) {
      coreApi.getState = function (api) {
        return stateCache.get(api);
      };
      coreApi.getApi = function (state) {
        return apiCache.get(state);
      };
    }] };

  plugins = plugins.map(normalize);
  plugins = combine.apply(undefined, [defaultPlugins, coreState].concat(_toConsumableArray(plugins)));

  var _plugins = plugins,
      _plugins$core = _plugins.core,
      core = _plugins$core === undefined ? [] : _plugins$core,
      _plugins$publics = _plugins.publics,
      publics = _plugins$publics === undefined ? [] : _plugins$publics,
      _plugins$privates = _plugins.privates,
      privates = _plugins$privates === undefined ? [] : _plugins$privates,
      _plugins$statics = _plugins.statics,
      statics = _plugins$statics === undefined ? [] : _plugins$statics;


  var Api = function Api() {
    var createState = coreApi.createState,
        getStateKey = coreApi.getStateKey,
        isState = coreApi.isState,
        onCreate = coreApi.onCreate;


    var state = createState.apply(undefined, arguments);

    if (!isState(state)) throw Error('Api state argument fails isState test');

    var key = getStateKey(state);

    if (apiCache.has(key)) return apiCache.get(key);

    var privateApi = privates.reduce(function (api, fn) {
      fn(api, state, coreApi, staticApi);

      return api;
    }, {});

    var publicApi = publics.reduce(function (api, fn) {
      fn(api, state, coreApi, privateApi, staticApi);

      return api;
    }, {});

    stateCache.set(publicApi, state);
    apiCache.set(key, publicApi);

    onCreate(publicApi);

    return publicApi;
  };

  var staticApi = statics.reduce(function (api, fn) {
    fn(api);
    return api;
  }, { create: Api });

  var coreApi = core.reduce(function (api, fn) {
    fn(api, staticApi);
    return api;
  }, {});

  Object.assign(Api, staticApi);

  return Api;
};

module.exports = ApiFactory;