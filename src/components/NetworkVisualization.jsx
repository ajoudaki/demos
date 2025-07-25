import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const NetworkVisualization = ({ 
  network,
  width = 800,
  height = 400,
  showWeights = false,
  highlightPath = null,
  showActivationHeatmaps = false,
  heatmapResolution = 10,
  inputBounds = [-6, 6],
  dynamicSize = false,
  onNodeClick = null
}) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Extract network architecture for labels
  const layers = [];
  if (network) {
    // Input layer
    layers.push({
      neurons: network.inputSize,
      name: 'Input',
      activation: null
    });

    // Hidden layers with variable sizes
    const hiddenSizes = network.hiddenLayerSizes || Array(network.hiddenLayers).fill(network.neuronsPerLayer);
    for (let i = 0; i < network.hiddenLayers; i++) {
      layers.push({
        neurons: hiddenSizes[i],
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
  }

  useEffect(() => {
    if (!svgRef.current || !network) return;

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    // Calculate dynamic dimensions if needed
    let actualWidth = width;
    let actualHeight = height;
    
    if (dynamicSize && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // Account for the labels below
      actualWidth = rect.width;
      actualHeight = rect.height - 40; // Leave space for labels
      
      // Set SVG dimensions
      svg.attr('width', actualWidth).attr('height', actualHeight);
    }

    // Pre-compute all activations for the grid if showing heatmaps
    let gridActivations = null;
    if (showActivationHeatmaps && network.inputSize === 2) {
      gridActivations = new Map();
      const step = (inputBounds[1] - inputBounds[0]) / heatmapResolution;
      
      // Do N² forward passes total, collecting all neuron activations
      for (let i = 0; i < heatmapResolution; i++) {
        for (let j = 0; j < heatmapResolution; j++) {
          const x1 = inputBounds[0] + i * step;
          const x2 = inputBounds[0] + j * step;
          const result = network.forward([x1, x2]);
          
          // Store activations for each layer and neuron
          result.activations.forEach((layerActivations, layerIndex) => {
            if (layerIndex === 0) return; // Skip input layer
            
            layerActivations.forEach((activation, neuronIndex) => {
              const key = `${layerIndex}-${neuronIndex}`;
              if (!gridActivations.has(key)) {
                gridActivations.set(key, []);
              }
              gridActivations.get(key).push({
                i, j, value: activation
              });
            });
          });
        }
      }
    }


    // Calculate positions and dynamic node size
    const padding = 60; // Padding from edges
    const layerSpacing = actualWidth / (layers.length + 1);
    const maxNeuronsInLayer = Math.max(...layers.map(l => l.neurons));
    
    // Calculate node size based on available space
    // Consider both horizontal spacing between layers and vertical spacing between neurons
    const minLayerSpacing = layerSpacing * 0.8; // Leave 20% gap between layers
    const minVerticalSpacing = (actualHeight - 2 * padding) / maxNeuronsInLayer;
    
    // Node size should be smaller than both spacings to prevent overlap
    const nodeSize = Math.min(
      60, // Maximum node size
      minLayerSpacing * 0.4, // 40% of horizontal spacing
      minVerticalSpacing * 0.8 // 80% of vertical spacing
    );
    const nodes = [];
    const links = [];

    layers.forEach((layer, layerIndex) => {
      const layerX = layerSpacing * (layerIndex + 1);
      
      // Calculate vertical positions to center neurons in the layer
      const layerHeight = layer.neurons * nodeSize + (layer.neurons - 1) * (nodeSize * 0.5); // Include gaps
      const startY = (actualHeight - layerHeight) / 2;

      for (let neuronIndex = 0; neuronIndex < layer.neurons; neuronIndex++) {
        const neuronY = startY + neuronIndex * (nodeSize * 1.5) + nodeSize / 2;
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
      .range(['#e74c3c', '#f5f5f5', '#3498db'])
      .clamp(true);

    const widthScale = d3.scaleLinear()
      .domain([0, 2])
      .range([1, 6])
      .clamp(true);

    // Function to create curved path
    const getCurvedPath = (d) => {
      const source = nodes.find(n => n.id === d.source);
      const target = nodes.find(n => n.id === d.target);
      const sx = source.x;
      const sy = source.y;
      const tx = target.x;
      const ty = target.y;
      const midX = sx + (tx - sx) * 0.6;
      return `M${sx},${sy} C${midX},${sy} ${midX},${ty} ${tx},${ty}`;
    };

    // Draw links after we know if we're using square nodes
    const drawLinks = () => {
      const linkSelection = linkGroup.selectAll('path')
        .data(links);
        
      linkSelection.enter()
        .append('path')
        .attr('class', 'link')
        .attr('id', d => `link-${d.source}-${d.target}`)
        .attr('fill', 'none')
        .attr('d', getCurvedPath)
        .attr('stroke', d => colorScale(d.weight))
        .attr('stroke-width', d => widthScale(Math.abs(d.weight)))
        .attr('stroke-opacity', 0.6)
        .style('transition', 'opacity 0.3s, stroke-width 0.3s, stroke-opacity 0.3s');
    };

    // Draw nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');
    
    if (showActivationHeatmaps && network.inputSize === 2) {
      // Use dynamic node size
      const borderRadius = nodeSize * 0.16; // Proportional rounded corners
      

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
          // Use pre-computed activations
          const key = `${node.layerIndex}-${node.neuronIndex}`;
          const nodeActivations = gridActivations.get(key) || [];
          const cellSize = nodeSize / heatmapResolution;
          
          // Add small overlap to prevent white lines
          const overlap = 0.5;
          
          // Convert pre-computed activations to heatmap data
          const heatmapData = nodeActivations.map(item => ({
            x: item.i * cellSize,
            y: item.j * cellSize,
            value: item.value || 0
          }));

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
        const rect = nodeGroup.append('rect')
          .attr('x', node.x - nodeSize/2)
          .attr('y', node.y - nodeSize/2)
          .attr('width', nodeSize)
          .attr('height', nodeSize)
          .attr('rx', borderRadius)
          .attr('ry', borderRadius)
          .attr('fill', 'none')
          .attr('stroke', '#000')
          .attr('stroke-width', 1.5)
          .style('cursor', 'pointer')
          .style('transition', 'opacity 0.3s');
          
        // Add invisible larger rect for better click detection
        nodeGroup.append('rect')
          .attr('x', node.x - nodeSize/2 - 5)
          .attr('y', node.y - nodeSize/2 - 5)
          .attr('width', nodeSize + 10)
          .attr('height', nodeSize + 10)
          .attr('fill', 'transparent')
          .style('cursor', 'pointer')
          .on('click', function(event) {
            event.stopPropagation();
            if (onNodeClick) {
              onNodeClick({
                layerIndex: node.layerIndex,
                neuronIndex: node.neuronIndex,
                x: node.x,
                y: node.y
              });
            }
          })
          .on('mouseenter', function() {
            // Dim all nodes and links first
            nodeGroup.selectAll('.node, rect').style('opacity', 0.15);
            linkGroup.selectAll('path')
              .style('opacity', 0.15)
              .attr('stroke-opacity', 0.15);
            
            // Highlight the node with full opacity
            rect.attr('stroke-width', 3).attr('stroke', '#ff9900').style('opacity', 1);
            d3.select(this.parentNode).selectAll('*').style('opacity', 1); // Ensure the heatmap is also visible
            
            // Find and highlight connected links and nodes
            const connectedNodes = new Set();
            
            // Highlight incoming links with full opacity
            linkGroup.selectAll('path')
              .filter(d => d.target === node.id)
              .style('opacity', 1)
              .attr('stroke-opacity', 1)
              .attr('stroke-width', d => widthScale(Math.abs(d.weight)) * 2)
              .each(d => connectedNodes.add(d.source));
            
            // Highlight outgoing links with full opacity
            linkGroup.selectAll('path')
              .filter(d => d.source === node.id)
              .style('opacity', 1)
              .attr('stroke-opacity', 1)
              .attr('stroke-width', d => widthScale(Math.abs(d.weight)) * 2)
              .each(d => connectedNodes.add(d.target));
            
            // Highlight connected nodes
            connectedNodes.forEach(nodeId => {
              const connectedNode = nodes.find(n => n.id === nodeId);
              if (connectedNode) {
                nodeGroup.selectAll('rect')
                  .filter(function() {
                    const nodeData = d3.select(this.parentNode).datum();
                    return nodeData && nodeData.id === nodeId;
                  })
                  .style('opacity', 1);
                // Also make the heatmap visible for connected nodes
                nodeGroup.selectAll('g')
                  .filter(function() {
                    const nodeData = d3.select(this).datum();
                    return nodeData && nodeData.id === nodeId;
                  })
                  .selectAll('*')
                  .style('opacity', 1);
              }
            });
          })
          .on('mouseleave', function() {
            // Reset all styling
            rect.attr('stroke-width', 1.5).attr('stroke', '#000');
            nodeGroup.selectAll('.node, rect').style('opacity', 1);
            linkGroup.selectAll('path')
              .style('opacity', 1)
              .attr('stroke-opacity', 0.6)
              .attr('stroke-width', d => widthScale(Math.abs(d.weight)));
          });
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
          // Dim all nodes and links
          nodeGroup.selectAll('circle').style('opacity', 0.15);
          linkGroup.selectAll('path')
            .style('opacity', 0.15)
            .attr('stroke-opacity', 0.15);
          
          // Highlight this node with full opacity
          d3.select(this)
            .style('opacity', 1)
            .attr('stroke-width', 3)
            .attr('stroke', '#ff9900');
          
          // Find and highlight connected links and nodes
          const connectedNodes = new Set();
          
          // Highlight connected links with full opacity
          linkGroup.selectAll('path')
            .filter(link => link.source === d.id || link.target === d.id)
            .style('opacity', 1)
            .attr('stroke-opacity', 1)
            .attr('stroke-width', link => widthScale(Math.abs(link.weight)) * 2)
            .each(link => {
              if (link.source === d.id) connectedNodes.add(link.target);
              if (link.target === d.id) connectedNodes.add(link.source);
            });
          
          // Highlight connected nodes
          nodeGroup.selectAll('circle')
            .filter(node => connectedNodes.has(node.id))
            .style('opacity', 1);
        })
        .on('mouseout', function() {
          // Reset all styling
          nodeGroup.selectAll('circle')
            .style('opacity', 1)
            .attr('stroke-width', 2)
            .attr('stroke', '#333');
            
          linkGroup.selectAll('path')
            .style('opacity', 1)
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', d => widthScale(Math.abs(d.weight)));
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

  }, [network, width, height, showWeights, highlightPath, showActivationHeatmaps, heatmapResolution, inputBounds, dynamicSize, onNodeClick, dimensions]);

  // Add resize observer for dynamic sizing
  useEffect(() => {
    if (!dynamicSize || !containerRef.current) return;

    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height - 40 });
      }
    };

    // Initial size
    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [dynamicSize]);

  if (dynamicSize) {
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <svg 
          ref={svgRef} 
          style={{ border: '1px solid #ddd', borderRadius: '4px', flex: 1 }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px 0', fontSize: '12px', fontWeight: 'bold' }}>
          {layers.map((layer, i) => (
            <div key={i}>{layer.name}</div>
          ))}
        </div>
      </div>
    );
  }

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