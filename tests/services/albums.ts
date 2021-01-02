import { Service, ServiceRequest, ServiceResponse, ServiceRoute } from '../../lib'

export const routes: ServiceRoute[] = [
  {
    method: 'GET',
    path: '/albums/:id'
  },
  {
    method: 'GET',
    path: '/albums/:id/personnel/:personnelId',
    handler: 'getPersonnel'
  },
  {
    method: 'GET',
    path: '/albums',
    handler: 'getMany'
  }
]

interface Personnel {
  id: number,
  name: string
}

interface Album {
  id: number
  title: string
  artist: string
  personnel?: Personnel[]
}

export default class AlbumService implements Service<Album> {
  albums: Album[] = [
    {
      id: 0,
      title: 'McCartney I',
      artist: 'Paul McCartney'
    },
    {
      id: 1,
      title: 'McCarntey II',
      artist: 'Paul McCartney'
    },
    {
      id: 2,
      title: 'McCartney III',
      artist: 'Paul McCartney',
      personnel: [
        {
          id: 0,
          name: 'Steve Orchard'
        },
        {
          id: 1,
          name: 'Greg Kurstin'
        },
        {
          id: 2,
          name: 'Keith Smith'
        }
      ]
    }
  ]

  async get(req?: ServiceRequest): Promise<ServiceResponse> {
    const { id } = req.params
    const album = this.albums.find((a) => a.id === Number(id))

    if (!album) {
      return {
        status: 204,
        body: {
          album: null
        }
      }
    }

    return {
      status: 200,
      body: {
        album
      }
    }
  }

  async getPersonnel(req?: ServiceRequest): Promise<ServiceResponse> {
    const { id, personnelId } = req.params
    const album = this.albums.find((a) => a.id === Number(id))
    const personnel = album?.personnel?.find((p) => p.id === Number(personnelId))

    if (!album || !personnel) {
      return {
        status: 204,
        body: {
          album: null
        }
      }
    }

    return {
      status: 200,
      body: {
        album,
        personnel
      }
    }
  }

  async getMany(req?: ServiceRequest): Promise<ServiceResponse> {
    const { count } = req.query

    return {
      status: 200,
      body: {
        albums: this.albums.slice(0, Number(count))
      }
    }
  }
}
