import React, { useMemo, useState } from 'react';
import { useMemesData } from '../hooks/useMemesData';
import { SettingOutlined } from '@ant-design/icons'
import * as d3 from 'd3'
import ForceGraph from './force-graph'
import { Switch } from 'antd'

const TopologyGrouped = () => {
    const { isLoading, data } = useMemesData();
    const [ isLinksVisible, setIsLinksVisible ] = useState(true);

    const graph = useMemo(() => {
        if (!data) return null

        const groupedData = d3.groups(data, d => d.cluster)

        const graphLinks = groupedData.map(group => {
            const groupLinks = []
            for (let i = 0; i < group[1].length - 1; i++) {
                for (let j = i + 1; j < group[1].length; j++) {
                    groupLinks.push({
                        source: group[1][i].id,
                        target: group[1][j].id
                    })
                }
            }
            return groupLinks
        }).flat(1)
        return {
            nodes: [...data],
            links: [...graphLinks]
        }
    }, [data])

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

    console.log('isLinksVisible', isLinksVisible);
    

    return <React.Fragment>
        <div className='switch-container'>
            <span>
                Show links
            </span>
            <Switch defaultChecked={isLinksVisible} checked={isLinksVisible} onChange={setIsLinksVisible} />
        </div>
        <ForceGraph
            nodes={graph.nodes}
            links={graph.links}
            nodeGroup={d => d.cluster}
            nodeTitle={d => d.labels ? `${d.labels}` : `${d.id}`}
            isLinksVisible={isLinksVisible}
            skipAnimation />
    </React.Fragment>
}

export default TopologyGrouped;
