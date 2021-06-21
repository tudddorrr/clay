import { Service, ServiceRequest, ServiceResponse, Validate } from '../../../lib'

export default class SearchService implements Service {
  @Validate({
    query: {
      search: true,
      startDate: 'Bad start date',
      endDate: (val: any) => isNaN(val) ? 'Bad end date' : null,
      page: false
    }
  })
  async index(req: ServiceRequest): Promise<ServiceResponse> {
    return {
      status: 204
    }
  }
}
