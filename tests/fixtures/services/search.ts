import { Service, ServiceRequest, ServiceResponse, Validate } from '../../../lib'

export default class SearchService implements Service {
  @Validate({
    query: {
      search: true,
      startDate: 'Bad start date',
      endDate: (val: string) => {
        if (isNaN(Number(val))) throw new Error('Bad end date')
        return Boolean(val)
      },
      page: false,
      itemsPerPage: (val: any) => !isNaN(val)
    }
  })
  async index(req: ServiceRequest): Promise<ServiceResponse> {
    return {
      status: 204
    }
  }
}
