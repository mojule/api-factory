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

      const data = api.createData( newX, newY )

      return api( data )
    },
    getData: () => api.createData( api.x(), api.y() )
  }
}

const Point = ApiFactory( [ pointModule, coreModule ] )
const ArrayPoint = ApiFactory( [ arrayPointModule, coreModule ] )

const p1 = { x: 5, y: 7 }
const point1 = Point( p1 )
const point2 = point1.add( -1, 2 )
const point3 = point2.add( 3, -6 )
const p2 = point2.getData()
const p3 = point3.getData()

const a1 = [ 5, 7 ]
const arrayPoint1 = ArrayPoint( a1 )
const arrayPoint2 = arrayPoint1.add( -1, 2 )
const arrayPoint3 = arrayPoint2.add( 3, -6 )
const a2 = arrayPoint2.getData()
const a3 = arrayPoint3.getData()

console.log( p1 ) // { x: 5, y: 7 }
console.log( p2 ) // { x: 4, y: 9 }
console.log( p3 ) // { x: 7, y: 3 }

console.log( a1 ) // [ 5, 7 ]
console.log( a2 ) // [ 4, 9 ]
console.log( a3 ) // [ 7, 3 ]
