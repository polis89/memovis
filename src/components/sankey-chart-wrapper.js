import React, { useMemo, useState } from 'react';
import { useMemesData } from '../hooks/useMemesData';
import SankeyChart from './sankey-chart'
import * as d3 from 'd3'
import { SettingOutlined } from '@ant-design/icons'

const SankeyChartWrapper = () => {
    const { isLoading, data } = useMemesData();
    const groupedData = useMemo(() => data ? d3.groups(data, d => d.cluster) : null, [data]);
    const [selectedCluster, setSelectedCluster] = useState(null)
    const [selectedLabel, setSelectedLabel] = useState(null)

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
        data={groupedData}
        selectedCluster={selectedCluster}
        onClusterClick={cluster => {
            setSelectedLabel(null)
            setSelectedCluster(cluster === selectedCluster ? null : cluster)
        }}
        selectedLabel={selectedLabel}
        onLabelClick={label => {
            setSelectedCluster(null)
            setSelectedLabel(label === selectedLabel ? null : label)
        }}
    />
}

export default SankeyChartWrapper