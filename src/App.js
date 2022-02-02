import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { Layout, Menu } from 'antd';
import 'antd/dist/antd.css';
import './App.css';
import Explore from './components/explore'
import Topology from "./components/topology";
import TopologyGrouped from "./components/topologyGrouped";
import TopologyReduced from "./components/topologyReduced";
import SankeyChartWrapper from "./components/sankey-chart-wrapper";
import SankeyGroupChartWrapper from "./components/sankey-group-chart-wrapper";
import Voronoi from "./components/voronoi";

const { Header, Content, Footer } = Layout;

const App = () => {
  let location = useLocation();

  return (
    <Layout className="layout">
      <Header  style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
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
          <Menu.Item key={'/topologyReduced'}>
            <Link to="/topologyReduced">
              Topology Link Limit
            </Link>
          </Menu.Item>
          <Menu.Item key={'/topologyGrouped'}>
            <Link to="/topologyGrouped">
              Topology with Centers
            </Link>
          </Menu.Item>
          <Menu.Item key={'/voronoi'}>
            <Link to="/voronoi">
              Voronoi
            </Link>
          </Menu.Item>
          <Menu.Item key={'/sankey'}>
            <Link to="/sankey">
              Sankey Cluster vs Labels
            </Link>
          </Menu.Item>
          <Menu.Item key={'/sankeyGroup'}>
            <Link to="/sankeyGroup">
              Sankey Cluster vs FB Group
            </Link>
          </Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: '70px 50px 0' }}>
        <div className="site-layout-content">
          <Routes>
            <Route exact path="/" element={<Navigate to="/explore" />} />
            <Route path="explore" element={<Explore />} />
            <Route path="topology" element={<Topology />} />
            <Route path="topologyReduced" element={<TopologyReduced />} />
            <Route path="topologyGrouped" element={<TopologyGrouped />} />
            <Route path="voronoi" element={<Voronoi />} />
            <Route path="sankey" element={<SankeyChartWrapper />} />
            <Route path="sankeyGroup" element={<SankeyGroupChartWrapper />} />
          </Routes>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>2022 Created by Dmitrii Polianskii</Footer>
    </Layout>
  );
}

export default App;
