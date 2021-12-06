import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { parseExpression } from '@babel/parser';
import generate from '@babel/generator';
import { format } from 'prettier/standalone';
import parserJson from 'prettier/parser-babylon';
import { useRequest, useToggle } from 'ahooks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-ignore
import { materialOceanic } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  message,
  Card,
  Descriptions,
  Divider,
  Table,
  Button,
  Collapse,
  Space,
  Form,
  Row,
  Col,
  Input,
  Select, Radio, List, Modal,
} from 'antd';
import { ColumnProps } from 'antd/es/table';
import { Link } from 'umi';
import classNames from 'classnames';
import { _editApi, _fetchApi, _fetchApiHistoryRecords } from '@/pages/$projectId/api-detail/service';
import { CopyTwoTone, EditTwoTone, DeleteTwoTone, PlusCircleTwoTone } from '@ant-design/icons/lib';
import { useForm } from 'antd/es/form/Form';
import { useSelector } from 'dva';
import TextArea from 'antd/es/input/TextArea';
import { jsonInputForTargetLanguage, InputData, quicktype } from 'quicktype-core';
import style from './index.less';

async function quicktypeJSON(targetLanguage: string, typeName = 'root', jsonString: string) {
  const jsonInput = jsonInputForTargetLanguage(targetLanguage);

  // We could add multiple samples for the same desired
  // type, or many sources for other types. Here we're
  // just making one type from one piece of sample JSON.
  await jsonInput.addSource({
    name: typeName,
    samples: [jsonString],
  });

  const inputData = new InputData();
  inputData.addInput(jsonInput);

  return quicktype({
    inputData,
    lang: targetLanguage,
    rendererOptions: {
      'just-types': 'true',
      'runtime-typecheck': 'false',
    },
  });
}


const ApiDetail = () => {
  const apiId = +useParams<{ apiId: string }>().apiId;
  const projectId = +useParams<{ projectId: string }>().projectId;

  const [editing, { toggle: toggleEditing }] = useToggle();
  const [visible, { toggle: toggleVisible }] = useToggle();

  const [form] = useForm();
  const [form1] = useForm();

  const { groups } = useSelector(state => state.api);
  const { data: api, refresh: reFetchApi } = useRequest(() => _fetchApi(apiId), {
    refreshDeps: [apiId],
  });
  const { data: apiHistoryRecords, refresh: reFetchApiHistoryRecords } = useRequest(() => _fetchApiHistoryRecords(apiId), {
    refreshDeps: [apiId],
  });
  const { run: editApi, loading } = useRequest(data => _editApi(apiId, data), {
    manual: true,
    onError: () => {
      message.error('修改失败');
    },
    onSuccess: () => {
      message.success('修改成功');
      reFetchApi();
      reFetchApiHistoryRecords();
      toggleVisible();
      toggleEditing();
      form1.resetFields();
    },
  });

  const urlParams = useMemo(() => api?.apiParams.filter(({ addressFlag }) => addressFlag) ?? [], [api]);

  const queryParams = useMemo(() => api?.apiParams.filter(({ addressFlag }) => !addressFlag) ?? [], [api]);

  const columns: ColumnProps<IApiParam>[] = [
    { title: '参数名称', dataIndex: 'paramName' },
    { title: '类型', dataIndex: 'paramType' },
    {
      title: '必填项',
      dataIndex: 'requiredFlag',
      render(require) {
        return require ? '必填项' : '非必填项';
      },
    },
    { title: '参数示例', dataIndex: 'example' },
    { title: '描述', dataIndex: 'description' },
  ];

  const getJSONData = (str?: string) => {
    if (!str) return;
    let res: string;

    const code = str.replace('，', ',');

    try {
      const ast = parseExpression(code);
      res = generate(ast, {
        comments: false,
      }, code).code;
      res = format(res, {
        parser: 'json',
        plugins: [parserJson],
      });
      return res;
    } catch (e) {
      message.error('JSON解析失败 请检查非法字符');
      console.log(e);
    }
  };

  const getJSONType = async (str?: string) => {
    if (!str) return;
    try {
      const temp = getJSONData(str);
      if (!temp) return;
      const result = await quicktypeJSON('typescript', 'root', temp);
      return result.lines.join('\n');
    } catch (e) {
      console.log(e);
    }
  };

  const copyToClipboard = async (str?: string) => {
    if (!str) return;
    const dom = document.createElement('textarea');
    dom.value = str;
    document.body.appendChild(dom);
    dom.select();
    try {
      document.execCommand('copy', false);
      message.success('复制成功');
    } catch (e) {
      message.error('复制失败，请手动复制');
    } finally {
      document.body.removeChild(dom);
    }
  };

  const onEdit = () => {
    form.setFieldsValue({
      ...api,
      requestBody: api?.requestBody,
    });
    form.setFieldsValue({
      urlParams: [...urlParams],
      queryParams: [...queryParams],
    });
    toggleEditing();
  };

  const onSave = () => {
    form
      .validateFields()
      .then(() => {
        toggleVisible();
      }).catch(err => {
      console.log(err);
    });
  };

  const onConfirm = async () => {
    try {
      const { updateLog } = await form1.validateFields();
      const values = form.getFieldsValue();
      const data = {
        ...values,
        updateLog,
        apiParams: [...values.urlParams, ...values.queryParams],
      };
      // @ts-ignore
      delete data.urlParams;
      // @ts-ignore
      delete data.queryParams;
      editApi(data);
    } catch (e) {
      console.log(e);
    }
  };

  const stateSwitcher = editing
    ? (
      <>
        <Button type="link" onClick={onSave}>
          保存
        </Button>
        <Button
          type="link"
          onClick={() => {
            form.resetFields();
            toggleEditing();
          }}
        >
          取消
        </Button>
      </>
    )
    : (
      <Button
        icon={<EditTwoTone />}
        type="link"
        onClick={onEdit}
      >
        编辑
      </Button>
    );

  const show = (
    <>
      <Descriptions title="基本信息">
        <Descriptions.Item label="接口名称">
          { api?.apiName }
        </Descriptions.Item>
        <Descriptions.Item label="接口状态" span={2}>
          { api?.completeFlag ? '已完成' : '未完成' }
        </Descriptions.Item>
        <Descriptions.Item label="接口分组" span={3}>
          { api?.groupName }
        </Descriptions.Item>
        <Descriptions.Item label="接口路径" span={3}>
          <span
            className={classNames(style.requestMethod, api?.requestMethod && style[api.requestMethod])}
          >
              { api?.requestMethod }
            </span>
          <span>{ api?.path }</span>
        </Descriptions.Item>
        { urlParams?.map(param => (
          <React.Fragment key={param.paramId}>
            <Descriptions.Item label="地址参数">
              { param.paramName }
            </Descriptions.Item>
            <Descriptions.Item label="示例">
              { param.example }
            </Descriptions.Item>
            <Descriptions.Item label="描述">
              { param.description }
            </Descriptions.Item>
          </React.Fragment>
        )) }
        <Descriptions.Item label="Example URL" span={3}>
          { api?.exampleUrl }
        </Descriptions.Item>
      </Descriptions>
      <Divider type="horizontal" />

      <Descriptions title="查询参数">
        <Descriptions.Item span={3}>
          <Table
            columns={columns}
            dataSource={queryParams}
            rowKey="paramId"
            pagination={false}
          />
        </Descriptions.Item>
        <Descriptions.Item label="Content-Type" span={3}>
          { api?.requestContentType }
        </Descriptions.Item>
        <Descriptions.Item
          label="Body Params"
          span={3}
        >
          <div className={style.copy}>
            <Button
              icon={<CopyTwoTone />}
              type="link"
              onClick={() => api?.requestBody && copyToClipboard(getJSONData(api.requestBody))}
            >
              复制到剪贴板
            </Button>
            <Button
              icon={<CopyTwoTone />}
              type="link"
              onClick={async () => api?.requestBody && copyToClipboard(await getJSONType(api.requestBody))}
            >
              复制类型(typescript)
            </Button>
          </div>
        </Descriptions.Item>
        <Descriptions.Item span={3}>
          <SyntaxHighlighter language="json" style={materialOceanic}>
            { api?.requestBody ?? '' }
          </SyntaxHighlighter>
        </Descriptions.Item>
      </Descriptions>
      <Divider type="horizontal" />

      <Descriptions title="响应参数">
        <Descriptions.Item label="Content-Type" span={3}>
          { api?.responseContentType }
        </Descriptions.Item>
        <Descriptions.Item span={3}>
          <Collapse ghost>
            { api?.apiStatusCodes.map(({ statusCodeId, statusCode, responseBody }) => (
              <Collapse.Panel
                key={statusCodeId}
                header={(
                  <div style={{ display: 'inline-block' }}>
                    <Space>
                      <span>Response:</span>
                      <Button>{ statusCode }</Button>
                    </Space>
                  </div>
                )}
                extra={(
                  <div className={style.copy}>
                    <Button
                      icon={<CopyTwoTone />}
                      type="link"
                      onClick={(e) => {
                        e.stopPropagation();
                        responseBody && copyToClipboard(getJSONData(responseBody));
                      }}
                    >
                      复制到剪贴板
                    </Button>
                    <Button
                      icon={<CopyTwoTone />}
                      type="link"
                      onClick={async (e) => {
                        e.stopPropagation();
                        responseBody && copyToClipboard(await getJSONType(responseBody));
                      }}
                    >
                      复制类型(typescript)
                    </Button>
                  </div>
                )}
              >
                <SyntaxHighlighter
                  language="json"
                  style={materialOceanic}
                >
                  { responseBody?.replace('“', '"') ?? '' }
                </SyntaxHighlighter>
              </Collapse.Panel>
            )) }
          </Collapse>
        </Descriptions.Item>
      </Descriptions>

      <Divider type="horizontal" />
      <List
        header={<div style={{ fontWeight: 'bold', fontSize: '16px' }}>历史记录</div>}
      >
        <List.Item style={{ width: '100%' }}>
          <Row style={{ fontSize: '16px', width: '100%' }}>
            <Col span={6}>修改时间</Col>
            <Col span={6}>修改人IP</Col>
            <Col span={6}>修改原因</Col>
            <Col span={6}>详情</Col>
          </Row>
        </List.Item>
        { apiHistoryRecords?.map(({ createTime, oid, creatorIP, updateLog }) => {
          return (
            <List.Item key={oid}>
              <Row style={{ width: '100%' }}>
                <Col span={6}>{ createTime }</Col>
                <Col span={6}>{ creatorIP }</Col>
                <Col span={6}>{ updateLog }</Col>
                <Col span={6}>
                  <Link to={`/${projectId}/api-history/${oid}`}>
                    <Button type="link">详情</Button>
                  </Link>
                </Col>
              </Row>
            </List.Item>
          );
        }) }
      </List>
    </>
  );

  const edit = (
    <Form
      form={form}
      scrollToFirstError
      wrapperCol={{ span: 22 }}
      labelCol={{ span: 2 }}
    >
      <div className={style.header}>基本信息</div>

      <Row>
        <Col span={8}>
          <Form.Item
            name="apiName"
            label="接口名称"
            wrapperCol={{ span: 18 }}
            labelCol={{ span: 6 }}
            required
            rules={[{ required: true, message: '必填' }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={8} offset={8}>
          <Form.Item
            name="completeFlag"
            label="接口状态"
            required
            rules={[{ required: true, message: '必填' }]}
            wrapperCol={{ span: 18 }}
            labelCol={{ span: 6 }}
          >
            <Select>
              <Select.Option
                // @ts-ignore
                value={false}
              >
                未完成
              </Select.Option>

              <Select.Option
                // @ts-ignore
                value
              >
                已完成
              </Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row>
        <Col span={8}>
          <Form.Item
            label="接口分组"
            name="groupId"
            required
            wrapperCol={{ span: 18 }}
            labelCol={{ span: 6 }}
          >
            <Select>
              { groups.map(({ groupId, groupName }) => (
                <Select.Option value={groupId} key={groupId}>{ groupName }</Select.Option>
              )) }
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="接口路径"
        rules={[{ required: true, message: '必填' }]}
        required
      >
        <Form.Item
          name="requestMethod"
          style={{
            display: 'inline-block',
            width: '100px',
          }}
        >
          <Select>
            <Select.Option value="GET">GET</Select.Option>
            <Select.Option value="POST">POST</Select.Option>
            <Select.Option value="PUT">PUT</Select.Option>
            <Select.Option value="DELETE">DELETE</Select.Option>
            <Select.Option value="WS">WS</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          style={{
            display: 'inline-block',
            width: '100px',
          }}
        >
          <Input value="localhost" disabled />
        </Form.Item>
        <Form.Item
          name="path"
          style={{
            display: 'inline-block',
            width: 'calc(100% - 200px)',
          }}
          rules={[{ required: true, message: '必填' }]}
        >
          <Input
            onChange={e => {
              const path = e.target.value;
              const urlParamsFormPath = [];
              const re = /\/\{(?<param>.+?)\}/g;
              for (let result = re.exec(path); result !== null; result = re.exec(path)) {
                urlParamsFormPath.push(result.groups!.param);
              }

              const newUrlParams = urlParamsFormPath.map(paramName => {
                const oldParam = urlParams.find(p => p.paramName === paramName);
                if (oldParam) {
                  return oldParam;
                } else {
                  return {
                    paramName,
                    paramType: 'number',
                    example: 1,
                    requiredFlag: true,
                    addressFlag: true,
                  };
                }
              });

              form.setFieldsValue({
                urlParams: newUrlParams,
              });
            }}
          />
        </Form.Item>
      </Form.Item>

      <Form.Item
        label="地址参数"
        noStyle
        dependencies={['path']}
      >
        { () => (
          <Form.List name="urlParams">
            { (fields) => fields.map(field => (
                <Form.Item label="地址参数" key={field.key}>
                  <Space key={field.key} className={style.inlineSpace}>
                    <Form.Item
                      {...field}
                      style={{ flex: 1 }}
                      name={[field.name, 'paramName']}
                      fieldKey={[field.fieldKey, 'paramName']}
                      rules={[{ required: true, message: '必填' }]}
                    >
                      <Input disabled />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'example']}
                      fieldKey={[field.fieldKey, 'example']}
                    >
                      <Input placeholder="参数示例" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'description']}
                      fieldKey={[field.fieldKey, 'description']}
                    >
                      <Input placeholder="参数描述" />
                    </Form.Item>
                  </Space>
                </Form.Item>
              )
            )}
          </Form.List>
        ) }
      </Form.Item>

      <Form.Item
        name="exampleUrl"
        label="Example URL"
      >
        <Input disabled />
      </Form.Item>

      <Divider />

      <Form.Item
        name="requestContentType"
        label="Content-Type"
        rules={[{
          required: true,
          message: '必填',
        }]}
      >
        <Radio.Group>
          <Radio value="multipart/form-data">multipart/form-data</Radio>
          <Radio value="application/json">application/json</Radio>
          <Radio value="无">无</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        label="Query Params："
        colon={false}
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
      >
        <Row>
          <Col span={5} className={style.th}>参数名称</Col>
          <Col span={3} className={style.th}>类型</Col>
          <Col span={3} className={style.th}>必填项</Col>
          <Col span={5} className={style.th}>参数示例</Col>
          <Col span={8} className={style.th}>描述</Col>
        </Row>
        <Form.List name="queryParams">
          { (fields, { add, remove }) => {
            return (
              <div>
                { fields.map((field) => {
                  return (
                    <Row key={field.key} className={style.tr}>
                      <Col span={5} className={style.td}>
                        <Form.Item
                          name={[field.name, 'paramName']}
                          required
                          rules={[{ required: true, message: '必填' }]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={3} className={style.td}>
                        <Form.Item
                          name={[field.name, 'paramType']}
                          required
                          rules={[{ required: true, message: '必填' }]}
                        >
                          <Select>
                            <Select.Option value="String">string</Select.Option>
                            <Select.Option value="Number">number</Select.Option>
                            <Select.Option value="Boolean">boolean</Select.Option>
                            <Select.Option value="List">list</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={3} className={style.td}>
                        <Form.Item
                          name={[field.name, 'requiredFlag']}
                          required
                          rules={[{ required: true, message: '必填' }]}
                        >
                          <Select>
                            <Select.Option
                              // @ts-ignore
                              value={false}
                            >
                              非必填
                            </Select.Option>
                            <Select.Option
                              // @ts-ignore
                              value
                            >
                              必填
                            </Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={5} className={style.td}>
                        <Form.Item
                          name={[field.name, 'example']}
                        >
                          <TextArea autoSize={{ minRows: 1 }} />
                        </Form.Item>
                      </Col>
                      <Col span={8} className={style.td}>
                        <Form.Item
                          name={[field.name, 'description']}
                          style={{ paddingRight: '30px' }}
                        >
                          <TextArea autoSize={{ minRows: 1 }} />
                        </Form.Item>
                      </Col>
                      <div className={style.deleteIcon}>
                        <Button
                          icon={<DeleteTwoTone />}
                          type="link"
                          onClick={() => remove(field.name)}
                        />
                      </div>
                    </Row>
                  );
                }) }
                <Button
                  icon={<PlusCircleTwoTone />}
                  type="link"
                  onClick={() => add({
                    addressFlag: false,
                    paramType: 'Number',
                    requiredFlag: true,
                    example: '1',
                  })}
                >
                  添加参数
                </Button>
              </div>
            );
          } }
        </Form.List>
      </Form.Item>

      <Form.Item
        name="requestBody"
        label="Body  Params："
        colon={false}
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
      >
        <TextArea autoSize={{ minRows: 1 }} />
      </Form.Item>

      <Divider />

      <div className={style.header}>响应参数</div>

      <Form.Item
        name="responseContentType"
        label="Content-Type"
        rules={[{
          required: true,
          message: '必填',
        }]}
      >
        <Radio.Group>
          <Radio value="multipart/form-data">multipart/form-data</Radio>
          <Radio value="application/json">application/json</Radio>
          <Radio value="无">无</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        label="Response Body："
        colon={false}
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
      >
        <Form.List name="apiStatusCodes">
          { (fields, { add, remove }) => {
            return (
              <div>
                { fields.map((field) => {
                  return (
                    <div key={field.key}>
                      <Form.Item
                        label={(
                          <Button
                            icon={<DeleteTwoTone twoToneColor="red" />}
                            type="link"
                            onClick={() => remove(field.name)}
                          />
                        )}
                        name={[field.name, 'statusCode']}
                        labelCol={{ span: 2 }}
                        wrapperCol={{ span: 4 }}
                        required={false}
                        colon={false}
                        rules={[
                          { required: true, message: '必填' },
                          { type: 'number', message: '无效的状态码', transform: value => +value },
                        ]}
                      >
                        <Input placeholder="状态码" />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, 'responseBody']}
                        wrapperCol={{ span: 22, offset: 2 }}
                      >
                        <TextArea autoSize={{ minRows: 1 }} />
                      </Form.Item>
                    </div>
                  );
                }) }
                <Button
                  icon={<PlusCircleTwoTone />}
                  type="link"
                  onClick={() => add()}
                >
                  添加响应
                </Button>
              </div>
            );
          } }
        </Form.List>
      </Form.Item>

      <Form.Item noStyle>
        <Modal
          title="修改原因"
          visible={visible}
          onCancel={() => toggleVisible()}
          footer={false}
          centered
          width={800}
        >
          <Form form={form1}>
            <div className={style.updateLogWrapper}>
              <Form.Item
                name="updateLog"
                required
                rules={[{ required: true, message: '必填' }]}
                style={{ width: '100%' }}
                wrapperCol={{ span: 24 }}
              >
                <Input.TextArea autoSize />
              </Form.Item>
            </div>
          </Form>
          <Space style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Button
              type="primary"
              onClick={() => {
                form1.resetFields();
                toggleVisible();
              }}
            >
              取消
            </Button>
            <Button type="primary" onClick={onConfirm} loading={loading} disabled={loading}>确认修改</Button>
          </Space>
        </Modal>
      </Form.Item>

      <Form.Item noStyle>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Button onClick={onSave} type="primary">保存</Button>
        </div>
      </Form.Item>
    </Form>
  );

  return (
    <Card
      title={api?.apiName}
      extra={stateSwitcher}
      style={{
        marginBottom: '16px',
        boxShadow: '0px 2px 6px 0px rgba(0, 0, 0, 0.21)',
        border: '1px solid rgba(255, 255, 255, 0)',
      }}
    >
      { editing
        ? edit
        : show }
    </Card>
  );
};

export default ApiDetail;
