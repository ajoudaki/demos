import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ActivationHeatmap = ({
  network,
  layerIndex,
  neuronIndex,
  resolution = 30,
  inputBounds = [-6, 6],
  width = 200,
  height = 200,
  colorScheme = 'redblue',
  showAxes = true,
  title = ''
}) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !network) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = showAxes ? { top: 20, right: 10, bottom: 30, left: 30 } : { top: 10, right: 10, bottom: 10, left: 10 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Generate grid of input points
    const [minBound, maxBound] = inputBounds;
    const step = (maxBound - minBound) / (resolution - 1);
    const gridData = [];
    const activations = [];

    // For each point in the grid, compute the activation
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const x1 = minBound + i * step;
        const x2 = minBound + j * step;
        
        // Run forward pass to get activations
        const { activations: layerActivations } = network.forward([x1, x2]);
        
        let activation;
        if (layerIndex === -1) {
          // Input layer - just show the input values
          activation = neuronIndex === 0 ? x1 : x2;
          // Normalize to [0, 1] for visualization
          activation = (activation - minBound) / (maxBound - minBound);
        } else if (layerIndex === layerActivations.length) {
          // Output layer
          const output = layerActivations[layerActivations.length - 1][0];
          activation = output;
        } else {
          // Hidden layer
          activation = layerActivations[layerIndex][neuronIndex];
        }
        
        gridData.push({ i, j, x1, x2, activation });
        activations.push(activation);
      }
    }

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([minBound, maxBound])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([minBound, maxBound])
      .range([innerHeight, 0]);

    // Color scale
    const minAct = d3.min(activations);
    const maxAct = d3.max(activations);
    
    let colorScale;
    if (colorScheme === 'redblue') {
      colorScale = d3.scaleLinear()
        .domain([minAct, (minAct + maxAct) / 2, maxAct])
        .range(['#e74c3c', '#f5f5f5', '#3498db']);
    } else if (colorScheme === 'viridis') {
      colorScale = d3.scaleSequential(d3.interpolateViridis)
        .domain([minAct, maxAct]);
    } else if (colorScheme === 'plasma') {
      colorScale = d3.scaleSequential(d3.interpolatePlasma)
        .domain([minAct, maxAct]);
    }

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Calculate cell dimensions
    const cellWidth = innerWidth / resolution;
    const cellHeight = innerHeight / resolution;

    // Draw heatmap cells
    g.selectAll('rect')
      .data(gridData)
      .enter()
      .append('rect')
      .attr('x', d => d.i * cellWidth)
      .attr('y', d => (resolution - 1 - d.j) * cellHeight)
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('fill', d => colorScale(d.activation))
      .attr('stroke', 'none');

    // Add axes if requested
    if (showAxes) {
      // X axis
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).ticks(5))
        .append('text')
        .attr('x', innerWidth / 2)
        .attr('y', 25)
        .attr('fill', 'black')
        .style('text-anchor', 'middle')
        .style('font-size', '10px')
        .text('x₁');

      // Y axis
      g.append('g')
        .call(d3.axisLeft(yScale).ticks(5))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerHeight / 2)
        .attr('y', -20)
        .attr('fill', 'black')
        .style('text-anchor', 'middle')
        .style('font-size', '10px')
        .text('x₂');
    }

    // Add title if provided
    if (title) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text(title);
    }

    // Add tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'activation-tooltip')
      .style('position', 'absolute')
      .style('padding', '5px')
      .style('background', 'rgba(0,0,0,0.8)')
      .style('color', 'white')
      .style('border-radius', '3px')
      .style('font-size', '11px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    g.selectAll('rect')
      .on('mouseover', function(event, d) {
        tooltip
          .style('opacity', 1)
          .html(`x₁: ${d.x1.toFixed(2)}<br>x₂: ${d.x2.toFixed(2)}<br>Act: ${d.activation.toFixed(3)}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        tooltip.style('opacity', 0);
      });

    // Cleanup
    return () => {
      d3.selectAll('.activation-tooltip').remove();
    };

  }, [network, layerIndex, neuronIndex, resolution, inputBounds, width, height, colorScheme, showAxes, title]);

  return (
    <svg 
      ref={svgRef} 
      width={width} 
      height={height}
      style={{ border: '1px solid #ddd', borderRadius: '4px' }}
    />
  );
};

export default ActivationHeatmap;