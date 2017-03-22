'use strict'

const ApiFactory = require( '../../src' )

const pointModule = ( api, state ) => {
  return {
    x: () => state.x,
    y: () => state.y
  }
}

const Point = ApiFactory( pointModule )

const p1 = { x: 5, y: 7 }
const p2 = { x: 5, y: 7 } // same x and y value, but different object instance

const point1 = Point( p1 )
const point2 = Point( p1 )
const point3 = Point( p2 )

console.log( point1 === point2 ) // same underlying state, returns true
console.log( point1 === point3 ) // different state, returns false
