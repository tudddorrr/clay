import chai from 'chai'
import http from 'chai-http'
import server from './fixtures/index'
const expect = chai.expect

chai.use(http)

describe('Handler functions', () => {
  after(() => {
    server.close()
  })

  it('should handle a route handler defined as an anonymous function', (done: Function) => {
    chai
      .request(server)
      .post('/albums/2/reviews')
      .type('json')
      .send(JSON.stringify({ title: 'Bad album', text: 'That\'s just my opinion' }))
      .end((err, res) => {
        expect(res).to.have.status(200)
        expect(res.body).to.have.property('review')
        done()
      })
  })
  
  it('should handle a route handler that calls a function from the service', (done: Function) => {
    chai
      .request(server)
      .put('/albums/2/reviews/1')
      .end((err, res) => {
        expect(res).to.have.status(200)
        expect(res.body).to.have.property('updatedAt')
        done()
      })
  })
})
