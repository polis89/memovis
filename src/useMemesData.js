import { useEffect, useState } from 'react';
import * as d3 from 'd3'

export const useMemesData = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState(null);
    
    useEffect(() => {
        d3.csv('./data_filtered.csv').then((data) => {
            console.log('data', data);
            setIsLoading(false);
            setData(data);
        });
    }, [])

    return {
        isLoading,
        data
    }
}
