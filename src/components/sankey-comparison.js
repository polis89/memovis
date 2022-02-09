import React, { useRef, useMemo, useState, useEffect } from 'react';
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
import { Input, Modal, Button } from 'antd'

const SankeyComparison = () => {
    const [refAquired, setRefAquired] = useState(false)
    const [hoveredImage, setHoveredImage] = useState(null)
    const { isLoading, data = [] } = useMemesData();
    const groupedData = useMemo(() => data ? d3.groups(data, d => d.cluster) : null, [data]);
    const [selectedNodeLeft, setSelectedNodeLeft] = useState(null)
    const [selectedNodeRight, setSelectedNodeRight] = useState(null)
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalName, setModalName] = useState("");
    const [modalCluster, setModalCluster] = useState(null);
    const [clusterMapping, setClusterMapping] = useState({});
    const leftColRef = useRef(null);
    const leftColWidth = leftColRef.current && leftColRef.current.querySelector('.clusterPreviewCont')?.offsetWidth

    const leftClusterCharacteristic = useMemo(() => getClusterCharacteristic(groupedData, selectedNodeLeft), [groupedData, selectedNodeLeft])
    const rightClusterCharacteristic = useMemo(() => getClusterCharacteristic(groupedData, selectedNodeRight), [groupedData, selectedNodeRight])
    

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

    const allNodesReversed = [
        ...labelNodes,
        ...clusterNodes
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

    const allLinksReversed = useMemo(() => {
        return allLinks.map(l => ({
            ...l,
            source: l.target,
            target: l.source
        }))
    }, [allLinks])

    useEffect(() => {
        const mapping = localStorage.getItem("cluster_mapping")
        if (mapping) {
            setClusterMapping(JSON.parse(mapping))
        }
    }, [])

    if (isLoading) {
        return <div className='loadingContainer'>
            <SettingOutlined spin/>
        </div>
    }

    const handleNameClick = name => {
        setIsModalVisible(true)
        setModalName(name?.name)
        setModalCluster(name)
    }

    const handleModalOk = () => {
        const newMapping = {
            ...clusterMapping,
            [modalCluster.id]: modalName
        }
        localStorage.setItem('cluster_mapping', JSON.stringify(newMapping))
        setClusterMapping(newMapping)
        setIsModalVisible(false)
    }

    const resetNames = () => {
        localStorage.removeItem('cluster_mapping')
        setClusterMapping({})
    }


    return <div className="comparisonContainer">
        <div className='halfComparison' ref={leftColRef}>
            <div className='clusterPreviewCont'>
                <div className='clusterPreviewContainer' style={{width: leftColWidth}}>
                    <div className='clusterPreview'>
                    {
                        selectedNodeLeft ?
                            <React.Fragment>
                                <Box sx={{ width: 370, height: 400, overflowY: 'scroll' }}>
                                    <Masonry columns={2} spacing={2}>
                                        {leftClusterCharacteristic.images.map((item, i) => (
                                            <ImageListItem key={i}>
                                                <img
                                                    src={`${item.filename}`}
                                                    loading="lazy"
                                                    data-distance={item.distance}
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
                </div>
            </div>
            <div className='sankeyContainer'>
                <SankeyChart
                    nodes={allNodes}
                    links={allLinks}
                    selectedNode={selectedNodeLeft}
                    clusterNames={clusterMapping}
                    onNodeClick={node => selectedNodeLeft && node.id === selectedNodeLeft.id ? setSelectedNodeLeft(null) : setSelectedNodeLeft(node)}
                    onNameClick={handleNameClick}
                />
            </div>
        </div>
        <div className='halfComparison'>
            <div className='sankeyContainer'>
                <SankeyChart
                    nodes={allNodes}
                    links={allLinksReversed}
                    selectedNode={selectedNodeRight}
                    isReversed={true}
                    clusterNames={clusterMapping}
                    onNodeClick={node => selectedNodeRight && node.id === selectedNodeRight.id ? setSelectedNodeRight(null) : setSelectedNodeRight(node)}
                    onNameClick={handleNameClick}
                />
            </div>
            <div className='clusterPreviewCont'>
                <div className='clusterPreviewContainer' style={{width: leftColWidth}}>
                    <div className='clusterPreview'>
                    {
                        selectedNodeRight ?
                            <React.Fragment>
                                <Box sx={{ width: 370, height: 400, overflowY: 'scroll' }}>
                                    <Masonry columns={2} spacing={2}>
                                        {rightClusterCharacteristic.images.map((item, i) => (
                                            <ImageListItem key={i}>
                                                <img
                                                    src={`${item.filename}`}
                                                    loading="lazy"
                                                    data-distance={item.distance}
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
                </div>
            </div>
        </div>
        <Modal title="Change cluster name" visible={isModalVisible} onOk={handleModalOk} onCancel={()=>setIsModalVisible(false)}>
          <Input value={modalName} onChange={e => setModalName(e.target.value)}/>
        </Modal>
        <div className='resetContainer'>
            <Button onClick={resetNames}>Reset names</Button>
        </div>
    </div>
}

export default SankeyComparison