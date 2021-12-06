import request from '@/utils/request';

interface ISearchResult {
  projects: IProject[],
  apis: IApi[],
}

export async function _search(paramName: string) {
  return request<ISearchResult>('api-management/search', { params: { paramName } })
}
