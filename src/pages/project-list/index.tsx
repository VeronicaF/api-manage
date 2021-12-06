import React, { FC, useState } from 'react';
import { useRequest, useToggle, useMount } from 'ahooks';
import { router } from 'umi';
import classNames from 'classnames';
import { saveAs } from 'file-saver';
import { Button, Modal, Form, Input, message, Divider, Popconfirm, Space, Checkbox } from 'antd';
import Header from '@/components/Header';
// import logo from '@/assets/logo1.jpg';

import {
  _createProject,
  _deleteProject,
  _editProject,
  _exportProjects,
  _fetchProjects,
} from '@/pages/project-list/service';
import style from './index.less';

const ProjectList = () => {
  const [position, setPosition] = useState<number[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>();

  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [checkedProjects, setCheckedProjects] = useState<Set<number>>(new Set());
  const [exporting, { toggle: toggleExporting }] = useToggle();

  const { data: projects, run: fetchProjects } = useRequest(_fetchProjects, { manual: true });
  const { run: editProject } = useRequest(_editProject, {
    manual: true,
    throwOnError: true,
    onError: () => {
      message.error('修改失败');
      setEditing(false);
    },
    onSuccess: () => {
      message.success('修改成功');
      setEditing(false);
      fetchProjects();
    },
  });
  const { run: deleteProject } = useRequest(_deleteProject, {
    manual: true,
    throwOnError: true,
    onError: () => {
      message.error('删除失败');
    },
    onSuccess: () => {
      message.success('删除成功');
      fetchProjects();
    },
  });

  const { run: exportApis, loading } = useRequest(() => _exportProjects([...checkedProjects] as number[]), {
    manual: true,
    ready: checkedProjects.size > 0,
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
    setCheckedProjects(new Set());
  }

  const onFinish = (values: { projectName: string }) => {
    selectedProjectId && editProject(selectedProjectId, values.projectName);
  };

  const extra = (
    <Space>
      <NewProject afterCreate={fetchProjects} />
      { !exporting && (
        <Button
          type="dashed"
          onClick={() => {
            toggleExporting();
          }}
        >
          导出
        </Button>
      ) }
    </Space>
  );

  useMount(() => {
    fetchProjects();
    const onClick = (e: MouseEvent) => {
      if (e.currentTarget === window) {
        setVisible(false);
        setEditing(false);
      }
    };
    window.addEventListener('click', onClick);
    const onContextMenu = (e: MouseEvent) => {
      e.stopPropagation();
      setVisible(false);
    };
    window.addEventListener('contextmenu', onContextMenu);
    return () => {
      window.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('click', onClick);
    };
  });

  return (
    <>
      <Header
        breadcrumbList={[
          { path: '/', name: '主页' },
          { path: '/project-list', name: '工作台' },
        ]}
        extra={extra}
      />

      <div className={style.projectList}>
        { projects?.map(({ projectId, projectName }) => {
          const checked = checkedProjects.has(projectId);
          return (
            <div
              key={projectId}
              className={classNames(style.project, { [style.checked]: checked })}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setPosition([e.clientX, e.clientY]);
                setSelectedProjectId(projectId);
                setVisible(true);
                return false;
              }}
              onClick={e => {
                e.stopPropagation();
                if (exporting) {
                  if (checkedProjects.has(projectId)) {
                    checkedProjects.delete(projectId);
                  } else {
                    checkedProjects.add(projectId);
                  }
                  setCheckedProjects(new Set(checkedProjects));
                } else {
                  router.push(`/${projectId}/api-list`);
                }
              }}
            >
              { exporting && (
                <Checkbox
                  className={style.checkbox}
                  checked={checked}
                />
              ) }
              <div className={style.logoWrapper}>
                {/* <img src={logo} alt="logo" className={style.logo} /> */}
              </div>
              { (!editing || projectId !== selectedProjectId) && (
                <div style={{ textAlign: 'center' }}>{ projectName }</div>
              ) }
              { editing && (projectId === selectedProjectId) && (
                <Form onFinish={onFinish} onClick={e => e.stopPropagation()}>
                  <Form.Item
                    name="projectName"
                    label="项目名称"
                    rules={[{ required: true, message: '必填' }]}
                    initialValue={projectName}
                    required
                  >
                    <Input />
                  </Form.Item>
                </Form>
              ) }
            </div>
          );
        }) }
      </div>

      <div
        style={{
          display: visible ? 'block' : 'none',
          left: `${position[0]}px`,
          top: `${position[1]}px`,
        }}
        className={style.contextMenu}
      >
        <div
          className={style.contextMenuItem}
          onClick={e => {
            e.stopPropagation();
            setVisible(false);
            setEditing(true);
          }}
        >
          重新命名
        </div>
        <Divider type="horizontal" style={{ margin: 0 }} />
        <Popconfirm
          title="确认删除？"
          onConfirm={() => selectedProjectId && deleteProject(selectedProjectId)}
          okText="删除"
          okType="danger"
          cancelText="取消"
        >
          <div
            className={classNames(style.contextMenuItem, style.delete)}
            onClick={e => e.stopPropagation()}
          >
            删除
          </div>
        </Popconfirm>
      </div>

      { exporting && (
        <div className={style.fixed}>
          <Button
            type="primary"
            onClick={exportApis}
            loading={loading}
            disabled={loading}
          >
            确认导出
          </Button>
          <br />
          <Button
            onClick={() => setCheckedProjects(
              new Set(projects?.map(({ projectId }) => projectId))
            )}
          >
            全部选中
          </Button>
          <br />
          <Button onClick={cancelExport}>取消导出</Button>
        </div>
      ) }
    </>
  );
};

interface INewProject {
  afterCreate?: Function
}

const NewProject: FC<INewProject> = props => {
  const { afterCreate } = props;
  const [visible, { toggle: toggleVisible }] = useToggle();
  const { run } = useRequest(_createProject, {
    manual: true,
    onError: () => message.error('创建失败'),
    onSuccess: () => {
      afterCreate && afterCreate();
      message.success('新建成功');
      toggleVisible();
    },
  });

  const onFinish = (values: { projectName: string }) => run(values.projectName);

  return (
    <>
      <Button type="primary" onClick={() => toggleVisible()}>+新建项目</Button>
      <Modal
        onCancel={() => toggleVisible()}
        visible={visible}
        title="新建项目"
        centered
        destroyOnClose
        footer={false}
        width={600}
      >
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          onFinish={onFinish}
        >
          <Form.Item
            label="项目名称"
            name="projectName"
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
};

export default React.memo(ProjectList);
