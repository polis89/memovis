import { distance } from 'mathjs'
import { sortBy, prop, find } from 'ramda'

export const getClusterCharacteristic = (groupedData, cluster) => {
    let images;
    if (cluster?.id.startsWith("fbgroup_")) {
        images = groupedData?.map(d => d[1].filter(i => i.fbGroup === cluster.id.slice(8))).flat()
    } else {
        const clusterId = cluster?.id.split('_')[1]
        images = groupedData ? find(d => d[0] === clusterId, groupedData) : null
        images = images?.[1]
    }
    if (!images) {
        return {
            images: []
        }
    }

    images = sortBy(prop('distance'), images)

    return {
        images: images.slice(0, 10)
    }
}