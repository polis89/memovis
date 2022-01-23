import React, { useRef, useEffect } from 'react';
import { useMemesData } from '../hooks/useMemesData';
import { SettingOutlined } from '@ant-design/icons'
import * as d3 from 'd3'
import ForceGraph from '../visualizatons/force-graph'

const Topology = () => {
    const chartContainer = useRef(null);
    const { isLoading, data } = useMemesData();

    let chart;

    if (data) {
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
        const graph = {
            nodes: [
                ...clusterCenterNodes,
                ...dataEntriesNodes
            ],
            links: [...dataLinks]
        }
        
        chart = ForceGraph(graph, {
            nodeId: d => d.id,
            nodeGroup: d => d.group,
            nodeTitle: d => d.labels ? `${d.labels}` : `${d.id}`,
            width: 1000,
            height: 800,
            // nodeStrength: -3
        })  
    }
    
    // useEffect(() => {
    //     console.log('chart', chart);
        
    //     if (data && chart) {
    //         chartContainer.current.innerHTML = "";
    //         chartContainer.current.appendChild(chart);
    //     }
    // }, [chart]);

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

    return <div ref={chartContainer}>TODO</div>
}

export default Topology;
