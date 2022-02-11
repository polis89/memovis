import React, { useRef, useMemo, useState } from 'react';
import { useMemesData } from '../hooks/useMemesData';
import SankeyChart from './sankey-chart'
import * as d3 from 'd3'
import { pluck, flatten, uniq } from 'ramda'
import { SettingOutlined } from '@ant-design/icons'
import { capitalizeFirstLetter } from '../utils'
import { getClusterCharacteristic } from '../getClusterHaracteristic'
import Box from '@mui/material/Box';
import ImageListItem from '@mui/material/ImageListItem';
import Masonry from '@mui/lab/Masonry';

const SankeyGroupChartWrapper = () => {
    const [refAquired, setRefAquired] = useState(false)
    const [hoveredImage, setHoveredImage] = useState(null)
    const { isLoading, data = [] } = useMemesData();
    const groupedData = useMemo(() => data ? d3.groups(data, d => d.cluster) : null, [data]);
    const [selectedNode, setSelectedNode] = useState(null)
    const leftColRef = useRef(null);
    const leftColWidth = leftColRef.current && leftColRef.current.querySelector('.leftCol')?.offsetWidth

    const clusterCharacteristic = useMemo(() => getClusterCharacteristic(groupedData, selectedNode), [groupedData, selectedNode])

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


    return <div className='flexLayout' ref={leftColRef}>
        <div className='leftCol'>
            {
                isLoading && <div className='loadingContainer'>
                    <SettingOutlined spin/>
                </div>
            }
            { !isLoading && <div className='clusterPreviewContainer'  style={{width: leftColWidth}}>
                <div className='clusterPreview'>
                    {
                        selectedNode ?
                            <React.Fragment>
                                <Box sx={{ width: 550, height: 400, overflowY: 'scroll' }}>
                                    <Masonry columns={3} spacing={1}>
                                        {clusterCharacteristic.images.map((item, i) => (
                                            <ImageListItem key={i}>
                                                <img
                                                    src={`${item.filename}`}
                                                    loading="lazy"
                                                    onMouseOver={() => setHoveredImage(item)}
                                                    onMouseLeave={() => setHoveredImage(null)}
                                                />
                                            </ImageListItem>
                                        ))}
                                    </Masonry>
                                </Box>                                
                            </React.Fragment> :
                            <React.Fragment>
                                <div className='previewInfoText'>
                                    <div className='previewInfoText_title'>Cluster Preview</div>
                                    <div className='previewInfoText_desc'>Select a cluster for preview</div>
                                </div>
                            </React.Fragment>
                    }
                </div>
            </div> }
        </div>
        <div className='rightCol'>
            { !isLoading && <SankeyChart
                nodes={allNodes}
                links={allLinks}
                selectedNode={selectedNode}
                onNodeClick={node => selectedNode && node.id === selectedNode.id ? setSelectedNode(null) : setSelectedNode(node)}
            />
            }
        </div>
    </div>
}

export default SankeyGroupChartWrapper