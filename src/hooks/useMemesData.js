import { useEffect, useState } from 'react';
import * as d3 from 'd3'

export const useMemesData = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState(null);
    
    useEffect(() => {
        d3.csv('./data_filtered.csv').then(data => {
            setIsLoading(false);
            setData(data.map(d => ({
                ...d,
                labels: JSON.parse(d.labels.replace(/\['(.*?)',/g, '["$1",')),
                fbGroup: d.name.split('-').slice(0,-1).join('-'),
                fingerprints: [
                    ...d.fingerprints.slice(1, -1).split(' ').filter(f => f).slice(0,3).map(f => parseFloat(f)),
                    ...d.fingerprints.slice(0, -1).split(' ').filter(f => f).slice(-3).map(f => parseFloat(f))
                ]
            })));
        });
    }, [])

    return {
        isLoading,
        data
    }
}
