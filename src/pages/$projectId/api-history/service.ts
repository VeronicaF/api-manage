import request from '@/utils/request';

export async function _fetchApiHistory(apiHistoryId: number) {
  return request<IApiHistory>(`api-management/api-histories/${apiHistoryId}`)
}
