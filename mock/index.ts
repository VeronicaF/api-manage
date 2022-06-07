import type { Request, Response } from 'express';
import { remove, flatten } from 'lodash';
import { Random } from 'mockjs';

const projects: IProject[] = [];

const pid2Groups = new Map<number, IGroup[]>();

const pid2APIs = new Map<number, IApi[]>();

const aid2Params = new Map<number, IApiParam[]>();

const aid2StatusCode = new Map<number, IApiStatusCode[]>();

export default {
  '/api/v1/api-management/projects': (req: Request, res: Response) => {
    res.json(projects);
  },
  'POST /api/v1/api-management/projects': (req: Request, res: Response) => {
    const newData = {
      projectName: req.body.projectName,
      projectId: Random.increment(),
    };
    projects.push(newData);
    res.json(newData);
  },
  'PUT /api/v1/api-management/projects/:projectId': (req: Request, res: Response) => {
    const o = projects.find(({ projectId }) => projectId == +req.params.projectId);
    o && (o.projectName = req.body.projectName);
    res.json(true);
  },
  'DELETE /api/v1/api-management/projects/:projectId': (req: Request, res: Response) => {
    remove(projects, ({ projectId }) => projectId === +req.params.projectId);
    console.log(projects);
    res.json(projects);
  },

  '/api/v1/api-management/groups': (req: Request, res: Response) => {
    const projectId = +req.query.projectId!;
    if (!pid2Groups.has(projectId)) {
      pid2Groups.set(projectId, []);
    }
    res.json(pid2Groups.get(projectId));
  },
  'POST /api/v1/api-management/groups': (req: Request, res: Response) => {
    pid2Groups.get(req.body.projectId)?.push({
      groupId: Random.increment(),
      groupName: req.body.groupName,
    });
    res.json(true);
  },
  'PUT /api/v1/api-management/groups/:groupId': (req: Request, res: Response) => {
    const groupId = +req.params.groupId!;
    const group = flatten([...pid2Groups.values()]).find(g => g.groupId === groupId);
    group && (group.groupName = req.body.groupName);
    res.json(true);
  },
  'DELETE /api/v1/api-management/groups/:groupId': (req: Request, res: Response) => {

    const groupId = +req.params.groupId!;
    const o = [...pid2Groups.values()]
      .find(gs => gs.some(g => g.groupId === groupId)) ?? [];
    remove(o, g => g.groupId === groupId);
    res.json(true);
  },

  '/api/v1/api-management/apis': (req: Request, res: Response) => {
    const projectId = +req.query.projectId!;
    if (!pid2APIs.has(projectId)) {
      pid2APIs.set(projectId, []);
    }
    res.json(pid2APIs.get(projectId));
  },
  'POST /api/v1/api-management/apis': (req: Request, res: Response) => {
    const projectId = +req.body.projectId!;
    if (!pid2APIs.has(projectId)) {
      pid2APIs.set(projectId, []);
    }
    const o = {
      apiId: Random.increment(),
      ...req.body,
      groupName: pid2Groups.get(projectId)!.find(g => g.groupId === req.body.groupId)!.groupName,
      apiParams: req.body.apiParams?.map((p: any) => ({
        ...p,
        paramId: Random.increment(),
      })) ?? [],
      apiStatusCodes: req.body.apiStatusCodes?.map((p: any) => ({
        ...p,
        statusCodeId: Random.increment(),
      })) ?? [],
    };
    pid2APIs.get(projectId)?.push(o);
    res.json(o);
  },
  'DELETE /api/v1/api-management/apis/:apiId': (req: Request, res: Response) => {
    const apiId = +req.params.apiId!;
    const o = [...pid2APIs.values()]
      .find(as => as.some(a => a.apiId === apiId)) ?? [];

    remove(o, a => a.apiId === apiId);
    res.json(true);
  },
  'PUT /api/v1/api-management/apis/:apiId': (req: Request, res: Response) => {
    const apiId = +req.params.apiId!;
    const o = flatten([...pid2APIs.values()])
      .find(a => a.apiId === apiId);
    if (!o) {
      res.statusCode = 400;
      res.json('err');
      return;
    }

    Object.assign(o, req.body);
    res.json(true);
  },


  '/api/v1/api-management/apis/:apiId': (req: Request, res: Response) => {
    const apiId = +req.params.apiId!;
    const o = flatten([...pid2APIs.values()])
      .find(a => a.apiId === apiId);
    const b = {
      'apiId': 1,
      'apiName': 'api名称',
      'groupId': '分组id',
      'updateLog': '为啥要修改',
      'groupName': '分组名称',
      'projectId': '项目id',
      'path': '请求路径： /project/1',
      'exampleUrl': 'http://127.0.0.1/api/v1/students/1',
      'requestMethod': 'POST',
      'completeFlag': 'False',
      'requestContentType': 'application/json',
      'responseContentType': 'application/json',
      'requestBody': 'json字符串',
      'description': '描述',
      'createTime': '2020-09-15',    //创建时间
      'creatorIP': '192.168.0.115',    //创建人ip
      'apiParams': [
        {
          'paramId': '参数oid',
          'paramName': '参数名称',
          'paramType': '参数类型：String',
          'requiredFlag': '是否必填：true（如果是地址参数 只能是必填）',
          'addressFlag': '是否为地址参数：true',
          'example': '1',
          'description': '描述',
        },
        {
          'paramId': '参数oid',
          'paramName': '参数名称',
          'paramType': '参数类型：String',
          'requiredFlag': '是否必填：true',
          'addressFlag': '是否为地址参数：false',
          'example': '1',
          'description': '描述',
        },
      ],
      'apiStatusCodes': [
        {
          'statusCodeId': '状态码oid',
          'statusCode': 200,
          'responseBody': 'json字符串',
        },
        {
          'statusCodeId': '状态码oid',
          'statusCode': 400,
          'responseBody': 'json字符串',
        },
      ],
    };
    res.json(o ?? b);
  },


  '/api/v1/api-management/search': (req: Request, res: Response) => {
    const paramName = req.query.paramName! as string;
    const ps = projects.filter(p => p.projectName.startsWith(paramName))
    const as = flatten([...pid2APIs.values()])
      .filter(a => a.apiName.startsWith(paramName));
    res.json({
      projects: ps,
      apis: as,
    });
  },
  '/api/v1/api-management/api-histories': [],
};
