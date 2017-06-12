'use strict';

var Is = require('@mojule/is');

var plugin = function plugin(_plugin) {
  return Is.array(_plugin) && _plugin.every(Is.function);
};

var plugins = function plugins(_plugins) {
  if (!Is.object(_plugins)) return false;

  var core = _plugins.core,
      publics = _plugins.publics,
      privates = _plugins.privates,
      statics = _plugins.statics;


  if (core && !plugin(core)) return false;

  if (publics && !plugin(publics)) return false;

  if (privates && !plugin(privates)) return false;

  if (statics && !plugin(statics)) return false;

  return true;
};

var predicates = { plugin: plugin, plugins: plugins };

var is = Is(predicates);

module.exports = is;