'use strict';

var core = function core(api) {
  api.createState = function () {
    return arguments.length <= 0 ? undefined : arguments[0];
  };
  api.getStateKey = function (state) {
    return state;
  };
  api.isState = function (state) {
    return true;
  };
  api.onCreate = function (api) {};
};

module.exports = [core];