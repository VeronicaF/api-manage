import React, { useRef, useState } from 'react';
import { Input, Dropdown, Menu, Tooltip } from 'antd';
import { Link } from 'umi';
import { useClickAway, useRequest } from 'ahooks';
import { _search } from '@/services/search';
import style from './search.less';
import classNames from 'classnames';
import Highlighter from 'react-highlight-words';

const { Search: InternalSearch } = Input;


const Search = () => {
  const [param, setParam] = useState('');
  const [searchResultVisible, setSearchResultVisible] = useState(false);

  const menuDom = useRef<HTMLDivElement>(null);

  useClickAway(() => {
    setSearchResultVisible(false);
  }, menuDom);

  const { data: searchResult, run: search, loading } = useRequest<ISearchResult>(() => _search(param), {
    initialData: { apis: [], projects: [] },
    manual: true,
    onSuccess() {
      setSearchResultVisible(true);
    },
  });

  const menu = (
    <div ref={menuDom}>
      <Menu onClick={() => setSearchResultVisible(false)} className={style.menu}>
        <Menu.ItemGroup title="项目">
          { searchResult?.projects.map(({ projectId, projectName }) => {
            return (
              <Menu.Item key={projectId}>
                <Link to={`/${projectId}/api-list`}>项目：{ projectName }</Link>
              </Menu.Item>
            );
          }) }
        </Menu.ItemGroup>
        <Menu.ItemGroup title="接口">
          { searchResult?.apis.map(({ apiId, apiName, projectId, requestMethod, path }) => {
            return (
              <Menu.Item key={apiId}>
                <Tooltip
                  title={
                    (
                      <span style={{ whiteSpace: 'break-spaces' }}>
                        <Highlighter
                          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                          searchWords={[param]}
                          autoEscape
                          textToHighlight={path}
                        />
                      </span>
                    )}
                  placement="right"
                  color="blue"
                >
                  <Link to={`/${projectId}/api-detail/${apiId}`}>
                  <span
                    className={classNames(style.requestMethod, style[requestMethod])}
                  >
              { requestMethod }
            </span>
                    <Highlighter
                      highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                      searchWords={[param]}
                      autoEscape
                      textToHighlight={apiName}
                    />
                  </Link>
                </Tooltip>
              </Menu.Item>
            );
          }) }
        </Menu.ItemGroup>
      </Menu>
    </div>
  );

  return (
    <>
      <Dropdown
        overlay={menu}
        visible={searchResultVisible}
      >
        <InternalSearch
          placeholder="搜索项目/接口"
          enterButton="搜索"
          loading={loading}
          className={style.search}
          value={param}
          onChange={e => setParam(e.target.value)}
          onSearch={search}
        />
      </Dropdown>
    </>
  );
};

export default Search;
