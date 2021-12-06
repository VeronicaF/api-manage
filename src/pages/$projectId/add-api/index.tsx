import React, { useMemo } from 'react';
import { Button, Card, Col, Divider, Form, Input, message, Radio, Row, Select, Space } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { DeleteTwoTone, PlusCircleTwoTone } from '@ant-design/icons/lib';
import { useDispatch, useSelector } from 'dva';
import { useParams } from 'react-router-dom';
import { useForm } from 'antd/es/form/Form';
import { useRequest } from 'ahooks';
import { _createApi } from '@/pages/$projectId/add-api/service';
import { router } from 'umi';
import style from '@/pages/$projectId/api-detail/index.less';

const AddApi = () => {
  const projectId = +useParams<{ projectId: string }>().projectId;
  const { groups } = useSelector(state => state.api);

  const dispatch = useDispatch();
  const effects = useMemo(() => ({
    fetchApis(params: any) {
      dispatch({
        type: 'api/fetchApis',
        payload: params,
      });
    },
  }), [dispatch]);

  const { run: createApi } = useRequest<IApi>(data => _createApi(data), {
    manual: true,
    onError: () => {
      message.error('新建失败');
    },
    onSuccess: ({ apiId }) => {
      message.success('新建成功');
      effects.fetchApis({ projectId });
      router.push(`/${projectId}/api-detail/${apiId}`);
    },
  });

  const [form] = useForm();

  const onCreate = () => {
    form
      .validateFields()
      .then(values => {
        const data = {
          ...values,
          apiParams: [...(values.urlParams ?? []), ...(values.queryParams ?? [])],
        };
        // @ts-ignore
        delete data.urlParams;
        // @ts-ignore
        delete data.queryParams;
        createApi(data);
      }).catch(err => {
      console.log(err);
    });
  };

  const extra = (
    <>
      <Button
        type="link"
        onClick={onCreate}
      >
        保存
      </Button>
      <Button
        type="link"
        onClick={() => {
          form.resetFields();
          router.goBack();
        }}
      >
        取消
      </Button>
    </>
  );

  return (
    <Card
      title="添加接口"
      extra={extra}
      style={{
        boxShadow: '0px 2px 6px 0px rgba(0, 0, 0, 0.21)',
        border: '1px solid rgba(255, 255, 255, 0)',
      }}
    >
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
        </Row>

        <Row>
          <Col span={8}>
            <Form.Item
              label="接口分组"
              name="groupId"
              initialValue={groups?.[0]?.groupId}
              required
              rules={[{ required: true, message: '必填' }]}
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
          required
        >
          <Form.Item
            name="requestMethod"
            initialValue="GET"
            rules={[{ required: true, message: '必填' }]}
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
                  const oldParam = form.getFieldValue('urlParams')?.find((p: any) => p.paramName === paramName);
                  return oldParam ?? {
                    paramName,
                    paramType: 'number',
                    requiredFlag: true,
                    addressFlag: true,
                    example: 1,
                  };
                });

                form.setFieldsValue({
                  urlParams: newUrlParams,
                });
              }}
            />
          </Form.Item>
        </Form.Item>

        <Row>
          <Col span={8}>
            <Form.Item
              name="completeFlag"
              label="接口状态"
              required
              initialValue={false}
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
          initialValue="application/json"
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
          initialValue="application/json"
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
        <Form.Item
          wrapperCol={{ span: 24 }}
          labelCol={{ span: 0 }}
        >
          <div
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <Button type="primary" onClick={onCreate}>保存</Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AddApi;
