import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { uniq } from 'ramda'
import { SettingOutlined } from '@ant-design/icons'

const intern = value => {
    return value !== null && typeof value === "object" ? value.valueOf() : value;
}

const ForceGraph = ({
    nodes, // an iterable of node objects (typically [{id}, …])
    links, // an iterable of link objects (typically [{source, target}, …])
    radiusScale,
    nodeStrength,
    linkStrength,
    width = 800, // outer width, in pixels
    height = 800, // outer height, in pixels
    nodeStroke = "#fff", // node stroke color
    nodeStrokeWidth = 1.5, // node stroke width, in pixels
    nodeStrokeOpacity = 1, // node stroke opacity
    nodeRadius = 7, // node radius, in pixels
    linkStroke = "#999", // link stroke color
    linkStrokeOpacity = 0.6, // link stroke opacity
    linkStrokeWidth = 1.5, // given d in links, returns a stroke width in pixels
    nodeId = d => d.id, // given d in nodes, returns a unique identifier (string)
    nodeTitle, // given d in nodes, a title string
    nodeGroup, // given d in nodes, returns an (ordinal) value for color
    linkSource = ({source}) => source, // given d in links, returns a node identifier string
    linkTarget = ({target}) => target, // given d in links, returns a node identifier string
    colors = d3.schemePaired, // an array of color strings, for the node groups
    invalidation, // when this promise resolves, stop the simulation
    skipAnimation,
    isLinksVisible = true,
    useVoronoi = false
}) => {
    const linkContainerRef = useRef(null)
    const nodeContainerRef = useRef(null)
    const tooltipContainerRef = useRef(null)
    const voronoiContainerRef = useRef(null)
    const svgRef = useRef(null)

    const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern);
  
    // Compute default domains.
    const nodeGroups = G ? d3.sort(G) : null;
    const rainbowColoring = uniq(G).reduce((acc, cur) => {
        return {
            ...acc,
            [cur]: d3.interpolateRainbow(Math.random())
        }
    }, {})

    // Construct the scales.
    const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors);

    const [isLoading, setIsLoading] = useState(skipAnimation ? true : false)

    const updateVoronoi = points => {
        const particles = points.map(p => [p.x, p.y])
        const delaunay = d3.Delaunay.from(particles);
        const voronoi = delaunay.voronoi([-width / 2, -height / 2, width / 2, height / 2]);
        
        d3.select(nodeContainerRef.current)
            .selectAll('.viz-node')
            .attr('r' , 1)

        d3.select(voronoiContainerRef.current)
            .selectAll('.voronoi-cell')
            .data(voronoi.cellPolygons())
            .join('path')
            .attr("d", (d) => 
                  { 
                     return d ? 
                    ("M" + d.join("L") +
                     "Z") : null; })
            .attr("fill", (d,i) => rainbowColoring[G[i]])
            .attr("stroke", "black")
        
    }

    const updateChart = () => {
        // Compute values.
        const N = d3.map(nodes, nodeId).map(intern);
        const LS = d3.map(links, linkSource).map(intern);
        const LT = d3.map(links, linkTarget).map(intern);
        if (nodeTitle === undefined) nodeTitle = (_, i) => N[i];
        const T = nodeTitle == null ? null : d3.map(nodes, nodeTitle);
        
        const W = typeof linkStrokeWidth !== "function" ? null : d3.map(links, linkStrokeWidth);
      
        // Replace the input nodes and links with mutable objects for the simulation.
        const mutableNodes = d3.map(nodes, (n, i) => ({id: N[i], ...n}));
        const mutableLinks = d3.map(links, (_, i) => ({source: LS[i], target: LT[i]}));

        // Construct the forces.
        const forceNode = d3.forceManyBody();
        const forceLink = d3.forceLink(mutableLinks).id(({index: i}) => N[i]).distance(d => {
            if (radiusScale) {
                return 20 + radiusScale(d.target.count)
            } else {
                return 30;
            }
        });
        if (nodeStrength !== undefined) forceNode.strength(nodeStrength);
        forceNode.distanceMin(2)
        // forceNode.distanceMax(2560)
        if (linkStrength !== undefined) forceLink.strength(linkStrength);

        const simulation = d3.forceSimulation(mutableNodes)
            .alphaMin(0.15)
            .force("link", forceLink)
            .force("charge", forceNode)
            .force("x", d3.forceX())
            .force("y", d3.forceY())
            .on("tick", skipAnimation ? null : ticked)
            .on("end", () => {
                if (skipAnimation) {
                    ticked();
                    setIsLoading(false)
                }
                useVoronoi && updateVoronoi(mutableNodes)
            })
            // .on("end", () => useVoronoi && updateVoronoi(mutableNodes));
            // .on("end", () => updateImages(svg));
            // .on("end", () => readyCallback && readyCallback(mutableNodes));
  
        const link = d3.select(linkContainerRef.current)
            .selectAll("line")
            .data(mutableLinks)
            .join("line");

        if (W) link.attr("stroke-width", ({index: i}) => W[i]);

        // Add svg filter defs
        d3.select(svgRef.current).selectAll("filter")
            .data(mutableNodes.filter(d => d.group === 'node'))
            .enter()
            .append('filter')
            .attr('id', d => `id-${d.id}`)
            .attr('x','0%')
            .attr('y','0%')
            .attr('width', '100%')
            .attr('height', '100%')
            .append('feImage')
            .attr('xlink:href', d => d.filename)
        
        const tooltipContainer = d3.select(tooltipContainerRef.current)

        const node = d3.select(nodeContainerRef.current)
            // .attr("fill", nodeFill)
            .attr("stroke", nodeStroke)
            .attr("stroke-opacity", nodeStrokeOpacity)
            .attr("stroke-width", nodeStrokeWidth)
            .selectAll("circle")
            .data(mutableNodes)
            .join("circle")
            .attr("class", 'viz-node')
            .on('mouseenter', (event, d) => {
                if (d.group === 'node') {
                    tooltipContainer.append('img').classed('tooltip',true)
                        .style('width', '140px')
                        .style('position', 'absolute')
                        .style('top', `${event.offsetY}px`)
                        .style('left', `${event.offsetX}px`)
                        .attr('src', d.filename)
                } else if (d.group === 'cluster') {
                    const cont = tooltipContainer.append('div').classed('tooltip',true)
                        .style('width', '140px')
                        .style('background', '#aaa')
                        .style('padding', '4px')
                        .style('position', 'absolute')
                        .style('top', `${event.offsetY}px`)
                        .style('left', `${event.offsetX}px`)
                    
                    cont
                        .append('div')
                        .text(`Total count: ${d.count}`)
                    cont
                        .append('div')
                        .text(`Prominent labels:`)

                    d.labels.forEach(l => {
                        cont.append('div')
                        .text(`${l.name}: ${l.count.toFixed(2)}`)
                    })

                }
            })
            .on('mouseleave', () => {
                tooltipContainer.selectAll('.tooltip').remove()
            })
            .attr("r", d => radiusScale && d.group === 'cluser-center' ? radiusScale(d.count) : nodeRadius)
            // .attr('filter', 'url(#id-1)')
            // .call(drag(simulation));

        if (G) node.attr("fill", ({index: i}) => color(G[i]));
        // if (T) node.append("title").text(({index: i}) => T[i]);
        
        // Handle invalidation.
        if (invalidation != null) invalidation.then(() => simulation.stop());

        function ticked() {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
        
            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        }
    }

    useEffect(() => {
        updateChart()
    }, [nodes, links])

    useEffect(() => {
        d3.select(linkContainerRef.current).style('opacity', isLinksVisible ? 1 : 0)
    }, [isLinksVisible])

    return <div className='viz-container'>
        {
            isLoading &&
            <div className='loadingContainer'>
                <SettingOutlined spin/>
            </div>
        }
        <div ref={tooltipContainerRef} className='tooltip-container' style={{position: 'relative'}}></div>
        <svg
            ref={svgRef}
            width={width}
            height={height}
            viewBox={[-width / 2, -height / 2, width, height]}
            style={{
                maxWidth: '100%',
                height: 'intrinsic',
                opacity: isLoading ? 0 : 1 
            }}>
            <g
                ref={linkContainerRef}
                className='link-container'
                stroke={linkStroke}
                strokeOpacity={linkStrokeOpacity}
                strokeWidth={linkStrokeWidth}
                strokeLinecap='round' />
            <g
                ref={voronoiContainerRef} />
            <g
                ref={nodeContainerRef}
                className='nodes-container'
                stroke={nodeStroke}
                strokeOpacity={nodeStrokeOpacity}
                strokeWidth={nodeStrokeWidth} />
        </svg>
    </div>
}

export default ForceGraph