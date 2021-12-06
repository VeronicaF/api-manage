import React from 'react';
// import logo from '@/assets/logo.jpg';

import { Link } from 'umi';
import styles from './index.less';

const BasicLayout: React.FC = props => {
  // const dispatch = useDispatch();

  // const { currentUser } = useSelector(state => state.user);

  // const effects = useMemo(() => ({
  //   fetchCurrentUser() {
  //     dispatch({
  //       type: 'user/fetchCurrentUser',
  //     });
  //   },
  // }), [dispatch]);

  // useMount(() => {
  //   effects.fetchCurrentUser();
  // });

  // if (!currentUser.userId) {
  //   return null;
  // }
  return (
    <>
      <div className={styles.banner}>
        <Link to="/" className={styles.nav}>
          {/* <img src={logo} alt="logo" className={styles.logo} /> */}
          <span className={styles.title}>API管理</span>
        </Link>
      </div>
      { props.children }
    </>
  );
};

export default BasicLayout;
