import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, Descriptions, Divider, Table, Collapse, Space, message } from 'antd';
import { useRequest } from 'ahooks';
import { _fetchApiHistory } from '@/pages/$projectId/api-history/service';
import classNames from 'classnames';
import style from '@/pages/$projectId/api-detail/index.less';
import { CopyTwoTone } from '@ant-design/icons/lib';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-ignore
import { materialOceanic } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ColumnProps } from 'antd/es/table';
import { parseExpression } from '@babel/parser';
import generate from '@babel/generator';
import { format } from 'prettier/standalone';
import parserJson from 'prettier/parser-babylon';
import { router } from 'umi';

const ApiHistory = () => {
  const historyId = +useParams<{ historyId: string }>().historyId;
  const { data: apiHistory } = useRequest(() => _fetchApiHistory(historyId));

  const urlParams = apiHistory?.apiParams.filter(({ addressFlag }) => addressFlag) ?? [];

  const queryParams = apiHistory?.apiParams.filter(({ addressFlag }) => !addressFlag) ?? [];

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

  const copyToClipboard = (str: string) => {
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
    } catch (e) {
      message.error('JSON解析失败 请检查非法字符');
      console.log(e);
      return;
    }

    const dom = document.createElement('textarea');
    dom.value = res;
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

  return (
    <Card
      title={`${apiHistory?.apiName} ${apiHistory?.createTime}`}
      extra={<Button onClick={() => router.goBack()}>返回</Button>}
      style={{
        marginBottom: '16px',
        boxShadow: '0px 2px 6px 0px rgba(0, 0, 0, 0.21)',
        border: '1px solid rgba(255, 255, 255, 0)',
      }}
    >
      <>
        <Descriptions title="基本信息">
          <Descriptions.Item label="接口名称">
            { apiHistory?.apiName }
          </Descriptions.Item>
          <Descriptions.Item label="接口状态" span={2}>
            { apiHistory?.completeFlag ? '已完成' : '未完成' }
          </Descriptions.Item>
          <Descriptions.Item label="接口分组" span={3}>
            { apiHistory?.groupName }
          </Descriptions.Item>
          <Descriptions.Item label="接口路径" span={3}>
          <span
            className={classNames(style.requestMethod, apiHistory?.requestMethod && style[apiHistory.requestMethod])}
          >
              { apiHistory?.requestMethod }
            </span>
            <span>{ apiHistory?.path }</span>
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
            { apiHistory?.exampleUrl }
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
            { apiHistory?.requestContentType }
          </Descriptions.Item>
          <Descriptions.Item
            label="Body Params"
            span={3}
          >
            <div className={style.copy}>
              <Button
                icon={<CopyTwoTone />}
                type="link"
                onClick={() => apiHistory?.requestBody && copyToClipboard(apiHistory.requestBody)}
              >
                复制到剪贴板
              </Button>
            </div>
          </Descriptions.Item>
          <Descriptions.Item span={3}>
            <SyntaxHighlighter language="json" style={materialOceanic}>
              { apiHistory?.requestBody ?? '' }
            </SyntaxHighlighter>
          </Descriptions.Item>
        </Descriptions>
        <Divider type="horizontal" />

        <Descriptions title="响应参数">
          <Descriptions.Item label="Content-Type" span={3}>
            { apiHistory?.responseContentType }
          </Descriptions.Item>
          <Descriptions.Item span={3}>
            <Collapse ghost>
              { apiHistory?.apiStatusCodes.map(({ statusCodeId, statusCode, responseBody }) => (
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
                    <Button
                      icon={<CopyTwoTone />}
                      type="link"
                      onClick={e => {
                        e.stopPropagation();
                        responseBody && copyToClipboard(responseBody);
                      }}
                    >
                      复制到剪贴板
                    </Button>
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
      </>
    </Card>
  );
};

export default ApiHistory;
