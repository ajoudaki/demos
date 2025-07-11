import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { generateData } from '../utils/dataGeneration';

const TestDataGeneration = () => {
  const [distributionType, setDistributionType] = useState('circle');
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Generate data
    const { data, labels } = generateData(200, distributionType);

    // Set up dimensions
    const width = 400;
    const height = 400;
    const margin = 40;

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([-6, 6])
      .range([margin, width - margin]);

    const yScale = d3.scaleLinear()
      .domain([-6, 6])
      .range([height - margin, margin]);

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin})`)
      .call(d3.axisBottom(xScale));

    svg.append('g')
      .attr('transform', `translate(${margin},0)`)
      .call(d3.axisLeft(yScale));

    // Add axis labels
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height - 5)
      .style('font-size', '12px')
      .text('X₁');

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(12,${height / 2}) rotate(-90)`)
      .style('font-size', '12px')
      .text('X₂');

    // Plot data points
    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d, i) => xScale(d[0]))
      .attr('cy', (d, i) => yScale(d[1]))
      .attr('r', 3)
      .attr('fill', (d, i) => labels[i] === 1 ? '#3498db' : '#e74c3c')
      .attr('stroke', 'black')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.8);

  }, [distributionType]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Data Generation Test</h2>
      <p>Visual test of different data distributions for binary classification.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="distribution" style={{ marginRight: '10px' }}>
          Distribution Type:
        </label>
        <select
          id="distribution"
          value={distributionType}
          onChange={(e) => setDistributionType(e.target.value)}
          style={{
            padding: '5px',
            fontSize: '14px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        >
          <option value="circle">Circle</option>
          <option value="ring">Ring</option>
          <option value="xor">XOR</option>
          <option value="spiral">Spiral</option>
          <option value="gaussian">Gaussian</option>
        </select>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: '20px',
        borderRadius: '8px'
      }}>
        <svg ref={svgRef}></svg>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>Legend:</p>
        <ul>
          <li><span style={{ color: '#e74c3c' }}>●</span> Class 0 (Red)</li>
          <li><span style={{ color: '#3498db' }}>●</span> Class 1 (Blue)</li>
        </ul>
        <p>Each distribution creates a different classification challenge:</p>
        <ul>
          <li><strong>Circle:</strong> Points inside a ring (class 1) vs outside (class 0)</li>
          <li><strong>Ring:</strong> Center cluster (class 0) vs outer ring (class 1)</li>
          <li><strong>XOR:</strong> Opposite quadrants have same class</li>
          <li><strong>Spiral:</strong> Two interleaving spirals</li>
          <li><strong>Gaussian:</strong> Two gaussian clusters</li>
        </ul>
      </div>
    </div>
  );
};

export default TestDataGeneration;