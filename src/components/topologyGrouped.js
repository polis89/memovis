import React, { useMemo } from 'react';
import { useMemesData } from '../hooks/useMemesData';
import { SettingOutlined } from '@ant-design/icons'
import * as d3 from 'd3'
import ForceGraph from './force-graph'

const TopologyGrouped = () => {
    const { isLoading, data } = useMemesData();

    const graph = useMemo(() => {
        if (!data) return null

        const groupedData = d3.groups(data, d => d.cluster)
    
        const clusterCenterNodes = groupedData.map(group => {
            const labels = {}
            group[1].forEach(node => {
                node.labels.forEach(label => {
                    if (labels[label[0]]) {
                        labels[label[0]].count += label[1]
                    } else {
                        labels[label[0]] = {
                            name: label[0],
                            count: label[1]
                        }
                    }
                })
            })
            const sortedLabels = d3.sort(Object.values(labels), (a,b) => d3.descending(a.count, b.count))
            return {
                id: `cluster-${group[0]}`,
                group: 'cluser-center',
                count: group[1].length,
                labels: sortedLabels.slice(0,5)
            }
        })
        const dataEntriesNodes = data.map((d, i) => {
            return {
                ...d,
                id: `node-${i}`,
                group: 'node'
            }
        })
    
        const dataLinks = data.map((d, i) => {
            return {
                source: `node-${i}`,
                target: `cluster-${d.cluster}`
            }
        })
        return {
            nodes: [
                ...clusterCenterNodes,
                ...dataEntriesNodes
            ],
            links: [...dataLinks]
        }
    })

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

    return <ForceGraph
        nodes={graph.nodes}
        links={graph.links}
        nodeGroup={d => d.group}
        nodeTitle={d => d.labels ? `${d.labels}` : `${d.id}`} />
}

export default TopologyGrouped;
