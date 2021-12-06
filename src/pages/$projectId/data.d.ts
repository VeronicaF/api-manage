interface IGroup {
  groupId: number,
  groupName: string
}

interface IApiHistoryRecord {
  createTime: string, // 本条记录的创建时间（修改时间）
  oid: number,
  updateLog: string,
  creatorIP: string, // 本条记录创建人IP（修改人IP）
}
