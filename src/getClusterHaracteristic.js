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

    return {
        fingerprint: sum.map(f => f / images.length)
    }
}