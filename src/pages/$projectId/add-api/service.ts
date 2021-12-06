import request from '@/utils/request';

export async function _createApi(api: IApi) {
  return request.post('api-management/apis', {
    data: api,
  })
}
