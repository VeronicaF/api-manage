import React, { FC } from 'react';
import { Breadcrumb as InternalBreadcrumb } from 'antd';
import { Link } from 'umi';

export interface IBreadcrumbProps {
  breadcrumbList?: {
    path: string,
    name: string,
  }[]
}

const Breadcrumb: FC<IBreadcrumbProps> = props => {
  const { breadcrumbList = [{ path: '/', name: '首页' }] } = props;
  return (
    <InternalBreadcrumb style={{ marginBottom: '8px' }}>
      { breadcrumbList.map(({ path, name }) => {
        return (
          <InternalBreadcrumb.Item key={path}>
            <Link to={path}>{ name }</Link>
          </InternalBreadcrumb.Item>
        );
      }) }
    </InternalBreadcrumb>
  );
};

export default Breadcrumb;
