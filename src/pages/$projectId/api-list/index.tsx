import React, { Key, useContext, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'dva';
import { Card, Table, Select, message, Button, Popconfirm, Tooltip, Input, Space } from 'antd';
import { Link } from 'umi';
import Highlighter from 'react-highlight-words';
import { DeleteTwoTone, SearchOutlined } from '@ant-design/icons/lib';
import { ColumnProps } from 'antd/es/table';
import { saveAs } from 'file-saver';
import { useRequest, useToggle } from 'ahooks';
import { useParams } from 'react-router-dom';
import classNames from 'classnames';
import { ApisContext } from '@/pages/$projectId/_layout';
import { _deleteApi } from '@/pages/$projectId/service';
import { _editApi, _exportApis } from './service';
import style from './index.less';

const ApiList = () => {
  const projectId = +useParams<{ projectId: string }>().projectId;
  const { apis, group } = useContext(ApisContext);

  const searchInputEl = useRef<Input>(null);

  const [searchedColumn, setSearchedColumn] = useState('');
  const [searchText, setSearchText] = useState<Key>('');

  const [exporting, { toggle: toggleExporting }] = useToggle();
  const [selectedApis, setSelectedApis] = useState<Key[]>([]);

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

  const { run: editApi } = useRequest(_editApi, {
    manual: true,
    onError: () => {
      message.error('修改失败');
    },
    onSuccess: () => {
      message.success('修改成功');
      effects.fetchApis({ projectId });
    },
  });

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

  const { run: exportApis } = useRequest(() => _exportApis(selectedApis as number[]), {
    manual: true,
    ready: selectedApis.length > 0,
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
    setSelectedApis([]);
  }

  const extra = exporting
    ? (
      <Space>
        <Button type="primary" onClick={exportApis}>确认导出</Button>
        <Button onClick={cancelExport}>取消导出</Button>
      </Space>
    )
    : (
      <Button
        type="dashed"
        onClick={() => {
          toggleExporting();
        }}
      >
        导出
      </Button>
    );

  const columns: ColumnProps<IApi>[] = [
    {
      title: '接口名称',
      dataIndex: 'apiName',
      filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record) => record.apiName.toString().toLowerCase().includes(value.toString().toLowerCase()),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
        const dataIndex = 'apiName';
        const handleSearch = (_selectedKeys: Key[], _confirm: () => void) => {
          _confirm();
          setSearchText(_selectedKeys[0]);
          setSearchedColumn(dataIndex);
        };

        const handleReset = () => {
          clearFilters && clearFilters();
          setSearchText('');
        };
        return (
          <div style={{ padding: 8 }}>
            <Input
              ref={searchInputEl}
              value={selectedKeys[0]}
              onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => handleSearch(selectedKeys, confirm)}
              style={{ width: 188, marginBottom: 8, display: 'block' }}
            />
            <Space>
              <Button
                type="primary"
                onClick={() => handleSearch(selectedKeys, confirm)}
                icon={<SearchOutlined />}
                size="small"
                style={{ width: 90 }}
              >
                Search
              </Button>
              <Button onClick={handleReset} size="small" style={{ width: 90 }}>
                Reset
              </Button>
            </Space>
          </div>
        );
      },
      onFilterDropdownVisibleChange: visible => {
        if (visible) {
          setTimeout(() => searchInputEl.current?.select(), 100);
        }
      },
      render: text => {
        return searchedColumn === 'apiName' ? (
          <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[searchText?.toString()]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />
        ) : (
          text
        );
      },
    },
    {
      title: '接口路径',
      dataIndex: 'path',
      filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record) => record.path.toString().toLowerCase().includes(value.toString().toLowerCase()),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
        const dataIndex = 'path';
        const handleSearch = (_selectedKeys: Key[], _confirm: () => void) => {
          _confirm();
          setSearchText(_selectedKeys[0]);
          setSearchedColumn(dataIndex);
        };

        const handleReset = () => {
          clearFilters && clearFilters();
          setSearchText('');
        };
        return (
          <div style={{ padding: 8 }}>
            <Input
              ref={searchInputEl}
              value={selectedKeys[0]}
              onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => handleSearch(selectedKeys, confirm)}
              style={{ width: 188, marginBottom: 8, display: 'block' }}
            />
            <Space>
              <Button
                type="primary"
                onClick={() => handleSearch(selectedKeys, confirm)}
                icon={<SearchOutlined />}
                size="small"
                style={{ width: 90 }}
              >
                Search
              </Button>
              <Button onClick={handleReset} size="small" style={{ width: 90 }}>
                Reset
              </Button>
            </Space>
          </div>
        );
      },
      onFilterDropdownVisibleChange: visible => {
        if (visible) {
          setTimeout(() => searchInputEl.current?.select(), 100);
        }
      },
      ellipsis: {
        showTitle: false,
      },
      render(path, { requestMethod }) {
        return (
          <Tooltip
            title={(
              <span style={{ whiteSpace: 'break-spaces' }}>
                <Highlighter
                  highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                  searchWords={[searchText?.toString()]}
                  autoEscape
                  textToHighlight={path?.toString() ?? ''}
                />
              </span>
            )}
            color="blue"
          >
            <span>
              <span
                className={classNames(style.requestMethod, style[requestMethod])}
              >
                { requestMethod }
              </span>
            <span>
              <Highlighter
                highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                searchWords={[searchText?.toString()]}
                autoEscape
                textToHighlight={path?.toString() ?? ''}
              />
            </span>
          </span>
          </Tooltip>
        );
      },
    },
    {
      title: '接口分组',
      dataIndex: 'groupId',
      render(id, api) {
        return (
          <Select<number>
            defaultValue={id}
            onChange={groupId => editApi({ ...api, groupId })}
            style={{ width: '200px' }}
          >
            { groups.map(({ groupId, groupName }) => (
              <Select.Option value={groupId} key={groupId}>{ groupName }</Select.Option>
            )) }
          </Select>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'completeFlag',
      render(_, api) {
        return (
          <Select<number>
            defaultValue={+api.completeFlag}
            onChange={completeFlag => editApi({ ...api, completeFlag: !!completeFlag })}
            style={{ width: '200px' }}
            className={classNames(style.completeFlag, { [style.complete]: api.completeFlag })}
          >
            <Select.Option value={0}>未完成</Select.Option>
            <Select.Option value={1}>已完成</Select.Option>
          </Select>
        );
      },
    },
    {
      title: '操作',
      render(_, api) {
        return (
          <>
            <Button type="link"><Link to={`./api-detail/${api.apiId}`}>详情</Link></Button>
            <Popconfirm
              title="确认删除？"
              onConfirm={e => {
                e?.stopPropagation();
                deleteApi(api.apiId);
              }}
              okText="删除"
              okType="danger"
              cancelText="取消"
            >
              <Button type="link" icon={<DeleteTwoTone />} className={style.deleteIcon} />
            </Popconfirm>
          </>
        );
      },
    },
  ];

  const onRowSelectionChange = (selectedRowKeys: Key[]) => {
    setSelectedApis(selectedRowKeys);
  };

  return (
    <Card
      title={group?.groupName ?? '全部接口'}
      extra={extra}
      style={{
        boxShadow: '0px 2px 6px 0px rgba(0, 0, 0, 0.21)',
        border: '1px solid rgba(255, 255, 255, 0)',
      }}
    >
      <Table
        columns={columns}
        dataSource={apis}
        rowKey="apiId"
        rowSelection={exporting
          ? {
            type: 'checkbox',
            onChange: onRowSelectionChange,
          }
          : undefined
        }
        rowClassName={style.tableRow}
      />
    </Card>
  );
};

export default ApiList;
