import React from 'react';
import { useMemesData } from './useMemesData';

const Explore = () => {
    const { isLoading, data } = useMemesData();
    return <div>
        isLoading: {isLoading}
        data: {JSON.stringify(data)}
    </div>
}

export default Explore;
