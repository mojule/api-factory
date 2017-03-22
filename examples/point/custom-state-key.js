'use strict'

const ApiFactory = require( '../../src' )

const pointModule = ( api, state ) => {
  return {
    x: () => state.x,
    y: () => state.y
  }
}

const getStateKey = state => state.x + ' ' + state.y

const Point = ApiFactory( pointModule, { getStateKey } )

const p1 = { x: 5, y: 7 }
const p2 = { x: 5, y: 7 }
const p3 = { y: 7, x: 5 }
const p4 = { x: 5, y: 7, z: -2 }
const p5 = { x: 3, y: 12 }

const point1 = Point( p1 )
const point2 = Point( p2 )
const point3 = Point( p3 )
const point4 = Point( p4 )
const point5 = Point( p5 )

console.log( point1 === point2 ) // same state key, true
console.log( point2 === point3 ) // true
console.log( point3 === point4 ) // true
console.log( point4 === point5 ) // different, false
