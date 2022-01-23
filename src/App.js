import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { Layout, Menu } from 'antd';
import 'antd/dist/antd.css';
import './App.css';
import Explore from './components/explore'
import Topology from "./components/topology";
import TopologyGrouped from "./components/topologyGrouped";
import SankeyChartWrapper from "./components/sankey-chart-wrapper";

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
              Topology
            </Link>
          </Menu.Item>
          <Menu.Item key={'/topologyGrouped'}>
            <Link to="/topologyGrouped">
              Topology Grouped
            </Link>
          </Menu.Item>
          <Menu.Item key={'/sankey'}>
            <Link to="/sankey">
              Sankey Chart
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
            <Route path="topologyGrouped" element={<TopologyGrouped />} />
            <Route path="sankey" element={<SankeyChartWrapper />} />
          </Routes>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>2022 Created by Dmitrii Polianskii</Footer>
    </Layout>
  );
}

export default App;
