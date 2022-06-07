import { mock } from '@/utils/request';

export async function _fetchApi(apiId: number) {
  return mock<IApi>(`api-management/apis/${apiId}`)
}

export async function _editApi(apiId: number, api: IApi) {
  return mock.put(`api-management/apis/${apiId}`, {
    data: api,
  })
}

export async function _fetchApiHistoryRecords(apiId: number) {
  return mock<IApiHistoryRecord[]>('api-management/api-histories', {
    params: {
      apiId,
    },
  })
}
