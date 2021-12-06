import React, { FC } from 'react';
import { Card } from 'antd';
import Breadcrumb, { IBreadcrumbProps } from '@/components/Breadcrumb';
import Search from './Search';
import style from './header.less';

interface IHeaderProps {
  breadcrumbList?: IBreadcrumbProps['breadcrumbList'],
  extra?: React.ReactElement,
}

const Header: FC<IHeaderProps> = props => {
  const { breadcrumbList, extra = null } = props;
  return (
    <Card style={{ marginBottom: '16px', boxShadow: '0px 2px 6px 0px rgba(0, 0, 0, 0.26)' }}>
      <div className={style.headerWrapper}>
        <div className={style.breadcrumb}>
          <Breadcrumb breadcrumbList={breadcrumbList} />
        </div>
        <div className={style.header}>
          <Search />
          <div className={style.extra}>
            { extra }
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Header;
