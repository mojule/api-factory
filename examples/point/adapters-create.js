'use strict'

const ApiFactory = require( '../../src' )

const pointModule = ( api, state ) => {
  return {
    createData: ( x, y ) => ({ x, y }),
    x: () => state.x,
    y: () => state.y
  }
}

const arrayPointModule = ( api, state ) => {
  return {
    createData: ( x, y ) => [ x, y ],
    x: () => state[ 0 ],
    y: () => state[ 1 ]
  }
}

const coreModule = ( api, state ) => {
  return {
    add: ( x, y ) => {
      const newX = api.x() + x
      const newY = api.y() + y

      return api.createData( newX, newY )
    }
  }
}

const Point = ApiFactory( [ pointModule, coreModule ] )
const ArrayPoint = ApiFactory( [ arrayPointModule, coreModule ] )

const p1 = { x: 5, y: 7 }
const a1 = [ 5, 7 ]

const point = Point( p1 )
const arrayPoint = ArrayPoint( a1 )

const p2 = point.add( -1, 2 )
const a2 = arrayPoint.add( -1, 2 )

console.log( p1 ) // { x: 5, y: 7 }
console.log( p2 ) // { x: 4, y: 9 }

console.log( a1 ) // { x: 5, y: 7 }
console.log( a2 ) // { x: 4, y: 9 }
