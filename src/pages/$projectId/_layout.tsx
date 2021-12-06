import React, { ChangeEvent, createContext, FC, Key, useEffect, useMemo, useState } from 'react';
import { Link, router } from 'umi';
import { useDispatch, useSelector } from 'dva';
import { saveAs } from 'file-saver';
import { useParams } from 'react-router-dom';
import { Button, Row, Col, Card, Layout, Tree, message, Popconfirm, Form, Input, Modal, Space } from 'antd';
import { useRequest, useToggle } from 'ahooks';
import { groupBy } from 'lodash';
import { DataNode } from 'antd/es/tree';
import Header from '@/components/Header';
import { EditTwoTone, DeleteTwoTone } from '@ant-design/icons/lib';
import {
  _createGroup,
  _deleteApi,
  _deleteGroup,
  _editGroup,
  _exportGroups,
} from '@/pages/$projectId/service';
import Highlighter from 'react-highlight-words';
import style from './_layout.less';

export const ApisContext = createContext<{ apis?: IApi[], group?: IGroup }>({});

const ALL_API_KEY = 'ALL_API_KEY';

const ApiLayout: FC = props => {
  const projectId = +useParams<{ projectId: string }>().projectId;

  const [selectedGroupId, setSelectedGroupId] = useState<number>();
  const [editingGroupId, setEditingGroupId] = useState<number>();

  const [expandedKeys, setExpandedKeys] = useState<(string | number)[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [searchValue, setSearchValue] = useState('');

  const [checkedGroups, setCheckedGroups] = useState<(number | string)[]>([]);
  const [exporting, { toggle: toggleExporting }] = useToggle();

  const [visible, { toggle: toggleVisible }] = useToggle();

  const dispatch = useDispatch();
  const effects = useMemo(() => ({
    fetchGroups(params: any) {
      dispatch({
        type: 'api/fetchGroups',
        payload: params,
      });
    },
    fetchApis(params: any) {
      dispatch({
        type: 'api/fetchApis',
        payload: params,
      });
    },
  }), [dispatch]);

  const { apis, groups } = useSelector(state => state.api);

  const { run: deleteApi } = useRequest(_deleteApi, {
    manual: true,
    onError: () => {
      message.error('删除失败');
    },
    onSuccess: () => {
      message.success('删除成功');
      effects.fetchApis({ projectId });
    },
  });
  const { run: editGroup } = useRequest(_editGroup, {
    manual: true,
    onError: () => {
      message.error('修改失败');
    },
    onSuccess: () => {
      message.success('修改成功');
      setEditingGroupId(undefined);
      effects.fetchGroups({ projectId });
    },
  });
  const { run: createGroup } = useRequest(_createGroup, {
    manual: true,
    onError: () => {
      message.error('新建失败');
    },
    onSuccess: () => {
      message.success('新建成功');
      effects.fetchGroups({ projectId });
      toggleVisible();
    },
  });
  const { run: deleteGroup } = useRequest(_deleteGroup, {
    manual: true,
    onError: () => {
      message.error('删除失败');
    },
    onSuccess: () => {
      message.success('删除成功');
      effects.fetchGroups({ projectId });
      effects.fetchApis({ projectId });
    },
  });
  const { run: exportGroups } = useRequest(() => _exportGroups(checkedGroups as number[]), {
    manual: true,
    ready: checkedGroups.length > 0,
    onError: () => {
      message.error('导出失败');
      cancelExport();
    },
    onSuccess: (data) => {
      message.success('导出成功');
      saveAs(data, 'api.docx');
      cancelExport();
    },
  });

  function cancelExport() {
    toggleExporting(false);
    setCheckedGroups([]);
  }

  const exportFile = () => {
    exportGroups();
  };

  const apisByGroup = groupBy(apis, 'groupId');

  const mapGroupId2Group = Object.fromEntries(groups.map((group) => [group.groupId, group]) ?? []);

  const apisInSelectedGroup = useMemo(() => {
    return selectedGroupId
      ? apisByGroup[selectedGroupId]
      : apis;
  }, [apis, apisByGroup, selectedGroupId]);

  const treeData = groups.map<DataNode>(({ groupId, groupName }) => {
    return {
      title: groupName,
      key: groupId,
      isLeaf: false,
      checkable: exporting,
      children: apisByGroup[groupId]?.map(({ apiId, apiName }) => {
        return {
          title: apiName,
          key: `${groupId}-${apiId}`,
          checkable: false,
          isLeaf: true,
        };
      }),
    };
  });
  treeData?.unshift({
    title: '全部接口',
    key: ALL_API_KEY,
    isLeaf: false,
    checkable: false,
    switcherIcon: () => null,
  });

  const onExpand = (_expandedKeys: Key[]) => {
    setExpandedKeys(_expandedKeys);
    setAutoExpandParent(false);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const _expandedKeys = treeData
      .map(item => {
        if (item.title!.toString().indexOf(value) > -1) {
          return item.key;
        } else if (item.children?.some(_item => _item.title!.toString().indexOf(value) > -1)) {
          return item.key;
        }
        return null;
      })
      .filter((item, i, self): item is Key => !!item && self.indexOf(item) === i);

    setAutoExpandParent(true);
    setSearchValue(value);
    setExpandedKeys(_expandedKeys);
  };

  const getApiIdFromTreeNode = ({ key }: DataNode) => +(key as String).split('-').pop()!;

  const titleRenderer = (node: DataNode) => {
    const { isLeaf, title, key } = node;
    if (key === ALL_API_KEY) {
      return (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchValue.toString()]}
          autoEscape
          textToHighlight={title?.toString() ?? ''}
        />
      );
    }
    if (isLeaf) { // 叶节点->api
      return (
        <div className={style.treeTitle}>
          <span>
            <Highlighter
              highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
              searchWords={[searchValue.toString()]}
              autoEscape
              textToHighlight={title?.toString() ?? ''}
            />
          </span>
          <span className={style.actions}>
            <Popconfirm
              title="确认删除？"
              onConfirm={e => {
                e?.stopPropagation();
                deleteApi(getApiIdFromTreeNode(node));
              }}
              okText="删除"
              okType="danger"
              cancelText="取消"
            >
              <Button size="small" icon={<DeleteTwoTone />} type="link" />
            </Popconfirm>
          </span>
        </div>
      );
    } else { // -> 分组
      const groupId = +key;
      if (editingGroupId === groupId) {
        return (
          <Form
            onFinish={(values: { groupName: string }) => editGroup(groupId, values)}
          >
            <Form.Item
              name="groupName"
              label="分组名称"
              initialValue={title}
              hasFeedback
              required
              rules={[{ required: true, message: '必填' }]}
            >
              <Input />
            </Form.Item>
          </Form>
        );
      }
      return (
        <div className={style.treeTitle}>
          <span>
            <Highlighter
              highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
              searchWords={[searchValue.toString()]}
              autoEscape
              textToHighlight={title?.toString() ?? ''}
            />
          </span>
          <span className={style.actions}>
            <Button
              size="small"
              icon={<EditTwoTone />}
              type="link"
              onClick={e => {
                e.stopPropagation();
                setEditingGroupId(groupId);
              }}
            />
            <Popconfirm
              title="确认删除？"
              onConfirm={e => {
                e?.stopPropagation();
                deleteGroup(groupId);
              }}
              okText="删除"
              okType="danger"
              cancelText="取消"
            >
              <Button size="small" icon={<DeleteTwoTone />} type="link" />
            </Popconfirm>
          </span>
        </div>
      );
    }
  };

  const extra = (
    <>
      <Space>
        <Button type="primary" onClick={() => toggleVisible(true)}>+添加分组</Button>
        { !exporting && (
          <Button
            type="dashed"
            onClick={() => {
              toggleExporting();
              setExpandedKeys([]);
            }}
          >
            导出
          </Button>
        ) }
      </Space>
      <Modal
        onCancel={() => toggleVisible()}
        visible={visible}
        title="新建分组"
        centered
        destroyOnClose
        footer={false}
        width={600}
      >
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          onFinish={(values: { groupName: string }) => createGroup({ projectId, ...values })}
        >
          <Form.Item
            label="分组名称"
            name="groupName"
            hasFeedback
            rules={[{ required: true, message: '必填' }]}
            required
          >
            <Input />
          </Form.Item>
          <Form.Item wrapperCol={{ span: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Button type="primary" htmlType="submit">
                新建
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );


  useEffect(() => {
    effects.fetchGroups({ projectId });
    effects.fetchApis({ projectId });
  }, [effects, projectId]);

  return (
    <>
      <Header
        breadcrumbList={[
          { path: '/', name: '主页' },
          { path: '/api/api-list', name: '项目详情' },
        ]}
        extra={(
          <Link
            to={`/${projectId}/add-api`}
          >
            <Button type="primary">+添加接口</Button>
          </Link>
        )}
      />
      <Layout.Content style={{ padding: '0 20px' }}>
        <Row gutter={32}>
          <Col span={5}>
            <Card
              title="接口列表"
              style={{
                boxShadow: '0px 2px 6px 0px rgba(0, 0, 0, 0.21)',
                border: '1px solid rgba(255, 255, 255, 0)',
              }}
              extra={extra}
            >
              <Input.Search
                style={{ marginBottom: 8 }}
                placeholder="Search"
                onChange={onChange}
              />
              <Tree
                motion={null}
                height={800}
                blockNode
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                onExpand={onExpand}
                treeData={treeData}
                titleRender={titleRenderer}
                checkable
                checkedKeys={checkedGroups}
                onCheck={values => {
                  if (!Array.isArray(values)) {
                    setCheckedGroups(values.checked);
                  }
                }}
                checkStrictly
                onSelect={(_, { node }) => {
                  const { isLeaf, key } = node;
                  if (isLeaf) {
                    // setSelectedApiId(+(key as String).split('-').pop()!)
                    const apiId = getApiIdFromTreeNode(node);
                    router.push(`/${projectId}/api-detail/${apiId}`);
                  } else {
                    setSelectedGroupId(+key);
                    router.push(`/${projectId}/api-list`);
                  }
                }}
              />
              { exporting && (
                <Space style={{ justifyContent: 'center', width: '100%' }}>
                  <Button onClick={cancelExport}>取消导出</Button>
                  <Button type="primary" onClick={exportFile}>确认导出</Button>
                </Space>
              ) }
            </Card>
          </Col>
          <Col span={19}>
            <ApisContext.Provider
              value={{
                apis: apisInSelectedGroup ?? [],
                group: selectedGroupId === undefined ? undefined : mapGroupId2Group[selectedGroupId],
              }}
            >
              { props.children }
            </ApisContext.Provider>
          </Col>
        </Row>
      </Layout.Content>
    </>
  );
};

// ApiLayout.whyDidYouRender = {
//   logOnDifferentValues: true,
// }

export default React.memo(ApiLayout);
