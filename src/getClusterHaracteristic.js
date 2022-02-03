import { distance } from 'mathjs'
import { sortBy, prop } from 'ramda'

export const getClusterCharacteristic = (groupedData, cluster) => {
    let images;
    if (groupedData?.[cluster?.index]?.[0] === cluster?.id.split('_')[1]) {
        images = groupedData?.[cluster?.index]?.[1]
    }
    if (!images) {
        return null
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