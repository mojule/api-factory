'use strict'

const ApiFactory = require( '../../src' )

const pointModule = ( api, state ) => {
  return {
    x: () => state.x,
    y: () => state.y
  }
}

const Point = ApiFactory( pointModule, { exposeState: false } )

const point = Point( { x: 5, y: 7 } )

console.log( point.state ) // undefined
