import { Service, ServiceRequest, ServiceResponse, Validate } from '../../../lib'

export default class SearchService implements Service {
  @Validate({
    query: {
      search: true,
      startDate: 'Bad start date',
      endDate: async (val: string) => {
        if (isNaN(Number(val))) throw new Error('Bad end date')
        return Boolean(val)
      },
      page: false,
      itemsPerPage: async (val: any): Promise<boolean> => !isNaN(val)
    }
  })
  async index(req: ServiceRequest): Promise<ServiceResponse> {
    return {
      status: 204
    }
  }
}
