import { Service, Request, Response, Validate, ValidationCondition } from '../../../lib'

export default class SearchService implements Service {
  @Validate({
    query: {
      search: {
        required: true
      },
      startDate: {
        required: true,
        error: 'Bad start date'
      },
      endDate: {
        requiredIf: async (req: Request): Promise<boolean> => {
          return new Date().getMilliseconds() - new Date(req.query.startDate).getMilliseconds() < 24 * 60 * 60 * 1000
        },
        validation: async (val: unknown): Promise<ValidationCondition[]> => [{
          check: !isNaN(val as number),
          error: 'Bad end date'
        }]
      },
      itemsPerPage: {
        required: true,
        validation: async (val: unknown): Promise<ValidationCondition[]> => [{
          check: !isNaN(val as number)
        }]
      }
    }
  })
  async index(req: Request): Promise<Response> {
    return {
      status: 204
    }
  }
}
