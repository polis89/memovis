import * as d3 from 'd3'

const updateImages = (svg) => {
    console.log('size()', svg.selectAll('.viz-node').size());
    
    svg.selectAll('.viz-node')
        .attr('filter', d => d.group === 'node' ? `url(#id-${d.id})` : null)
}

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/disjoint-force-directed-graph
function ForceGraph({
    nodes, // an iterable of node objects (typically [{id}, …])
    links // an iterable of link objects (typically [{source, target}, …])
  }, {
    nodeId = d => d.id, // given d in nodes, returns a unique identifier (string)
    nodeGroup, // given d in nodes, returns an (ordinal) value for color
    nodeGroups, // an array of ordinal values representing the node groups
    nodeTitle, // given d in nodes, a title string
    nodeFill = "currentColor", // node stroke fill (if not using a group color encoding)
    nodeStroke = "#fff", // node stroke color
    nodeStrokeWidth = 1.5, // node stroke width, in pixels
    nodeStrokeOpacity = 1, // node stroke opacity
    nodeRadius = 7, // node radius, in pixels
    radiusScale,
    nodeStrength,
    linkSource = ({source}) => source, // given d in links, returns a node identifier string
    linkTarget = ({target}) => target, // given d in links, returns a node identifier string
    linkStroke = "#999", // link stroke color
    linkStrokeOpacity = 0.6, // link stroke opacity
    linkStrokeWidth = 1.5, // given d in links, returns a stroke width in pixels
    linkStrokeLinecap = "round", // link stroke linecap
    linkStrength,
    colors = d3.schemeTableau10, // an array of color strings, for the node groups
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    invalidation // when this promise resolves, stop the simulation
  } = {}) {
    // Compute values.
    const N = d3.map(nodes, nodeId).map(intern);
    const LS = d3.map(links, linkSource).map(intern);
    const LT = d3.map(links, linkTarget).map(intern);
    if (nodeTitle === undefined) nodeTitle = (_, i) => N[i];
    const T = nodeTitle == null ? null : d3.map(nodes, nodeTitle);
    const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern);
    const W = typeof linkStrokeWidth !== "function" ? null : d3.map(links, linkStrokeWidth);
  
    // Replace the input nodes and links with mutable objects for the simulation.
    nodes = d3.map(nodes, (n, i) => ({id: N[i], ...n}));
    links = d3.map(links, (_, i) => ({source: LS[i], target: LT[i]}));
  
    // Compute default domains.
    if (G && nodeGroups === undefined) nodeGroups = d3.sort(G);
  
    // Construct the scales.
    const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors);
  
    // Construct the forces.
    const forceNode = d3.forceManyBody();
    const forceLink = d3.forceLink(links).id(({index: i}) => N[i]).distance(d => {
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

    const container = d3.create('div').classed('viz-container', true)

    const tooltipContainer = container.append('div').classed('tooltip-container', true).style('position', 'relative')

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");
  
    const simulation = d3.forceSimulation(nodes)
        .alphaMin(0.15)
        .force("link", forceLink)
        .force("charge", forceNode)
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .on("tick", ticked)
        .on("end", () => updateImages(svg));
  
    const link = svg.append("g")
        .attr("stroke", linkStroke)
        .attr("stroke-opacity", linkStrokeOpacity)
        .attr("stroke-width", typeof linkStrokeWidth !== "function" ? linkStrokeWidth : null)
        .attr("stroke-linecap", linkStrokeLinecap)
      .selectAll("line")
      .data(links)
      .join("line");
  
    if (W) link.attr("stroke-width", ({index: i}) => W[i]);

    // Add svg filter defs
    svg.selectAll("filter")
        .data(nodes.filter(d => d.group === 'node'))
        .enter()
        .append('filter')
        .attr('id', d => `id-${d.id}`)
        .attr('x','0%')
        .attr('y','0%')
        .attr('width', '100%')
        .attr('height', '100%')
        .append('feImage')
        .attr('xlink:href', d => d.filename)

 
    const node = svg.append("g")
        // .attr("fill", nodeFill)
        .attr("stroke", nodeStroke)
        .attr("stroke-opacity", nodeStrokeOpacity)
        .attr("stroke-width", nodeStrokeWidth)
        .selectAll("circle")
        .data(nodes)
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
          } else {
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
  
    function intern(value) {
      return value !== null && typeof value === "object" ? value.valueOf() : value;
    }
  
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
  
    function drag(simulation) {    
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
  
    return container.node();
  }
  
export default ForceGraph
