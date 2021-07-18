import { Service, ServiceRequest, ServiceResponse, Validate } from '../../../lib'
import { Routes } from '../../../lib/hooks/routes'

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

@Routes([
  {
    method: 'GET',
    path: '/albums/titles',
    handler: 'getAlbumTitles'
  },
  {
    method: 'GET',
    path: '/albums/title',
    handler: 'getAlbumTitle'
  },
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
  },
  {
    method: 'POST',
    path: '/albums/:id/reviews',
    handler: () => async (req: ServiceRequest): Promise<ServiceResponse> => {
      return {
        status: 200,
        body: {
          review: req.body
        }
      }
    }
  },
  {
    method: 'PUT',
    path: '/albums/:id/reviews/:reviewId',
    handler: (service: AlbumService) => async (req: ServiceRequest): Promise<ServiceResponse> => {
      return await service.editReview(req)
    }
  }
])
export default class AlbumService implements Service {
  albums: Album[] = [
    {
      id: 0,
      title: 'McCartney I',
      artist: 'Paul McCartney'
    },
    {
      id: 1,
      title: 'McCartney II',
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

  async get(req: ServiceRequest): Promise<ServiceResponse> {
    const { id } = req.params
    const album = this.albums.find((a) => a.id === Number(id))

    if (!album) {
      req.ctx.throw(404, 'Album not found')
    }

    return {
      status: 200,
      body: {
        album
      }
    }
  }

  async getPersonnel(req: ServiceRequest): Promise<ServiceResponse> {
    const { id, personnelId } = req.params
    const album = this.albums.find((a) => a.id === Number(id))
    const personnel = album?.personnel?.find((p) => p.id === Number(personnelId))

    if (!album || !personnel) {
      req.ctx.throw(404, 'Album/personnel not found')
    }

    return {
      status: 200,
      body: {
        album,
        personnel
      }
    }
  }

  @Validate({
    query: {
      count: 'Count not specified'
    }
  })
  async getMany(req: ServiceRequest): Promise<ServiceResponse> {
    const { count } = req.query

    return {
      status: 200,
      body: {
        albums: this.albums.slice(0, Number(count))
      }
    }
  }

  async editReview(req: ServiceRequest): Promise<ServiceResponse> {
    return {
      status: 200,
      body: {
        updatedAt: Date.now()
      }
    }
  }

  async getAlbumTitles(req: ServiceRequest): Promise<ServiceResponse> {
    return {
      status: 200,
      body: {
        albums: this.albums
      }
    }
  }

  @Validate({
    query: ['id']
  })
  async getAlbumTitle(req: ServiceRequest): Promise<ServiceResponse> {
    const { id } = req.query
    const album = this.albums.find((album) => album.id === Number(id))

    if (!album) {
      req.ctx.throw(404, 'Album not found')
    }

    return {
      status: 200,
      body: {
        album
      }
    }
  }
}
