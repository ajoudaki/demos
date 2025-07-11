import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const NetworkVisualization = ({ 
  network,
  width = 800,
  height = 400,
  showWeights = false,
  highlightPath = null
}) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !network) return;

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Extract network architecture
    const layers = [];
    
    // Input layer
    layers.push({
      neurons: network.inputSize,
      name: 'Input',
      activation: null
    });

    // Hidden layers
    for (let i = 0; i < network.hiddenLayers; i++) {
      layers.push({
        neurons: network.neuronsPerLayer,
        name: `Hidden ${i + 1}`,
        activation: network.activationType
      });
    }

    // Output layer
    layers.push({
      neurons: 1,
      name: 'Output',
      activation: 'sigmoid'
    });

    // Calculate positions
    const layerSpacing = width / (layers.length + 1);
    const nodes = [];
    const links = [];

    layers.forEach((layer, layerIndex) => {
      const layerX = layerSpacing * (layerIndex + 1);
      const neuronSpacing = height / (layer.neurons + 1);

      for (let neuronIndex = 0; neuronIndex < layer.neurons; neuronIndex++) {
        const neuronY = neuronSpacing * (neuronIndex + 1);
        nodes.push({
          id: `${layerIndex}-${neuronIndex}`,
          layerIndex,
          neuronIndex,
          x: layerX,
          y: neuronY,
          layer: layer.name,
          activation: layer.activation
        });

        // Create links to next layer
        if (layerIndex < layers.length - 1) {
          const nextLayer = layers[layerIndex + 1];
          for (let nextNeuronIndex = 0; nextNeuronIndex < nextLayer.neurons; nextNeuronIndex++) {
            const weight = network.weights[layerIndex]?.[neuronIndex]?.[nextNeuronIndex] || 0;
            links.push({
              source: `${layerIndex}-${neuronIndex}`,
              target: `${layerIndex + 1}-${nextNeuronIndex}`,
              weight,
              layerIndex
            });
          }
        }
      }
    });

    // Create main group
    const g = svg.append('g')
      .attr('transform', 'translate(0, 20)');

    // Draw links
    const linkGroup = g.append('g').attr('class', 'links');
    
    const colorScale = d3.scaleLinear()
      .domain([-2, 0, 2])
      .range(['#e74c3c', '#cccccc', '#3498db'])
      .clamp(true);

    const widthScale = d3.scaleLinear()
      .domain([0, 2])
      .range([1, 5])
      .clamp(true);

    linkGroup.selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('x1', d => nodes.find(n => n.id === d.source).x)
      .attr('y1', d => nodes.find(n => n.id === d.source).y)
      .attr('x2', d => nodes.find(n => n.id === d.target).x)
      .attr('y2', d => nodes.find(n => n.id === d.target).y)
      .attr('stroke', d => colorScale(d.weight))
      .attr('stroke-width', d => widthScale(Math.abs(d.weight)))
      .attr('opacity', 0.6);

    // Draw nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');
    
    const nodeElements = nodeGroup.selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 15)
      .attr('fill', '#bde0ff')
      .attr('stroke', '#333')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        // Highlight connected links
        linkGroup.selectAll('line')
          .style('opacity', link => 
            (link.source === d.id || link.target === d.id) ? 1 : 0.2
          )
          .style('stroke-width', link =>
            (link.source === d.id || link.target === d.id) ? widthScale(Math.abs(link.weight)) * 1.5 : widthScale(Math.abs(link.weight))
          );
        
        // Highlight the node
        d3.select(this)
          .attr('stroke-width', 3)
          .attr('fill', '#98d3ff');
      })
      .on('mouseout', function() {
        // Reset links
        linkGroup.selectAll('line')
          .style('opacity', 0.6)
          .style('stroke-width', d => widthScale(Math.abs(d.weight)));
        
        // Reset node
        d3.select(this)
          .attr('stroke-width', 2)
          .attr('fill', '#bde0ff');
      });

    // Add labels for neurons
    const labelGroup = g.append('g').attr('class', 'labels');
    
    // Input layer labels
    const inputNodes = nodes.filter(n => n.layerIndex === 0);
    inputNodes.forEach((node, i) => {
      labelGroup.append('text')
        .attr('x', node.x - 30)
        .attr('y', node.y + 5)
        .attr('text-anchor', 'end')
        .style('font-size', '12px')
        .text(i === 0 ? 'X₁' : 'X₂');
    });

    // Layer labels
    layers.forEach((layer, i) => {
      const layerX = layerSpacing * (i + 1);
      labelGroup.append('text')
        .attr('x', layerX)
        .attr('y', height - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(layer.name);
    });

    // Show weights on hover
    if (showWeights) {
      const tooltip = d3.select('body').append('div')
        .attr('class', 'network-tooltip')
        .style('position', 'absolute')
        .style('padding', '5px')
        .style('background', 'rgba(0,0,0,0.8)')
        .style('color', 'white')
        .style('border-radius', '3px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('opacity', 0);

      linkGroup.selectAll('line')
        .on('mouseover', function(event, d) {
          tooltip
            .style('opacity', 1)
            .html(`Weight: ${d.weight.toFixed(3)}`)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', function() {
          tooltip.style('opacity', 0);
        });

      // Clean up tooltip on unmount
      return () => {
        d3.selectAll('.network-tooltip').remove();
      };
    }

  }, [network, width, height, showWeights, highlightPath]);

  return (
    <svg 
      ref={svgRef} 
      width={width} 
      height={height}
      style={{ border: '1px solid #ddd', borderRadius: '4px' }}
    />
  );
};

export default NetworkVisualization;