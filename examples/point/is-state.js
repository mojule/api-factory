'use strict'

const ApiFactory = require( '../../src' )

const pointModule = ( api, state ) => {
  return {
    x: () => state.x,
    y: () => state.y
  }
}

const arrayPointModule = ( api, state ) => {
  return {
    x: () => state[ 0 ],
    y: () => state[ 1 ]
  }
}

const isNumber = subject => typeof subject === 'number' && !Number.isNaN( subject )

const isObjectPoint = state =>
  state && typeof state === 'object' && isNumber( state.x ) && isNumber( state.y )

const isArrayPoint = state =>
  Array.isArray( state ) && isNumber( state[ 0 ] ) && isNumber( state[ 1 ] )

const ObjectPoint = ApiFactory( pointModule, { isState: isObjectPoint } )
const ArrayPoint = ApiFactory( arrayPointModule, { isState: isArrayPoint } )

const PointApis = [ ObjectPoint, ArrayPoint ]

const Point = state => {
  const Api = PointApis.find( P => P.isState( state ) )

  if( !Api ) throw new Error( 'No API found that handles that state' )

  return Api( state )
}

const p1 = { x: 5, y: 7 }
const p2 = [ 5, 7 ]

const point1 = Point( p1 )
const point2 = Point( p2 )

console.log( point1.x(), point1.y() ) // 5 7
console.log( point2.x(), point2.y() ) // 5 7
