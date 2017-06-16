'use strict'

const assert = require( 'assert' )
const is = require( '@mojule/is' )
const ApiFactory = require( '../' )
const Point = require( './fixtures/point' )

describe( 'API Factory', () => {
  describe( 'Factory', () => {
    const is = require( '../src/is' )

    it( 'Empty Factory', () => {
      const Api = ApiFactory()
      const api = Api()

      assert( is.function( Api ) )
      assert( is.object( api ) )
    })

    it( 'Is', () => {
      assert( !is.plugins( [] ) )
      assert( !is.plugins( { core: 42 } ) )
      assert( !is.plugins( { api: 42 } ) )
      assert( !is.plugins( { privates: 42 } ) )
      assert( !is.plugins( { statics: 42 } ) )
    })

    describe( 'Different plugin inputs', () => {
      const core = ({ core }) => {
        core.isState = state => is.number( state )
      }

      const api = ({ api, state }) => {
        api.value = () => state
      }

      it( 'Single set', () => {
        const Api = ApiFactory( { core, api } )
        const inst = Api( 42 )
        assert.strictEqual( inst.value(), 42 )
      })

      it( 'Multiple sets', () => {
        const Api = ApiFactory( { core }, { api } )
        const inst = Api( 42 )
        assert.strictEqual( inst.value(), 42 )
      })

      it( 'Public as just function', () => {
        const Api = ApiFactory( { core }, api )
        const inst = Api( 42 )
        assert.strictEqual( inst.value(), 42 )
      })

      it( 'Bad', () => {
        assert.throws( () => {
          ApiFactory( 42 )
        })
      })
    })
  })

  describe( 'Point', () => {
    it( 'Point API', () => {
      const point = Point( 5, 2 )

      assert.strictEqual( point.x, 5 )
      assert.strictEqual( point.y, 2 )
    })

    it( 'State key returns same instance', () => {
      const p1 = Point( 5, 2 )
      const p2 = Point( 5, 2 )
      const p3 = Point( 5, 3 )

      assert( p1 === p2 )
      assert( p1 !== p3 )
    })

    it( 'Throws on bad state', () => {
      assert.throws( () => Point() )
    })

    it( 'Adds', () => {
      const p1 = Point( 5, 2 )
      const p2 = Point( 3, 5 )
      const p3 = Point( 8, 7 )
      const p4 = p1.add( p2 )

      assert.strictEqual( p3, p4 )
    })
  })
})
