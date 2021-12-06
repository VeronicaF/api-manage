import { Effect } from 'dva'
import { Reducer } from 'redux'
import { _fetchCurrentUser } from '@/services/user';

interface IUserModel {
  state: IUserState,
  effects: IUserEffects,
  reducers: IUserReducers,
}

export interface IUserState {
  currentUser: any, // TODO: 改成正确的类型
}

interface IUserEffects {
  fetchCurrentUser: Effect
}

interface IUserReducers {
  getCurrentUser: Reducer
}

const model: IUserModel = {
  state: {
    currentUser: {},
  },
  effects: {
    *fetchCurrentUser(_, { call, put }) {
      const currentUser = yield call(_fetchCurrentUser)
      yield put({
        type: 'getCurrentUser',
        payload: { currentUser },
      })
    },
  },
  reducers: {
    getCurrentUser(state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },
  },
}

export default model
