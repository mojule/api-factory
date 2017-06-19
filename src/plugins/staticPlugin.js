'use strict'

const staticPlugin = ({ statics, plugins, ApiFactory }) => {
  statics.Factory = ( ...pluginSets ) => ApiFactory( plugins, ...pluginSets )
}

module.exports = staticPlugin
