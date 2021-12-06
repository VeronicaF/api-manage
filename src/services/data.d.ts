interface IApiParam {
  paramId: string,
  paramName: string,
  paramType: string,
  requiredFlag: boolean,
  addressFlag: boolean,
  example: any,
  description: string,
}

interface IApiStatusCode {
  statusCodeId: string,
  statusCode: number,
  responseBody: string
}

type requestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface IApi {
  apiId: number,
  apiName: string,
  groupId: number,
  groupName: string,
  projectId: number,
  path: string,
  exampleUrl: string,
  requestMethod: requestMethod,
  completeFlag: boolean,
  requestContentType: string,
  responseContentType: string,
  requestBody: string,
  description: string,
  apiParams: IApiParam[],
  apiStatusCodes: IApiStatusCode[],
}

interface ISearchResult {
  projects: IProject[]
  apis: IApi[]
}
