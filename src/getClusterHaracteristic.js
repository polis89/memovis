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
    const sum = images.reduce((acc,cur) => {
        if (!acc) {
            return cur.fingerprints
        } else {
            return cur.fingerprints.map((f,i) => f + acc[i])
        }
    }, null)

    const clusterFingerprint = sum.map(f => f / images.length)

    images = images.map(i => {
        return {
            ...i,
            distance: distance(clusterFingerprint, i.fingerprints)
        }
    })

    images = sortBy(prop('distance'), images)

    return {
        fingerprint: clusterFingerprint,
        images: images.slice(0, 10)
    }
}