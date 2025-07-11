import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const LossChart = ({
  trainLoss = [],
  testLoss = [],
  width = 400,
  height = 200,
  maxPoints = 100,
  yDomain = null
}) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 60, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Prepare data
    const trainData = trainLoss.slice(-maxPoints).map((loss, i) => ({ x: i, y: loss, type: 'train' }));
    const testData = testLoss.slice(-maxPoints).map((loss, i) => ({ x: i, y: loss, type: 'test' }));

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, Math.max(trainData.length - 1, 1)])
      .range([0, innerWidth]);

    const yExtent = yDomain || [
      0,
      Math.max(
        d3.max(trainData, d => d.y) || 1,
        d3.max(testData, d => d.y) || 1
      ) * 1.1
    ];

    const yScale = d3.scaleLinear()
      .domain(yExtent)
      .range([innerHeight, 0]);

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 35)
      .attr('fill', 'black')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Epoch');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -35)
      .attr('fill', 'black')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Loss');

    // Line generators
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);

    // Draw train loss
    if (trainData.length > 0) {
      g.append('path')
        .datum(trainData)
        .attr('fill', 'none')
        .attr('stroke', '#3498db')
        .attr('stroke-width', 2)
        .attr('d', line);

      // Add last point marker
      const lastTrain = trainData[trainData.length - 1];
      if (lastTrain) {
        g.append('circle')
          .attr('cx', xScale(lastTrain.x))
          .attr('cy', yScale(lastTrain.y))
          .attr('r', 3)
          .attr('fill', '#3498db');
      }
    }

    // Draw test loss
    if (testData.length > 0) {
      g.append('path')
        .datum(testData)
        .attr('fill', 'none')
        .attr('stroke', '#e74c3c')
        .attr('stroke-width', 2)
        .attr('d', line);

      // Add last point marker
      const lastTest = testData[testData.length - 1];
      if (lastTest) {
        g.append('circle')
          .attr('cx', xScale(lastTest.x))
          .attr('cy', yScale(lastTest.y))
          .attr('r', 3)
          .attr('fill', '#e74c3c');
      }
    }

    // Legend
    const legend = g.append('g')
      .attr('transform', `translate(${innerWidth - 80}, 10)`);

    // Train legend
    legend.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 20)
      .attr('y2', 0)
      .attr('stroke', '#3498db')
      .attr('stroke-width', 2);

    legend.append('text')
      .attr('x', 25)
      .attr('y', 4)
      .style('font-size', '12px')
      .text('Train');

    // Test legend
    legend.append('line')
      .attr('x1', 0)
      .attr('y1', 20)
      .attr('x2', 20)
      .attr('y2', 20)
      .attr('stroke', '#e74c3c')
      .attr('stroke-width', 2);

    legend.append('text')
      .attr('x', 25)
      .attr('y', 24)
      .style('font-size', '12px')
      .text('Test');

    // Add current values
    if (trainData.length > 0 || testData.length > 0) {
      const currentValues = g.append('g')
        .attr('transform', `translate(10, ${innerHeight - 10})`);

      if (trainData.length > 0) {
        const lastTrainValue = trainData[trainData.length - 1].y;
        currentValues.append('text')
          .style('font-size', '11px')
          .style('fill', '#3498db')
          .text(`Train: ${lastTrainValue.toFixed(4)}`);
      }

      if (testData.length > 0) {
        const lastTestValue = testData[testData.length - 1].y;
        currentValues.append('text')
          .attr('y', 12)
          .style('font-size', '11px')
          .style('fill', '#e74c3c')
          .text(`Test: ${lastTestValue.toFixed(4)}`);
      }
    }

  }, [trainLoss, testLoss, width, height, maxPoints, yDomain]);

  return (
    <svg 
      ref={svgRef} 
      width={width} 
      height={height}
      style={{ border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fafafa' }}
    />
  );
};

export default LossChart;