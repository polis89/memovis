import React, { useMemo, useState } from 'react';
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

    const uniqLabels = groupedData ? uniq(pluck(0, pluck('labels', flatten(pluck(1, groupedData))).flat())) : []

    let clusterNodes = groupedData ? groupedData.map(d => ({id: `cluster_${d[0]}`, name: `Cluster ${d[0]}`})) : []
    let labelNodes = uniqLabels.map(d=> ({
        id: `label_${d}`,
        name: capitalizeFirstLetter(d).split('_').join(' ')
    }))

    const allNodes = [
        ...clusterNodes,
        ...labelNodes
    ]

    const allLinks = useMemo(() => groupedData ? groupedData.map(cluster => {
        const cluster_id =`cluster_${cluster[0]}`;
        const cluster_size = cluster[1].length;
        const cluster_labels = {};
        let cluster_labels_sum = 0; 
        cluster[1].forEach(document => {
            document.labels.forEach(label => {
                if (cluster_labels[label[0]]) {
                    cluster_labels[label[0]] += label[1];
                } else {
                    cluster_labels[label[0]] = label[1];
                }
                cluster_labels_sum += label[1]
            })
        })
        return Object.entries(cluster_labels).map(entry => {
            return {
                source: cluster_id,
                cluster_id: cluster[0],
                target: `label_${entry[0]}`,
                label_id: entry[0],
                value: 10 * cluster_size * entry[1] / cluster_labels_sum
            }
        })
        }).flat(1) : [],
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


    return <SankeyChart
        nodes={allNodes}
        links={allLinks}
        selectedNode={selectedNode}
        onNodeClick={node => selectedNode && node.id === selectedNode.id ? setSelectedNode(null) : setSelectedNode(node)}
    />
}

export default SankeyGroupChartWrapper