import { mock } from '@/utils/request';

export async function _fetchApiHistory(apiHistoryId: number) {
  return mock<IApiHistory>(`api-management/api-histories/${apiHistoryId}`)
}
