'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var combine = function combine() {
  for (var _len = arguments.length, plugins = Array(_len), _key = 0; _key < _len; _key++) {
    plugins[_key] = arguments[_key];
  }

  return plugins.reduce(function (combined, _ref) {
    var _combined$core, _combined$publics, _combined$privates, _combined$statics;

    var _ref$core = _ref.core,
        core = _ref$core === undefined ? [] : _ref$core,
        _ref$publics = _ref.publics,
        publics = _ref$publics === undefined ? [] : _ref$publics,
        _ref$privates = _ref.privates,
        privates = _ref$privates === undefined ? [] : _ref$privates,
        _ref$statics = _ref.statics,
        statics = _ref$statics === undefined ? [] : _ref$statics;

    (_combined$core = combined.core).push.apply(_combined$core, _toConsumableArray(core));
    (_combined$publics = combined.publics).push.apply(_combined$publics, _toConsumableArray(publics));
    (_combined$privates = combined.privates).push.apply(_combined$privates, _toConsumableArray(privates));
    (_combined$statics = combined.statics).push.apply(_combined$statics, _toConsumableArray(statics));

    return combined;
  }, {
    core: [],
    publics: [],
    privates: [],
    statics: []
  });
};

module.exports = combine;