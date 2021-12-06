import { Effect } from 'dva'
import { Reducer } from 'redux'
import { _fetchApis, _fetchGroups } from './service';

interface IApiModel {
  namespace: 'api',
  state: IApiState,
  effects: IApiEffects,
  reducers: IApiReducers,
}

export interface IApiState {
  groups: IGroup[],
  apis: IApi[]
}

interface IApiEffects {
  fetchGroups: Effect
  fetchApis: Effect
}

interface IApiReducers {
  getGroups: Reducer
  getApis: Reducer
}

const model: IApiModel = {
  namespace: 'api',
  state: {
    groups: [],
    apis: [],
  },
  effects: {
    *fetchGroups({ payload }, { call, put }) {
      const groups = yield call(_fetchGroups, payload)
      yield put({
        type: 'getGroups',
        payload: { groups },
      })
    },
    *fetchApis({ payload }, { call, put }) {
      const apis = yield call(_fetchApis, payload)
      yield put({
        type: 'getApis',
        payload: { apis },
      })
    },
  },
  reducers: {
    getGroups(state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },
    getApis(state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },
  },
}

export default model
