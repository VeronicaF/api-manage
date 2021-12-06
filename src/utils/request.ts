/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend } from 'umi-request';
import { notification } from 'antd';
import { stringify } from 'qs';
import api, { MOCK_API_URL, URL } from './getBaseURL'

// 一个永远不会resolve的promise，视为放弃这次请求的结果，防止页面报错
// eslint-disable-next-line no-empty-function
const NEVER_RESOLVE = new Promise(() => {})

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

/**
 * 异常处理程序
 */
const errorHandler = (error: { response?: Response, data?: any }): any => {
  const { response } = error;
  if (!response) {
    notification.error({
      description: '您的网络发生异常，无法连接服务器',
      message: '网络异常',
    });
    return NEVER_RESOLVE // 返回一个永远不会resolve的promise
  }
  const { status } = response

  if (status >= 400 && status < 500) { // 用户操作错误，抛出错误到model层做处理
    throw error
  } else if (status >= 500) { // 服务器错误，弹出提示，不做处理
    // @ts-ignore
    const errorText = error?.data?.message ?? (codeMessage[response.status] || response.statusText);
    const { url } = response;

    notification.error({
      message: `请求错误 ${status}: ${url}`,
      description: errorText,
    });
    return NEVER_RESOLVE // 返回
  }
  return response;
};

/**
 * 配置request请求时的默认参数
 */
const request = extend({
  errorHandler, // 默认错误处理
  credentials: 'include', // 默认请求是否带上cookie
  paramsSerializer: params => {
    return stringify(params, { arrayFormat: 'comma' })
  },
  prefix: api,
});

// 登录验证
request.interceptors.response.use(async (response) => {
  const { status } = response
  if (status === 401) { // 无权限查看，跳到登录页
    window.location.href = `${URL}/login/#/?callback=${encodeURIComponent(window.location.href)}`;
    return NEVER_RESOLVE as Promise<Response> // 返回一个永远不会resolve的promise
  }
  return response;
})

const mock = extend({
  errorHandler, // 默认错误处理
  credentials: 'include', // 默认请求是否带上cookie
  prefix: MOCK_API_URL,
  paramsSerializer: params => {
    return stringify(params, { arrayFormat: 'comma' })
  },
});

export {
  request,
  mock,
}

export default request;
