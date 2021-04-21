import chai from 'chai'
import http from 'chai-http'
import server from './fixtures/index'
const expect = chai.expect

chai.use(http)

describe('@Resource hook', () => {
  after(() => {
    server.close()
  })

  it('should return an EntityResource[] if @Resource specified on an array', (done: Function) => {    
    chai
      .request(server)
      .get('/albums/titles')
      .end((err, res) => {
        expect(res).to.have.status(200)
        expect(res.body.albums).to.have.deep.members([
          { id: 0, title: 'McCartney I' },
          { id: 1, title: 'McCartney II' },
          { id: 2, title: 'McCartney III' }
        ])
        done()
      })
  })

  it('should return an EntityResource if @Resource specified on an object', (done: Function) => {    
    chai
      .request(server)
      .get('/albums/title?id=1')
      .end((err, res) => {
        expect(res).to.have.status(200)
        expect(res.body.album).to.eql({
          id: 1,
          title: 'McCartney II'
        })
        done()
      })
  })

  it('should not crash if @Resource specified on missing key', (done: Function) => {    
    chai
      .request(server)
      .get('/albums/title?id=5')
      .end((err, res) => {
        expect(res).to.have.status(404)
        done()
      })
  })
})
