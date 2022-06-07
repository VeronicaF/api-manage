import { mock } from '@/utils/request';

export async function _createApi(api: IApi) {
  return mock.post('api-management/apis', {
    data: api,
  })
}
