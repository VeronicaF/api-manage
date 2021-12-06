import request from '@/utils/request';

export async function _editApi(data: Partial<IApi>) {
  return request.put(`api-management/apis/${data.apiId}`, { data })
}

export async function _exportApis(apiIds: number[]) {
  return request<Blob>('api-management/apis/export', {
    params: {
      apiIds,
    },
    responseType: 'blob',
  })
}
