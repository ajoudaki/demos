import React, { useState, useRef, useEffect } from 'react';
import { SimpleNeuralNetwork } from '../neural-network/NeuralNetwork';
import { generateData } from '../utils/dataGeneration';
import NetworkVisualization from '../components/NetworkVisualization';
import LossChart from '../components/LossChart';
import ActivationHeatmap from '../components/ActivationHeatmap';
import TrainingControls from '../components/TrainingControls';
import ModelTimeline from '../components/ModelTimeline';
import * as d3 from 'd3';

const ModelHistoryDemo = () => {
  const [network, setNetwork] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [learningRate, setLearningRate] = useState(0.01);
  const [activationType, setActivationType] = useState('tanh');
  const [batchSize, setBatchSize] = useState(32);
  const [dataType, setDataType] = useState('spiral');
  const [snapshots, setSnapshots] = useState([]);
  const [currentSnapshotIndex, setCurrentSnapshotIndex] = useState(0);
  const [snapshotInterval, setSnapshotInterval] = useState(10);
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [showActivationHeatmaps, setShowActivationHeatmaps] = useState(true);
  
  const animationRef = useRef(null);
  const networkRef = useRef(null);
  const svgRef = useRef(null);
  const batchSizeRef = useRef(batchSize);
  const lastSnapshotEpoch = useRef(0);

  // Update refs
  useEffect(() => {
    batchSizeRef.current = batchSize;
  }, [batchSize]);

  // Initialize network
  useEffect(() => {
    const nn = new SimpleNeuralNetwork(2, 2, 4);
    const trainData = generateData(100, dataType);
    const testData = generateData(20, dataType);
    nn.setTrainTestData(trainData, testData);
    setNetwork(nn);
    networkRef.current = nn;
  }, []);

  // Draw data points
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

    // Plot training data
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
      .text(`Dataset: ${dataType.toUpperCase()}`);

  }, [network, dataType]);

  const saveSnapshot = (network) => {
    const snapshot = {
      network: network.clone(),
      epoch: network.currentEpoch,
      trainLoss: network.trainingLoss[network.trainingLoss.length - 1] || 0,
      testLoss: network.testLoss[network.testLoss.length - 1] || 0,
      dataset: dataType,
      timestamp: Date.now()
    };
    
    setSnapshots(prev => [...prev, snapshot]);
    setCurrentSnapshotIndex(prev => prev + 1);
  };

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

    // Save snapshot at intervals
    if (network.currentEpoch - lastSnapshotEpoch.current >= snapshotInterval) {
      saveSnapshot(network);
      lastSnapshotEpoch.current = network.currentEpoch;
    }

    // Update network state
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
    
    // Save initial snapshot if none exist
    if (snapshots.length === 0) {
      saveSnapshot(network);
    }
    
    setIsTraining(true);
    setIsViewingHistory(false);
    animationRef.current = 1;
    trainStep();
  };

  const handleStop = () => {
    setIsTraining(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Save final snapshot
    if (networkRef.current) {
      saveSnapshot(networkRef.current);
    }
  };

  const handleReset = () => {
    handleStop();
    const nn = new SimpleNeuralNetwork(2, 2, 4);
    nn.setActivationType(activationType);
    nn.setLearningRate(learningRate);
    
    const trainData = generateData(100, dataType);
    const testData = generateData(20, dataType);
    nn.setTrainTestData(trainData, testData);
    
    setNetwork(nn);
    networkRef.current = nn;
    setSnapshots([]);
    setCurrentSnapshotIndex(0);
    lastSnapshotEpoch.current = 0;
    setIsViewingHistory(false);
  };

  const handleSelectSnapshot = (index) => {
    if (index < 0 || index >= snapshots.length) return;
    
    const snapshot = snapshots[index];
    setNetwork(snapshot.network.clone());
    setCurrentSnapshotIndex(index);
    setIsViewingHistory(true);
  };

  const handleClearHistory = () => {
    setSnapshots([]);
    setCurrentSnapshotIndex(0);
    setIsViewingHistory(false);
  };

  const handleLearningRateChange = (rate) => {
    setLearningRate(rate);
    if (network && !isViewingHistory) {
      network.setLearningRate(rate);
    }
  };

  const handleActivationTypeChange = (type) => {
    setActivationType(type);
    if (network && !isViewingHistory) {
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
      <h2>Model History Demo</h2>
      <p>Train the network and navigate through saved snapshots to see how it evolved over time.</p>

      {/* Snapshot Settings */}
      <div style={{ 
        marginBottom: '20px',
        padding: '10px',
        backgroundColor: '#e8f4f8',
        borderRadius: '8px',
        border: '1px solid #b8e0ea',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        <label>
          Save snapshot every
          <input
            type="number"
            value={snapshotInterval}
            onChange={(e) => setSnapshotInterval(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            max="100"
            style={{
              width: '60px',
              marginLeft: '5px',
              marginRight: '5px',
              padding: '4px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
          epochs
        </label>
        
        {isViewingHistory && (
          <div style={{
            padding: '5px 10px',
            backgroundColor: '#ffc107',
            color: '#000',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: 'bold'
          }}>
            Viewing History (Epoch {snapshots[currentSnapshotIndex]?.epoch || 0})
          </div>
        )}
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

      {/* Model Timeline */}
      {snapshots.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <ModelTimeline
            snapshots={snapshots}
            currentIndex={currentSnapshotIndex}
            onSelectSnapshot={handleSelectSnapshot}
            onClearHistory={handleClearHistory}
          />
        </div>
      )}

      {network && (
        <>
          {/* Main Visualizations */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '300px 1fr',
            gap: '20px',
            marginTop: '20px'
          }}>
            {/* Dataset */}
            <div style={{ 
              backgroundColor: '#f5f5f5',
              padding: '20px',
              borderRadius: '8px'
            }}>
              <h3>Training Data</h3>
              <svg ref={svgRef} width={300} height={300} />
            </div>

            {/* Network Architecture */}
            <div style={{ 
              backgroundColor: '#f5f5f5',
              padding: '20px',
              borderRadius: '8px'
            }}>
              <h3>Network Architecture</h3>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                marginBottom: '10px',
                fontSize: '14px'
              }}>
                <input
                  type="checkbox"
                  checked={showActivationHeatmaps}
                  onChange={(e) => setShowActivationHeatmaps(e.target.checked)}
                />
                Show activation heatmaps on neurons
              </label>
              <NetworkVisualization
                network={network}
                width={500}
                height={300}
                showWeights={true}
                showActivationHeatmaps={showActivationHeatmaps}
                heatmapResolution={15}
              />
            </div>
          </div>

          {/* Loss Chart */}
          <div style={{ 
            backgroundColor: '#f5f5f5',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <h3>Training Progress</h3>
            <LossChart
              trainLoss={network.trainingLoss}
              testLoss={network.testLoss}
              width={800}
              height={250}
            />
          </div>

          {/* Decision Boundary */}
          <div style={{ 
            backgroundColor: '#f5f5f5',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <h3>Decision Boundary</h3>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ActivationHeatmap
                network={network}
                layerIndex={2}
                neuronIndex={0}
                resolution={30}
                width={400}
                height={400}
                colorScheme="redblue"
                title={`Epoch ${network.currentEpoch}`}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ModelHistoryDemo;