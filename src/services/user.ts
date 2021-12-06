import request from '@/utils/request';

export async function _fetchCurrentUser() {
  return request('users/current-user')
}
