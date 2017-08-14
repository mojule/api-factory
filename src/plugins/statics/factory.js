'use strict'

const factory = ({ statics, plugins, ApiFactory }) => {
  statics.Factory = ( ...pluginSets ) => ApiFactory( plugins, ...pluginSets )
}

module.exports = factory
