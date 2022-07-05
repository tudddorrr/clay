import { ClayParamRequiredType, ClayParamType } from '.'

export class ClayParam {
  type: ClayParamType
  name: string
  required: ClayParamRequiredType
  description: string = ''

  constructor(type: ClayParamType, name: string, required: ClayParamRequiredType) {
    this.type = type
    this.name = name
    this.required = required
  }

  toJSON() {
    return {
      name: this.name,
      description: this.description,
      type: this.type ?? ClayParamRequiredType.NO,
      required: this.required
    }
  }
}
