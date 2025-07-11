import React, { useState, useRef, useEffect } from 'react';
import { SimpleNeuralNetwork } from '../neural-network/NeuralNetwork';
import { generateData } from '../utils/dataGeneration';
import NetworkVisualization from '../components/NetworkVisualization';
import LossChart from '../components/LossChart';
import ActivationHeatmap from '../components/ActivationHeatmap';
import TrainingControls from '../components/TrainingControls';
import * as d3 from 'd3';

const ContinualLearningFeatureDemo = () => {
  const [network, setNetwork] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [learningRate, setLearningRate] = useState(0.01);
  const [activationType, setActivationType] = useState('tanh');
  const [batchSize, setBatchSize] = useState(32);
  const [currentDataset, setCurrentDataset] = useState('xor');
  const [datasetHistory, setDatasetHistory] = useState([]);
  const [taskSwitchPoints, setTaskSwitchPoints] = useState([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  
  const animationRef = useRef(null);
  const networkRef = useRef(null);
  const svgRef = useRef(null);
  const batchSizeRef = useRef(batchSize);

  // Update refs
  useEffect(() => {
    batchSizeRef.current = batchSize;
  }, [batchSize]);

  // Initialize network
  useEffect(() => {
    const nn = new SimpleNeuralNetwork(2, 2, 4);
    const trainData = generateData(100, currentDataset);
    const testData = generateData(20, currentDataset);
    nn.setTrainTestData(trainData, testData);
    setNetwork(nn);
    networkRef.current = nn;
    setDatasetHistory([{ dataset: currentDataset, epoch: 0 }]);
  }, []);

  // Draw current dataset
  useEffect(() => {
    if (!svgRef.current || !network) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 300;
    const height = 300;
    const margin = 30;

    const xScale = d3.scaleLinear()
      .domain([-6, 6])
      .range([margin, width - margin]);

    const yScale = d3.scaleLinear()
      .domain([-6, 6])
      .range([height - margin, margin]);

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin})`)
      .call(d3.axisBottom(xScale).ticks(5));

    svg.append('g')
      .attr('transform', `translate(${margin},0)`)
      .call(d3.axisLeft(yScale).ticks(5));

    // Plot current training data
    const trainData = network.currentTrainData;
    svg.selectAll('circle')
      .data(trainData.data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d[0]))
      .attr('cy', d => yScale(d[1]))
      .attr('r', 3)
      .attr('fill', (d, i) => trainData.labels[i] === 1 ? '#3498db' : '#e74c3c')
      .attr('stroke', 'black')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.8);

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text(`Current: ${currentDataset.toUpperCase()}`);

  }, [network, currentDataset, updateTrigger]);

  const trainStep = () => {
    if (!networkRef.current || animationRef.current === null) return;

    const network = networkRef.current;
    const trainData = network.currentTrainData;
    const testData = network.currentTestData;

    // Train one epoch
    network.trainOneEpoch(
      trainData.data,
      trainData.labels,
      testData.data,
      testData.labels,
      batchSizeRef.current
    );

    // Force React to see the updated network by creating a new reference
    const clonedNetwork = network.clone();
    setNetwork(clonedNetwork);
    networkRef.current = clonedNetwork;

    // Continue training
    if (animationRef.current !== null) {
      animationRef.current = requestAnimationFrame(trainStep);
    }
  };

  const handleStart = () => {
    if (!network) return;
    setIsTraining(true);
    animationRef.current = 1;
    trainStep();
  };

  const handleStop = () => {
    setIsTraining(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  const handleReset = () => {
    handleStop();
    const nn = new SimpleNeuralNetwork(2, 2, 4);
    nn.setActivationType(activationType);
    nn.setLearningRate(learningRate);
    
    const trainData = generateData(100, currentDataset);
    const testData = generateData(20, currentDataset);
    nn.setTrainTestData(trainData, testData);
    
    setNetwork(nn);
    networkRef.current = nn;
    setUpdateTrigger(0);
    setDatasetHistory([{ dataset: currentDataset, epoch: 0 }]);
    setTaskSwitchPoints([]);
  };

  const handleDatasetSwitch = (newDataset) => {
    if (!network || newDataset === currentDataset) return;

    // Record the switch point
    const switchPoint = network.currentEpoch;
    setTaskSwitchPoints(prev => [...prev, switchPoint]);
    setDatasetHistory(prev => [...prev, { dataset: newDataset, epoch: switchPoint }]);

    // Generate new data
    const trainData = generateData(100, newDataset);
    const testData = generateData(20, newDataset);
    
    // Update network with new data (keeping weights)
    network.setTrainTestData(trainData, testData);
    networkRef.current = network;
    
    setCurrentDataset(newDataset);
    setUpdateTrigger(prev => prev + 1);
  };

  const handleLearningRateChange = (rate) => {
    setLearningRate(rate);
    if (network) {
      network.setLearningRate(rate);
    }
  };

  const handleActivationTypeChange = (type) => {
    setActivationType(type);
    if (network) {
      network.setActivationType(type);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Continual Learning Demo</h2>
      <p>Train the network on different datasets sequentially. Watch how it adapts to new tasks while trying to retain previous knowledge.</p>

      {/* Dataset Switching Controls */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px',
        backgroundColor: '#e8f4f8',
        borderRadius: '8px',
        border: '1px solid #b8e0ea'
      }}>
        <h4 style={{ marginTop: 0 }}>Switch Dataset (Continual Learning)</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['xor', 'spiral', 'circle', 'ring', 'gaussian'].map(dataset => (
            <button
              key={dataset}
              onClick={() => handleDatasetSwitch(dataset)}
              disabled={dataset === currentDataset}
              style={{
                padding: '8px 16px',
                backgroundColor: dataset === currentDataset ? '#6c757d' : '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: dataset === currentDataset ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              {dataset.toUpperCase()}
            </button>
          ))}
        </div>
        <div style={{ marginTop: '10px', fontSize: '13px', color: '#666' }}>
          <strong>Dataset History:</strong> {datasetHistory.map((h, i) => 
            `${h.dataset} (epoch ${h.epoch})${i < datasetHistory.length - 1 ? ' → ' : ''}`
          ).join('')}
        </div>
      </div>

      {/* Training Controls */}
      <TrainingControls
        isTraining={isTraining}
        onStart={handleStart}
        onStop={handleStop}
        onReset={handleReset}
        learningRate={learningRate}
        onLearningRateChange={handleLearningRateChange}
        activationType={activationType}
        onActivationTypeChange={handleActivationTypeChange}
        batchSize={batchSize}
        onBatchSizeChange={setBatchSize}
        currentEpoch={network?.currentEpoch || 0}
        trainLoss={network?.trainingLoss[network.trainingLoss.length - 1] || null}
        testLoss={network?.testLoss[network.testLoss.length - 1] || null}
      />

      {network && (
        <>
          {/* Main Visualizations */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '300px 1fr',
            gap: '20px',
            marginTop: '20px'
          }}>
            {/* Current Dataset */}
            <div style={{ 
              backgroundColor: '#f5f5f5',
              padding: '20px',
              borderRadius: '8px'
            }}>
              <h3>Current Dataset</h3>
              <svg ref={svgRef} width={300} height={300} />
            </div>

            {/* Network Architecture */}
            <div style={{ 
              backgroundColor: '#f5f5f5',
              padding: '20px',
              borderRadius: '8px'
            }}>
              <h3>Network Architecture</h3>
              <NetworkVisualization
                network={network}
                width={500}
                height={300}
                showWeights={true}
              />
            </div>
          </div>

          {/* Loss Chart with Task Switch Markers */}
          <div style={{ 
            backgroundColor: '#f5f5f5',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <h3>Training Progress</h3>
            <div style={{ position: 'relative' }}>
              <LossChart
                trainLoss={network.trainingLoss || []}
                testLoss={network.testLoss || []}
                width={800}
                height={250}
                maxPoints={200}
              />
              {/* Task switch markers */}
              {taskSwitchPoints.map((epoch, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${50 + (epoch / Math.max(network.currentEpoch, 1)) * 690}px`,
                    top: '20px',
                    height: '210px',
                    width: '2px',
                    backgroundColor: '#ff6b6b',
                    opacity: 0.7
                  }}
                  title={`Task switch at epoch ${epoch}`}
                />
              ))}
            </div>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
              <span style={{ color: '#ff6b6b' }}>|</span> Red lines indicate task switches
              <br />
              <span>Loss data points: Train: {network.trainingLoss?.length || 0}, Test: {network.testLoss?.length || 0}</span>
            </div>
          </div>

          {/* Activation Heatmap */}
          <div style={{ 
            backgroundColor: '#f5f5f5',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <h3>Network Decision Boundary</h3>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ActivationHeatmap
                network={network}
                layerIndex={2}
                neuronIndex={0}
                resolution={30}
                width={400}
                height={400}
                colorScheme="redblue"
                title={`Current Task: ${currentDataset.toUpperCase()}`}
              />
            </div>
            <p style={{ marginTop: '15px', fontSize: '14px', color: '#666', textAlign: 'center' }}>
              The heatmap shows the network's current decision boundary. 
              Watch how it changes when you switch to a new dataset.
            </p>
          </div>

          {/* Continual Learning Insights */}
          <div style={{ 
            backgroundColor: '#fff3cd',
            padding: '15px',
            borderRadius: '8px',
            marginTop: '20px',
            border: '1px solid #ffeaa7'
          }}>
            <h4 style={{ marginTop: 0 }}>Continual Learning Insights</h4>
            <ul style={{ marginBottom: 0, fontSize: '14px' }}>
              <li>Watch how the loss spikes when switching to a new task</li>
              <li>The network attempts to learn new patterns while preserving old ones</li>
              <li>Some catastrophic forgetting may occur - the network might lose performance on previous tasks</li>
              <li>Try different task sequences to see how order affects learning</li>
              <li>Lower learning rates may help preserve previous knowledge better</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default ContinualLearningFeatureDemo;