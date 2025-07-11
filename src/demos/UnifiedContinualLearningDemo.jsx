import React, { useState, useRef, useEffect } from 'react';
import { SimpleNeuralNetwork } from '../neural-network/NeuralNetwork';
import { generateData } from '../utils/dataGeneration';
import NetworkVisualization from '../components/NetworkVisualization';
import LossChart from '../components/LossChart';
import ActivationHeatmap from '../components/ActivationHeatmap';
import TrainingControls from '../components/TrainingControls';
import ModelTimeline from '../components/ModelTimeline';
import * as d3 from 'd3';

const UnifiedContinualLearningDemo = () => {
  // Network and training state
  const [network, setNetwork] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [learningRate, setLearningRate] = useState(0.01);
  const [activationType, setActivationType] = useState('tanh');
  const [batchSize, setBatchSize] = useState(32);
  const [epochsPerStep, setEpochsPerStep] = useState(1);
  const [showActivationHeatmaps, setShowActivationHeatmaps] = useState(true);
  
  // Data generation settings
  const [dataType, setDataType] = useState('spiral');
  const [trainingSamples, setTrainingSamples] = useState(100);
  
  // Continual learning features
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskHistory, setTaskHistory] = useState([]);
  const [taskSwitchPoints, setTaskSwitchPoints] = useState([]);
  
  // Model history features
  const [snapshots, setSnapshots] = useState([]);
  const [currentSnapshotIndex, setCurrentSnapshotIndex] = useState(0);
  const [snapshotInterval, setSnapshotInterval] = useState(50);
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [autoSnapshot, setAutoSnapshot] = useState(true);
  
  
  // Refs
  const animationRef = useRef(null);
  const networkRef = useRef(null);
  const svgRef = useRef(null);
  const epochsPerStepRef = useRef(epochsPerStep);
  const batchSizeRef = useRef(batchSize);
  const lastSnapshotEpoch = useRef(0);

  // Available tasks
  const tasks = ['spiral', 'xor', 'circle', 'ring', 'gaussian'];

  // Update refs
  useEffect(() => {
    epochsPerStepRef.current = epochsPerStep;
  }, [epochsPerStep]);

  useEffect(() => {
    batchSizeRef.current = batchSize;
  }, [batchSize]);

  // Initialize network
  useEffect(() => {
    const nn = new SimpleNeuralNetwork(2, 2, 4);
    nn.setActivationType(activationType);
    nn.setLearningRate(learningRate);
    
    const trainData = generateData(trainingSamples, dataType);
    const testData = generateData(Math.floor(trainingSamples * 0.2), dataType);
    nn.setTrainTestData(trainData, testData);
    
    setNetwork(nn);
    networkRef.current = nn;
    
    // Record initial task
    setTaskHistory([{ task: dataType, startEpoch: 0 }]);
  }, []);

  // Draw current dataset
  useEffect(() => {
    if (!svgRef.current || !network) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 220;
    const height = 220;
    const margin = 20;

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
    if (trainData && trainData.data) {
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
    }

    // Add title with current task
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 12)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text(`Task: ${dataType.toUpperCase()}`);

  }, [network, dataType]);

  // Save snapshot function
  const saveSnapshot = (network, isManual = false, isTaskSwitch = false) => {
    const snapshot = {
      network: network.clone(),
      epoch: network.currentEpoch,
      trainLoss: network.trainingLoss[network.trainingLoss.length - 1] || 0,
      testLoss: network.testLoss[network.testLoss.length - 1] || 0,
      dataset: dataType,
      task: tasks[currentTaskIndex],
      timestamp: Date.now(),
      isManual,
      isTaskSwitch
    };
    
    setSnapshots(prev => [...prev, snapshot]);
    if (!isViewingHistory) {
      setCurrentSnapshotIndex(prev => prev + 1);
    }
  };

  // Training step
  const trainStep = () => {
    if (!networkRef.current || animationRef.current === null) return;

    const network = networkRef.current;
    const trainData = network.currentTrainData;
    const testData = network.currentTestData;

    // Train for specified epochs
    for (let i = 0; i < epochsPerStepRef.current; i++) {
      network.trainOneEpoch(
        trainData.data,
        trainData.labels,
        testData.data,
        testData.labels,
        batchSizeRef.current
      );
    }

    // Auto snapshot at intervals
    if (autoSnapshot && network.currentEpoch - lastSnapshotEpoch.current >= snapshotInterval) {
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

  // Control handlers
  const handleStart = () => {
    if (!network) return;
    
    // Save initial snapshot if none exist
    if (snapshots.length === 0) {
      saveSnapshot(network);
    }
    
    // If viewing history at latest snapshot, switch to live mode
    if (isViewingHistory && currentSnapshotIndex === snapshots.length - 1) {
      setIsViewingHistory(false);
    }
    
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
    
    const trainData = generateData(trainingSamples, dataType);
    const testData = generateData(Math.floor(trainingSamples * 0.2), dataType);
    nn.setTrainTestData(trainData, testData);
    
    setNetwork(nn);
    networkRef.current = nn;
    setSnapshots([]);
    setCurrentSnapshotIndex(0);
    lastSnapshotEpoch.current = 0;
    setIsViewingHistory(false);
    setTaskSwitchPoints([]);
    setTaskHistory([{ task: dataType, startEpoch: 0 }]);
  };

  // Task switching
  const handleTaskSwitch = (newTask) => {
    if (!network || isTraining) return;
    
    // Record switch point
    setTaskSwitchPoints(prev => [...prev, network.currentEpoch]);
    setTaskHistory(prev => [...prev, { task: newTask, startEpoch: network.currentEpoch }]);
    
    // Generate new data
    const trainData = generateData(trainingSamples, newTask);
    const testData = generateData(Math.floor(trainingSamples * 0.2), newTask);
    
    // Update network with new data but keep weights
    network.setTrainTestData(trainData, testData);
    
    // Update state
    setDataType(newTask);
    const newTaskIndex = tasks.indexOf(newTask);
    setCurrentTaskIndex(newTaskIndex);
    
    // Save snapshot at task switch with task switch flag
    saveSnapshot(network, true, true);
  };

  // Model history navigation
  const handleSelectSnapshot = (index) => {
    if (index < 0 || index >= snapshots.length) return;
    
    const snapshot = snapshots[index];
    const clonedNetwork = snapshot.network.clone();
    
    // Update dataset to match the snapshot
    if (snapshot.dataset) {
      const trainData = generateData(trainingSamples, snapshot.dataset);
      const testData = generateData(Math.floor(trainingSamples * 0.2), snapshot.dataset);
      clonedNetwork.setTrainTestData(trainData, testData);
      
      setDataType(snapshot.dataset);
      setCurrentTaskIndex(tasks.indexOf(snapshot.dataset));
    }
    
    setNetwork(clonedNetwork);
    networkRef.current = clonedNetwork;
    setCurrentSnapshotIndex(index);
    setIsViewingHistory(index < snapshots.length - 1);
  };

  const handleClearHistory = () => {
    setSnapshots([]);
    setCurrentSnapshotIndex(0);
    setIsViewingHistory(false);
  };

  // Parameter updates
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

  const handleDataTypeChange = (type) => {
    if (isTraining) return;
    
    setDataType(type);
    if (network && !isViewingHistory) {
      const trainData = generateData(trainingSamples, type);
      const testData = generateData(Math.floor(trainingSamples * 0.2), type);
      network.setTrainTestData(trainData, testData);
      
      const clonedNetwork = network.clone();
      setNetwork(clonedNetwork);
      networkRef.current = clonedNetwork;
    }
  };

  const handleTrainingSamplesChange = (samples) => {
    setTrainingSamples(samples);
    if (network && !isViewingHistory) {
      const trainData = generateData(samples, dataType);
      const testData = generateData(Math.floor(samples * 0.2), dataType);
      network.setTrainTestData(trainData, testData);
      
      const clonedNetwork = network.clone();
      setNetwork(clonedNetwork);
      networkRef.current = clonedNetwork;
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
    <div style={{ padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <h2 style={{ margin: '0 0 10px 0' }}>Unified Continual Learning Demo</h2>

      {/* Control Panel - All controls in one flexible block */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #dee2e6',
        marginBottom: '15px',
        flexShrink: 0
      }}>

        {/* Status Row */}
        <div style={{
          padding: '8px 12px',
          backgroundColor: isViewingHistory ? '#fff3cd' : '#d4edda',
          borderRadius: '6px',
          border: isViewingHistory ? '1px solid #ffeaa7' : '1px solid #c3e6cb',
          marginBottom: '12px',
          fontSize: '13px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong>Status:</strong> {isViewingHistory ? `Viewing History (E${snapshots[currentSnapshotIndex]?.epoch || 0})` : (isTraining ? 'Training...' : 'Ready')}
            {' | '}
            <strong>Task:</strong> {dataType.toUpperCase()}
            {' | '}
            <strong>Epoch:</strong> {network?.currentEpoch || 0}
          </div>
        </div>

        {/* Flexible Controls Grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
          {/* Training Controls Section */}
          <div style={{ flex: '1 1 300px', minWidth: 0 }}>
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
          </div>

          {/* Task Switching Section */}
          <div style={{ 
            flex: '1 1 200px',
            backgroundColor: '#e8f4f8',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #b8e0ea'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Task Switching</h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {tasks.map((task) => (
                <button
                  key={task}
                  onClick={() => handleTaskSwitch(task)}
                  disabled={isTraining || dataType === task}
                  style={{
                    padding: '4px 10px',
                    fontSize: '12px',
                    backgroundColor: dataType === task ? '#007bff' : '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isTraining || dataType === task ? 'not-allowed' : 'pointer',
                    opacity: isTraining ? 0.5 : 1
                  }}
                >
                  {task.toUpperCase()}
                </button>
              ))}
            </div>
            {taskHistory.length > 1 && (
              <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
                <strong>History:</strong> {taskHistory.map((t) => 
                  `${t.task}(E${t.startEpoch})`
                ).join(' → ')}
              </div>
            )}
          </div>

          {/* Additional Settings */}
          <div style={{ 
            flex: '1 1 250px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            alignItems: 'flex-start',
            alignContent: 'flex-start'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
              Epochs/step:
              <input
                type="number"
                value={epochsPerStep}
                onChange={(e) => setEpochsPerStep(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="10"
                style={{ width: '50px' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
              Samples:
              <input
                type="number"
                value={trainingSamples}
                onChange={(e) => handleTrainingSamplesChange(Math.max(10, parseInt(e.target.value) || 100))}
                min="10"
                max="500"
                step="10"
                style={{ width: '60px' }}
                disabled={isTraining}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
              <input
                type="checkbox"
                checked={showActivationHeatmaps}
                onChange={(e) => setShowActivationHeatmaps(e.target.checked)}
              />
              Show heatmaps
            </label>
          </div>
        </div>
      </div>

      {/* Model Timeline */}
      <ModelTimeline
        snapshots={snapshots}
        currentIndex={currentSnapshotIndex}
        onSelectSnapshot={handleSelectSnapshot}
        onClearHistory={handleClearHistory}
        autoSnapshot={autoSnapshot}
        snapshotInterval={snapshotInterval}
        onAutoSnapshotChange={setAutoSnapshot}
        onSnapshotIntervalChange={setSnapshotInterval}
        onSaveSnapshot={() => network && saveSnapshot(network, true)}
        network={network}
        isTraining={isTraining}
      />

      {network && (
        <div style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          minHeight: 0
        }}>
          {/* Main Visualizations Row */}
          <div style={{ 
            flex: 1,
            display: 'flex',
            gap: '15px',
            minHeight: 0
          }}>
            {/* Left: Training Data */}
            <div style={{ 
              width: '250px',
              backgroundColor: '#f5f5f5',
              padding: '15px',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Training Data</h4>
              <svg ref={svgRef} width={220} height={220} style={{ alignSelf: 'center' }} />
              
              <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                <label style={{ fontSize: '12px' }}>
                  Dataset:
                  <select
                    value={dataType}
                    onChange={(e) => handleDataTypeChange(e.target.value)}
                    disabled={isTraining}
                    style={{
                      marginLeft: '5px',
                      padding: '2px 5px',
                      fontSize: '12px',
                      borderRadius: '4px',
                      border: '1px solid #ccc'
                    }}
                  >
                    {tasks.map(task => (
                      <option key={task} value={task}>{task.toUpperCase()}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {/* Center: Network Architecture (takes remaining space) */}
            <div style={{ 
              flex: 1,
              backgroundColor: '#f5f5f5',
              padding: '15px',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Network Architecture</h4>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <NetworkVisualization
                  network={network}
                  width={600}
                  height={400}
                  showWeights={true}
                  showActivationHeatmaps={showActivationHeatmaps}
                  heatmapResolution={15}
                />
              </div>
            </div>

            {/* Right Column: Decision Boundary + Loss Chart */}
            <div style={{
              width: '350px',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              {/* Decision Boundary */}
              <div style={{ 
                flex: '1',
                backgroundColor: '#f5f5f5',
                padding: '15px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Decision Boundary</h4>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <ActivationHeatmap
                    network={network}
                    layerIndex={3}
                    neuronIndex={0}
                    resolution={30}
                    width={280}
                    height={280}
                    inputBounds={[-6, 6]}
                    colorScheme="redblue"
                    showAxes={true}
                    title=""
                  />
                </div>
              </div>

              {/* Loss Chart */}
              <div style={{ 
                height: '180px',
                backgroundColor: '#f5f5f5',
                padding: '15px',
                borderRadius: '8px'
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Training Progress</h4>
                <LossChart
                  trainLoss={network.trainingLoss}
                  testLoss={network.testLoss}
                  width={320}
                  height={120}
                  maxPoints={150}
                />
                {taskSwitchPoints.length > 0 && (
                  <div style={{ marginTop: '5px', fontSize: '10px', color: '#666' }}>
                    Switches: {taskSwitchPoints.map(e => `E${e}`).join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedContinualLearningDemo;