import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const NetworkVisualization = ({ 
  network,
  width = 800,
  height = 400,
  showWeights = false,
  highlightPath = null,
  showActivationHeatmaps = false,
  heatmapResolution = 10,
  inputBounds = [-6, 6]
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

    // Draw links first so they appear behind nodes
    const linkGroup = g.append('g').attr('class', 'links');
    
    const colorScale = d3.scaleLinear()
      .domain([-2, 0, 2])
      .range(['#e74c3c', '#cccccc', '#3498db'])
      .clamp(true);

    const widthScale = d3.scaleLinear()
      .domain([0, 2])
      .range([1, 5])
      .clamp(true);

    // Draw links after we know if we're using square nodes
    const drawLinks = () => {
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
    };

    // Draw nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');
    
    if (showActivationHeatmaps && network.inputSize === 2) {
      // Calculate activation heatmaps for each neuron
      const nodeSize = 50; // Size for square nodes
      const borderRadius = 8; // Rounded corners
      
      // Helper function to compute activation for a neuron
      const computeActivation = (layerIndex, neuronIndex, input) => {
        const result = network.forward(input);
        if (layerIndex === 0) {
          // Input layer - just return the input value
          return input[neuronIndex];
        } else {
          // Get activation from the appropriate layer
          // result.activations[0] is the input
          // result.activations[1] is first hidden layer
          // result.activations[2] is second hidden layer
          // result.activations[3] is output layer
          const layerActivations = result.activations[layerIndex];
          if (!layerActivations || neuronIndex >= layerActivations.length) {
            return 0;
          }
          return layerActivations[neuronIndex];
        }
      };

      // Create color scale for heatmaps
      // Adjust domain based on activation function
      let colorDomain = [-1, 1];
      if (network.activationType === 'relu' || network.activationType === 'leakyRelu') {
        colorDomain = [-0.5, 2]; // ReLU can have larger positive values
      }
      // Use a diverging color scale that shows zero as white/neutral
      const heatmapColorScale = d3.scaleDiverging()
        .domain([colorDomain[0], 0, colorDomain[1]])
        .interpolator(d3.interpolateRdBu)
        .clamp(true); // Clamp values outside domain

      // For each node, create a heatmap
      nodes.forEach(node => {
        // Create a group for this node's heatmap
        const heatmapGroup = nodeGroup.append('g')
          .attr('transform', `translate(${node.x - nodeSize/2}, ${node.y - nodeSize/2})`);

        if (node.layerIndex === 0) {
          // Input layer nodes - show gradient
          const gradientId = `gradient-${node.id}`;
          const defs = svg.append('defs');
          const gradient = defs.append('linearGradient')
            .attr('id', gradientId);

          if (node.neuronIndex === 0) {
            // X1 - horizontal gradient
            gradient.attr('x1', '0%').attr('y1', '0%')
                   .attr('x2', '100%').attr('y2', '0%');
          } else {
            // X2 - vertical gradient
            gradient.attr('x1', '0%').attr('y1', '100%')
                   .attr('x2', '0%').attr('y2', '0%');
          }

          // Add gradient stops
          const numStops = 10;
          for (let i = 0; i <= numStops; i++) {
            const t = i / numStops;
            const value = inputBounds[0] + t * (inputBounds[1] - inputBounds[0]);
            const normalizedValue = value / Math.max(Math.abs(inputBounds[0]), Math.abs(inputBounds[1]));
            gradient.append('stop')
              .attr('offset', `${t * 100}%`)
              .attr('stop-color', heatmapColorScale(normalizedValue));
          }

          // Draw the gradient rectangle
          heatmapGroup.append('rect')
            .attr('width', nodeSize)
            .attr('height', nodeSize)
            .attr('rx', borderRadius)
            .attr('ry', borderRadius)
            .attr('fill', `url(#${gradientId})`);
        } else {
          // Hidden and output layer nodes - show activation heatmap
          // Generate heatmap data
          const heatmapData = [];
          const step = (inputBounds[1] - inputBounds[0]) / heatmapResolution;
          const cellSize = nodeSize / heatmapResolution;
          
          // Add small overlap to prevent white lines
          const overlap = 0.5;
          
          for (let i = 0; i < heatmapResolution; i++) {
            for (let j = 0; j < heatmapResolution; j++) {
              const x1 = inputBounds[0] + i * step;
              const x2 = inputBounds[0] + j * step;
              const activation = computeActivation(node.layerIndex, node.neuronIndex, [x1, x2]);
              
              heatmapData.push({
                x: i * cellSize,
                y: j * cellSize,
                value: activation || 0
              });
            }
          }

          // Draw heatmap cells with overlap
          heatmapGroup.selectAll('rect')
            .data(heatmapData)
            .enter()
            .append('rect')
            .attr('x', d => d.x - overlap/2)
            .attr('y', d => d.y - overlap/2)
            .attr('width', cellSize + overlap)
            .attr('height', cellSize + overlap)
            .attr('fill', d => heatmapColorScale(d.value))
            .attr('stroke', 'none');

          // Add rounded corner mask
          const maskId = `mask-${node.id}`;
          const defs = svg.append('defs');
          const mask = defs.append('mask')
            .attr('id', maskId);
          
          mask.append('rect')
            .attr('width', nodeSize)
            .attr('height', nodeSize)
            .attr('rx', borderRadius)
            .attr('ry', borderRadius)
            .attr('fill', 'white');

          heatmapGroup.attr('mask', `url(#${maskId})`);
        }

        // Add border
        nodeGroup.append('rect')
          .attr('x', node.x - nodeSize/2)
          .attr('y', node.y - nodeSize/2)
          .attr('width', nodeSize)
          .attr('height', nodeSize)
          .attr('rx', borderRadius)
          .attr('ry', borderRadius)
          .attr('fill', 'none')
          .attr('stroke', '#333')
          .attr('stroke-width', 2);
      });
    } else {
      // Regular node visualization
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
    }

    // Draw links after nodes
    drawLinks();

    // Add labels for neurons
    const labelGroup = g.append('g').attr('class', 'labels');
    
    // Input layer labels
    const inputNodes = nodes.filter(n => n.layerIndex === 0);
    const labelOffset = showActivationHeatmaps ? 35 : 30;
    inputNodes.forEach((node, i) => {
      labelGroup.append('text')
        .attr('x', node.x - labelOffset)
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

  }, [network, width, height, showWeights, highlightPath, showActivationHeatmaps, heatmapResolution, inputBounds]);

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