import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import * as d3sankey from 'd3-sankey'
import { uniq, clone, identity, flatten } from 'ramda'

const minHeightProCluster = "20"
const singleNodeHeight = "500"
const linkColor = "source-target"

const SankeyChart = ({
    nodes,
    links,
    selectedNode,
    isReversed,
    clusterNames,
    onNameClick = identity,
    onNodeClick = identity
}) => {
    const margin = {
        left: isReversed ? 180 : 100,
        top: 4,
        right: isReversed ? 100 : 180,
        bottom: 4
    }
    const chartContainer = useRef(null);
    const nodesContainer = useRef(null);
    const linksContainer = useRef(null);
    const [refAquired, setRefAquired] = useState(false)
    const width = chartContainer.current && chartContainer.current.offsetWidth;
    console.log('width', width);
    

    const fullHeight = uniq(links.map(l => isReversed ? l.target : l.source)).length * minHeightProCluster
    const height = selectedNode ? singleNodeHeight : fullHeight
    
    let filteredNodes = nodes;
    let filteredLinks = links;

    if (selectedNode) {
        filteredLinks = filteredLinks.filter(l => (l.source === selectedNode.id) || (l.target === selectedNode.id))
        filteredNodes = filteredNodes.filter(n => flatten(filteredLinks.map(l => [l.source, l.target])).includes(n.id))
    }
        
    const colorScale = d3.scaleOrdinal().range(d3.schemePaired).domain(nodes.map(d => d.id));

    const updateSankeyChart = (nodes, links) => {
        const sankeyGenerator = d3sankey.sankey()
          .nodeId(d => d.id)
          .nodeAlign(d3sankey.sankeyJustify)
          .nodeSort((a,b) => {
              if (a.id.startsWith('cluster') && b.id.startsWith('cluster')) {
                  const clusterA = parseInt(a.id.slice(8));
                  const clusterB = parseInt(b.id.slice(8));
                  return clusterA > clusterB
              }
              return 0
          })
          .nodeWidth(15)
          .nodePadding(selectedNode ? 8 : 0)
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
                onNodeClick(d)
            });
    
        d3.select(nodesContainer.current)
            .selectAll("text")
            .data(nodes)
            .join("text")
            .style('font-size', 10)
            .style('font-weight', 400)
            .attr('text-anchor', d => {
                if (isReversed) {
                    return d.id.startsWith('cluster') ? 'start' : 'end';
                } else {
                    return d.id.startsWith('cluster') ? 'end' : 'start';
                }
            })
            .attr('x', d => {
                if (isReversed) {
                    return d.id.startsWith('cluster') ? d.x1 + 4 : d.x0 - 4
                } else {
                    return d.id.startsWith('cluster') ? d.x0 - 4 : d.x1 + 4
                }
            })
            .attr("y", d => 4 + (d.y0 + d.y1) / 2)
            .text(d => clusterNames?.[d.id] || d.name)
            .style('cursor', d => d.id.startsWith('cluster') ? 'pointer' : 'default')
            .each(function(d) {
                const height = d3.select(this).node().getBoundingClientRect().height
                const pad = selectedNode ? 8 : 0
                d3.select(this).style('opacity', (height - pad) > d.y1-d.y0 ? 0 : 1)
            })
            .on('click', (e, d) => {
                if (d.id.startsWith('cluster')) {
                    onNameClick(d)
                }
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
        setRefAquired(true)
    }, [])

    useEffect(() => {
        width && filteredNodes.length > 0 && filteredLinks.length > 0 && updateSankeyChart(clone(filteredNodes),clone(filteredLinks));
    }, [filteredNodes, filteredLinks, refAquired])


    return <div ref={chartContainer}>
        <svg
            width={width}
            height={height}
            viewBox={[0,0,width,height]}
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
