import { getServiceKey } from '../lib/utils/getServiceKey'

describe('getServiceKey', () => {
  it('should dotify paths', () => {
    expect(getServiceKey('/games')).to.equal('games')
    expect(getServiceKey('/api/games')).to.equal('api.games')
    expect(getServiceKey('/api/games/:gameId/stats')).to.equal('api.games.stats')
    expect(getServiceKey('/api/games/:gameId/stats/:statId/analytics')).to.equal('api.games.stats.analytics')
    expect(getServiceKey('/api/games/:gameId/stats/:statId/analytics/:analyticsKey/drilldowns')).to.equal('api.games.stats.analytics.drilldowns')
  })
})
