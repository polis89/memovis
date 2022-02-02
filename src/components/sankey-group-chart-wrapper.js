import React, { useRef, useMemo, useState } from 'react';
import { useMemesData } from '../hooks/useMemesData';
import SankeyChart from './sankey-chart'
import * as d3 from 'd3'
import { pluck, flatten, uniq } from 'ramda'
import { SettingOutlined } from '@ant-design/icons'
import { capitalizeFirstLetter } from '../utils'

const SankeyGroupChartWrapper = () => {
    const { isLoading, data = [] } = useMemesData();
    const groupedData = useMemo(() => data ? d3.groups(data, d => d.cluster) : null, [data]);
    const [selectedNode, setSelectedNode] = useState(null)
    const leftColRef = useRef(null);
    const leftColWidth = leftColRef.current && leftColRef.current.querySelector('.leftCol')?.offsetWidth

    const uniqFbGroups = groupedData ? uniq(pluck('fbGroup', data)) : []

    let clusterNodes = groupedData ? groupedData.map(d => ({id: `cluster_${d[0]}`, name: `Cluster ${d[0]}`})) : []
    let labelNodes = uniqFbGroups.map(d=> ({
        id: `fbgroup_${d}`,
        name: capitalizeFirstLetter(d).split('_').join(' ')
    }))

    const allNodes = [
        ...clusterNodes,
        ...labelNodes
    ]

    const allLinks = useMemo(() => groupedData ? groupedData.map(cluster => {
        const cluster_id =`cluster_${cluster[0]}`;
        const groupedFb = d3.groups(cluster[1], d => d.fbGroup);

        return groupedFb.map(entry => {
            return {
                source: cluster_id,
                target: `fbgroup_${entry[0]}`,
                value: 10 * entry[1].length
            }
        })
        }).flat(1)
        : [],
        [data]
    )

    if (isLoading) {
        return <div className='loadingContainer'>
            <SettingOutlined spin/>
        </div>
    }

    if (!data || !groupedData) {
        return <div className='loadingContainer'>
            Error while loading the data
        </div>
    }


    return <div className='flexLayout' ref={leftColRef}>
        <div className='leftCol'>
            <div className='clusterPreview'  style={{width: leftColWidth}}>
                {
                    selectedNode ?
                        <React.Fragment>{JSON.stringify(selectedNode)}</React.Fragment> :
                        <div className='previewInfoText'>
                            <div className='previewInfoText_title'>Cluster Preview</div>
                            <div className='previewInfoText_desc'>Select a cluster for preview</div>
                        </div>
                }
            </div>
        </div>
        <div className='rightCol'>
            <SankeyChart
                nodes={allNodes}
                links={allLinks}
                selectedNode={selectedNode}
                onNodeClick={node => selectedNode && node.id === selectedNode.id ? setSelectedNode(null) : setSelectedNode(node)}
            />
        </div>
    </div>
}

export default SankeyGroupChartWrapper