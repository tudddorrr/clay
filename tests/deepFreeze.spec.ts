import chai from 'chai'
import deepFreeze from '../lib/utils/deepFreeze'

const expect = chai.expect

describe('deepFreeze', () => {
  it('should freeze nested objects', () => {
    const req = {
      body: {
        user: {
          id: 1
        }
      }
    }
  
    const frozen = deepFreeze(req)
    expect(Object.isFrozen(frozen)).to.equal(true)
    expect(Object.isFrozen(frozen.body)).to.equal(true)
    expect(Object.isFrozen(frozen.body.user)).to.equal(true)
  })

  it('should not freeze excluded keys', () => {
    const req = {
      body: {
        user: {
          id: 1
        }
      },
      headers: {
        'Content-Type': 'application/json'
      }
    }
  
    const frozen = deepFreeze(req, ['body.user', 'headers'])
    expect(Object.isFrozen(frozen)).to.equal(true)
    expect(Object.isFrozen(frozen.body)).to.equal(true)

    expect(Object.isFrozen(frozen.body.user)).to.equal(false)
    expect(Object.isFrozen(frozen.headers)).to.equal(false)
  })

  it('should not continue to freeze nested keys after an excluded path is hit', () => {
    const req = {
      body: {
        user: {
          id: 1,
          organisation: {
            name: 'Sleepy'
          }
        }
      }
    }
  
    const frozen = deepFreeze(req, ['body.user'])
    expect(Object.isFrozen(frozen)).to.equal(true)
    expect(Object.isFrozen(frozen.body)).to.equal(true)

    expect(Object.isFrozen(frozen.body.user)).to.equal(false)
    expect(Object.isFrozen(frozen.body.user.organisation)).to.equal(false)
  })
})