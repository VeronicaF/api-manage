import { mock } from '@/utils/request';

export async function _fetchApis(params: any) {
  return mock<IApi[]>('api-management/apis', { params })
}

export async function _deleteApi(apiId: number) {
  return mock.delete(`api-management/apis/${apiId}`)
}

export async function _fetchGroups(params: any) {
  return mock<IGroup[]>('api-management/groups', { params })
}

export async function _editGroup(groupId: number, data: { groupName: string }) {
  return mock.put(`api-management/groups/${groupId}`, { data })
}

export async function _createGroup(data: { projectId: number, groupName: string }) {
  return mock.post('api-management/groups', { data })
}

export async function _deleteGroup(groupId: number) {
  return mock.delete(`api-management/groups/${groupId}`)
}

export async function _exportGroups(groupIds: number[]) {
  return mock<Blob>('api-management/apis/export', {
    params: {
      groupIds,
    },
    responseType: 'blob',
  })
}
