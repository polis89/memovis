import React, { useMemo, useState } from 'react';
import { useMemesData } from '../hooks/useMemesData';
import { SettingOutlined } from '@ant-design/icons'
import * as d3 from 'd3'
import ForceGraph from './force-graph'
import { Select, Switch } from 'antd';
const { Option } = Select;

const TopologyReduced = () => {
    const { isLoading, data } = useMemesData();
    const [ linksLimit, setLinksLimit ] = useState(3);
    const [ skipAnimation, setskipAnimation ] = useState(true);

    const graph = useMemo(() => {
        if (!data) return null

        const groupedData = d3.groups(data, d => d.cluster)

        const graphLinks = groupedData.map(group => {
            const groupLinks = []
            for (let i = 0; i < group[1].length - 1; i++) {
                const nodeLinks = []
                for (let j = 0; j < group[1].length; j++) {
                    if (j !== i) {
                        nodeLinks.push({
                            source: group[1][i].id,
                            target: group[1][j].id
                        })
                    }
                }
                const maxLinks = linksLimit
                if (nodeLinks.length <= maxLinks) {
                    groupLinks.push.apply(groupLinks, nodeLinks);
                } else {
                    for (let s = 0; s < maxLinks; s++) {
                        const randomIndex = Math.floor(Math.random()*nodeLinks.length);
                        const randomLink = nodeLinks[randomIndex]
                        nodeLinks.splice(randomIndex, 1);
                        groupLinks.push(randomLink)
                    }
                }

            }
            return groupLinks
        }).flat(1)
        return {
            nodes: [...data],
            links: [...graphLinks]
        }
    }, [data, linksLimit])

    if (isLoading) {
        return <div className='loadingContainer'>
            <SettingOutlined spin/>
        </div>
    }

    if (!data) {
        return <div className='loadingContainer'>
            Error while loading the data
        </div>
    }

    return <React.Fragment>
        <div className='switch-container'>
            <span>
                Links Limit:
            </span>
        </div>
        <Select value={linksLimit} style={{ width: 120 }} onChange={setLinksLimit}>
            {
                Array.from(Array(10).keys()).map(v => {
                    return <Option value={v}>{v}</Option>
                })
            }
        </Select>
        <div className='switch-container'>
            <span>
                SkipAnimation
            </span>
            <Switch defaultChecked={skipAnimation} checked={skipAnimation} onChange={setskipAnimation} />
        </div>
        <ForceGraph
            nodes={graph.nodes}
            links={graph.links}
            nodeGroup={d => d.cluster}
            nodeTitle={d => d.labels ? `${d.labels}` : `${d.id}`}
            skipAnimation={skipAnimation}
            isLinksVisible={false}
            useVoronoi={true}
             />
    </React.Fragment>
}

export default TopologyReduced;
