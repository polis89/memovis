import React, { useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import * as d3sankey from 'd3-sankey'
import { pluck, flatten, uniq, clone, identity } from 'ramda'

const width = "1000"
const minHeightProCluster = "20"
const singleNodeHeight = "500"
const margin = {
    left: 100,
    top: 0,
    right: 100,
    bottom: 0
}
const linkColor = "source-target"

const SankeyChart = ({
    data,
    selectedCluster,
    selectedLabel,
    onClusterClick = identity,
    onLabelClick = identity
}) => {
    const nodesContainer = useRef(null);
    const linksContainer = useRef(null);

    const fullHeight = data.length * minHeightProCluster

    const uniqLabels = uniq(pluck(0, pluck('labels', flatten(pluck(1, data))).flat()))

    let clusterNodes = data.map(d => ({id: `cluster_${d[0]}`, cluster_id: d[0]}))
    let labelNodes = uniqLabels.map(d=> ({
        id: `label_${d}`,
        label: d
    }))

    const allNodes = [
        ...clusterNodes,
        ...labelNodes
    ]

    const allLinks = useMemo(() => data.map(cluster => {
        const cluster_id =`cluster_${cluster[0]}`;
        const cluster_size = cluster[1].length;
        const cluster_labels = {};
        let cluster_labels_sum = 0; 
        cluster[1].forEach(document => {
            document.labels.forEach(label => {
                if (cluster_labels[label[0]]) {
                    cluster_labels[label[0]] += label[1];
                } else {
                    cluster_labels[label[0]] = label[1];
                }
                cluster_labels_sum += label[1]
            })
        })
        return Object.entries(cluster_labels).map(entry => {
            return {
                source: cluster_id,
                cluster_id: cluster[0],
                target: `label_${entry[0]}`,
                label_id: entry[0],
                value: 10 * cluster_size * entry[1] / cluster_labels_sum
            }
        })
        }).flat(1),
        [data]
    )

    if (selectedCluster) {
        clusterNodes = clusterNodes.filter(n => n.cluster_id === selectedCluster)
        labelNodes = uniq(
            allLinks
                .filter(l => l.cluster_id === selectedCluster)
                .map(l => ({
                    id: l.target,
                    label: l.label_id 
                })))
    } else if (selectedLabel) {
        labelNodes = labelNodes.filter(n => n.label === selectedLabel)
    }
    
    const filteredNodes = [
        ...clusterNodes,
        ...labelNodes
    ]

    let filteredLinks = allLinks;
    
    if (selectedCluster) {
        filteredLinks = allLinks.filter(l => l.cluster_id === selectedCluster)
    } else if (selectedLabel) {
        filteredLinks = allLinks.filter(l => l.label_id === selectedLabel)
    }

        
    const colorScale = d3.scaleOrdinal().range(d3.schemePaired).domain(allNodes.map(d => d.id));

    const updateSankeyChart = (nodes, links) => {
        const height = selectedCluster ? singleNodeHeight : fullHeight

        const sankeyGenerator = d3sankey.sankey()
          .nodeId(d => d.id)
          .nodeAlign(d3sankey.sankeyJustify)
          .nodeWidth(15)
        //   .nodePadding(isSingleNode ? 3 : 0)
          .nodePadding(0)
          .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]]);
    
        sankeyGenerator({nodes, links});
    
        d3.select(nodesContainer.current)
            // .attr("stroke-linejoin", nodeStrokeLinejoin)
            .selectAll("rect")
            .data(nodes)
            .join("rect")
            .attr("stroke-width", '1')
            .attr("cursor", 'pointer')
            .attr("stroke-opacity", '1')
            .attr("stroke", 'currentColor')
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr('fill', d => colorScale(d.id))
            .attr('title', d => d.id)
            .on('click', (e, d) => {
                if (d.cluster_id) {
                    onClusterClick(d.cluster_id)
                } else if (d.label) {
                    onLabelClick(d.label)
                }
            });
    
        d3.select(nodesContainer.current)
            .selectAll("text")
            .data(nodes)
            .join("text")
            .style('font-size', 10)
            .style('font-weight', 400)
            .attr('text-anchor', d => d.id.startsWith('cluster') ? 'end' : 'start')
            .attr("x", d => d.id.startsWith('cluster') ? d.x0 - 4 : d.x1 + 4)
            .attr("y", d => 4 + (d.y0 + d.y1) / 2)
            .text(d => d.id.startsWith('cluster') ? d.id : d.id.substring(6, d.id.length))
            .each(function(d) {
                const height = d3.select(this).node().getBoundingClientRect().height
                d3.select(this).style('opacity', height > d.y1-d.y0 ? 0 : 1)
            })
    
        d3.select(linksContainer.current)
            .selectAll("linearGradient")
            .data(links, d => `${d.source.id}-link-${d.target.id}`)
            .join("linearGradient")
            .style("mix-blend-mode", 'multiply')
            .attr("id", d => `${d.source.id}-link-${d.target.id}`)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", d => d.source.x1)
            .attr("x2", d => d.target.x0)
            .call(gradient => gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", d => colorScale(d.source.id)))
            .call(gradient => gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", d => colorScale(d.target.id)));
      
        d3.select(linksContainer.current)
            .selectAll("path")
            .data(links, d => `${d.source.id}-link-${d.target.id}`)
            .join("path")
            .attr("d", d3sankey.sankeyLinkHorizontal())
            .attr("stroke", d => `url(#${d.source.id}-link-${d.target.id})`)
            .attr("stroke-width", ({width}) => Math.max(1, width))
            // .call(Lt ? path => path.append("title").text(({index: i}) => Lt[i]) : () => {});
    }

    useEffect(() => {
            updateSankeyChart(clone(filteredNodes),clone(filteredLinks), false);
    }, [filteredNodes, filteredLinks])


    return <div>
        <svg
            width={width}
            height={fullHeight}
            viewBox={[0,0,width,fullHeight]}
            style={{
                maxWidth: '100%',
                height: 'intrinsic'
            }}>
            <g className='nodes-container' ref={nodesContainer}></g>        
            <g className='link-container' ref={linksContainer} fill='none' strokeOpacity='0.5'></g>        
        </svg>
    </div>
}

export default SankeyChart;
