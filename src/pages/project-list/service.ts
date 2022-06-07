import request, { mock } from '@/utils/request';

export async function _fetchProjects() {
  return mock<IProject[]>('api-management/projects')
}

export async function _createProject(projectName: string) {
  return mock.post<IProject>('api-management/projects', {
    data: { projectName },
  })
}

export async function _editProject(projectId: number, projectName: string) {
  return mock.put<IProject>(`api-management/projects/${projectId}`, {
    data: { projectName },
  })
}

export async function _deleteProject(projectId: number) {
  return mock.delete<IProject>(`api-management/projects/${projectId}`)
}

export async function _exportProjects(projectIds: number[]) {
  return mock<Blob>('api-management/apis/export', {
    params: {
      projectIds,
    },
    responseType: 'blob',
  })
}
