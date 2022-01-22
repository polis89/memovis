import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { Layout, Menu } from 'antd';
import 'antd/dist/antd.css';
import './App.css';
import Explore from './explore'
import Topology from "./topology-1";

const { Header, Content, Footer } = Layout;

const App = () => {
  let location = useLocation();

  return (
    <Layout className="layout">
      <Header>
        <Link to="/explore">
          <div className="logo" >
            MemoVis
          </div>
        </Link>
        <Menu theme="dark" mode="horizontal" selectedKeys={[location.pathname]}>
          <Menu.Item key={'/explore'}>
            <Link to="/explore">
              Explore Dataset
            </Link>
          </Menu.Item>
          <Menu.Item key={'/topology'}>
            <Link to="/topology">
              Graph Topology
            </Link>
          </Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <div className="site-layout-content">
          <Routes>
            <Route exact path="/" element={<Navigate to="/explore" />} />
            <Route path="explore" element={<Explore />} />
            <Route path="topology" element={<Topology />} />
          </Routes>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>2022 Created by Dmitrii Polianskii</Footer>
    </Layout>
  );
}

export default App;
