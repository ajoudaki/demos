import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const HeatmapVisualization = ({
  data,
  width = 400,
  height = 300,
  colorScheme = 'viridis',
  showValues = false,
  title = '',
  xLabels = null,
  yLabels = null
}) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: title ? 40 : 20, right: 20, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const numRows = data.length;
    const numCols = data[0].length;

    // Create scales
    const xScale = d3.scaleBand()
      .domain(d3.range(numCols))
      .range([0, innerWidth])
      .padding(0.05);

    const yScale = d3.scaleBand()
      .domain(d3.range(numRows))
      .range([0, innerHeight])
      .padding(0.05);

    // Flatten data for color scale
    const flatData = data.flat();
    const minValue = d3.min(flatData);
    const maxValue = d3.max(flatData);

    // Color scale
    let colorScale;
    switch (colorScheme) {
      case 'viridis':
        colorScale = d3.scaleSequential(d3.interpolateViridis);
        break;
      case 'blues':
        colorScale = d3.scaleSequential(d3.interpolateBlues);
        break;
      case 'redblue':
        colorScale = d3.scaleLinear()
          .domain([minValue, 0, maxValue])
          .range(['#e74c3c', '#ffffff', '#3498db'])
          .clamp(true);
        break;
      default:
        colorScale = d3.scaleSequential(d3.interpolateViridis);
    }

    if (colorScheme !== 'redblue') {
      colorScale.domain([minValue, maxValue]);
    }

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add title
    if (title) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(title);
    }

    // Create cells
    const cells = g.selectAll('rect')
      .data(data.flatMap((row, i) => 
        row.map((value, j) => ({ row: i, col: j, value }))
      ))
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.col))
      .attr('y', d => yScale(d.row))
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.value))
      .attr('stroke', '#ccc')
      .attr('stroke-width', 0.5);

    // Add values if requested
    if (showValues && numRows <= 10 && numCols <= 10) {
      g.selectAll('text.value')
        .data(data.flatMap((row, i) => 
          row.map((value, j) => ({ row: i, col: j, value }))
        ))
        .enter()
        .append('text')
        .attr('class', 'value')
        .attr('x', d => xScale(d.col) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.row) + yScale.bandwidth() / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '10px')
        .style('fill', d => {
          const val = d.value;
          const mid = (minValue + maxValue) / 2;
          return Math.abs(val - mid) > (maxValue - minValue) / 3 ? 'white' : 'black';
        })
        .text(d => d.value.toFixed(2));
    }

    // Add axes labels
    if (xLabels && xLabels.length === numCols) {
      g.selectAll('text.x-label')
        .data(xLabels)
        .enter()
        .append('text')
        .attr('class', 'x-label')
        .attr('x', (d, i) => xScale(i) + xScale.bandwidth() / 2)
        .attr('y', innerHeight + 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text(d => d);
    }

    if (yLabels && yLabels.length === numRows) {
      g.selectAll('text.y-label')
        .data(yLabels)
        .enter()
        .append('text')
        .attr('class', 'y-label')
        .attr('x', -10)
        .attr('y', (d, i) => yScale(i) + yScale.bandwidth() / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '12px')
        .text(d => d);
    }

    // Add tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'heatmap-tooltip')
      .style('position', 'absolute')
      .style('padding', '5px')
      .style('background', 'rgba(0,0,0,0.8)')
      .style('color', 'white')
      .style('border-radius', '3px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    cells
      .on('mouseover', function(event, d) {
        tooltip
          .style('opacity', 1)
          .html(`Row: ${d.row}<br>Col: ${d.col}<br>Value: ${d.value.toFixed(3)}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        tooltip.style('opacity', 0);
      });

    // Cleanup
    return () => {
      d3.selectAll('.heatmap-tooltip').remove();
    };

  }, [data, width, height, colorScheme, showValues, title, xLabels, yLabels]);

  return (
    <svg 
      ref={svgRef} 
      width={width} 
      height={height}
      style={{ border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fafafa' }}
    />
  );
};

export default HeatmapVisualization;