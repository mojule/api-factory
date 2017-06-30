'use strict'

const properties = ({ core }) => {
  const propertyNames = new Set()

  core.registerProperty = ({
    target, name, get, set, enumerable = true, configurable = true
  }) => {
    propertyNames.add( name )

    Object.defineProperty( target, name, { get, set, enumerable, configurable } )
  }

  core.registerProperty({
    target: core,
    name: 'propertyNames',
    get: () =>  Array.from( propertyNames )
  })
}

module.exports = properties
