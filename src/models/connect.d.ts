import { IUserState } from '@/models/user';
import { IApiState } from '@/pages/$projectId/model';

export interface Loading {
  global: boolean;
  effects: { [key: string]: boolean | undefined };
  models: {
    user?: boolean;
  };
}

export interface ConnectState {
  loading: Loading,
  user: IUserState,
  api: IApiState,
}

export interface ConnectModel {
}

declare module 'react-redux' {
  interface DefaultRootState extends ConnectState {

  }
}
