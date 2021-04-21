import chai from 'chai'
import http from 'chai-http'
import server from './fixtures/index'
const expect = chai.expect

chai.use(http)

describe('Request parsing', () => {
  after(() => {
    server.close()
  })

  it('should correctly parse query strings', (done: Function) => {
    chai
    .request(server)
    .get('/albums?count=2')
    .end((err, res) => {
      expect(res).to.have.status(200)
      expect(res.body).to.have.property('albums').with.lengthOf(2)
      done()
    })
  })

  it('should correctly parse a route param', (done: Function) => {
    chai
      .request(server)
      .get('/albums/1')
      .end((err, res) => {
        expect(res).to.have.status(200)
        expect(res.body).to.have.property('album').with.property('title', 'McCartney II')
        done()
      })
  })

  it('should correctly parse many route params', (done: Function) => {
    chai
      .request(server)
      .get('/albums/2/personnel/1')
      .end((err, res) => {
        expect(res).to.have.status(200)
        expect(res.body).to.have.property('album').with.property('title', 'McCartney III')
        expect(res.body).to.have.property('personnel').with.property('name', 'Greg Kurstin')
        done()
      })
  })
})
