import request, { mock } from '@/utils/request';

interface ISearchResult {
  projects: IProject[],
  apis: IApi[],
}

export async function _search(paramName: string) {
  return mock<ISearchResult>('api-management/search', { params: { paramName } })
}
