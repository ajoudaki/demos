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
  
  // Visualization settings
  const [selectedNeuron, setSelectedNeuron] = useState({ layer: 0, index: 0 });
  const [selectedHiddenLayer, setSelectedHiddenLayer] = useState(0);
  
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
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text(`Current Task: ${dataType.toUpperCase()}`);

  }, [network, dataType]);

  // Save snapshot function
  const saveSnapshot = (network, isManual = false) => {
    const snapshot = {
      network: network.clone(),
      epoch: network.currentEpoch,
      trainLoss: network.trainingLoss[network.trainingLoss.length - 1] || 0,
      testLoss: network.testLoss[network.testLoss.length - 1] || 0,
      dataset: dataType,
      task: tasks[currentTaskIndex],
      timestamp: Date.now(),
      isManual
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
    
    // Save snapshot at task switch
    saveSnapshot(network, true);
  };

  // Model history navigation
  const handleSelectSnapshot = (index) => {
    if (index < 0 || index >= snapshots.length) return;
    
    const snapshot = snapshots[index];
    setNetwork(snapshot.network.clone());
    setCurrentSnapshotIndex(index);
    setIsViewingHistory(true);
    
    // Update UI to reflect snapshot state
    if (snapshot.task) {
      setDataType(snapshot.task);
      setCurrentTaskIndex(tasks.indexOf(snapshot.task));
    }
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
    <div style={{ padding: '20px' }}>
      <h2>Unified Continual Learning Demo</h2>
      <p>A comprehensive demo combining integrated training, continual learning, and model history features.</p>

      {/* Status Bar */}
      <div style={{
        marginBottom: '20px',
        padding: '10px',
        backgroundColor: isViewingHistory ? '#fff3cd' : '#d4edda',
        borderRadius: '8px',
        border: isViewingHistory ? '1px solid #ffeaa7' : '1px solid #c3e6cb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <strong>Status:</strong> {isViewingHistory ? `Viewing History (Epoch ${snapshots[currentSnapshotIndex]?.epoch || 0})` : (isTraining ? 'Training...' : 'Ready')}
          {' | '}
          <strong>Current Task:</strong> {dataType.toUpperCase()}
          {' | '}
          <strong>Epoch:</strong> {network?.currentEpoch || 0}
        </div>
        <div>
          <strong>Snapshots:</strong> {snapshots.length}
        </div>
      </div>

      {/* Training Controls */}
      <div style={{
        backgroundColor: '#f5f5f5',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
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

        {/* Additional Controls */}
        <div style={{ marginTop: '15px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            Epochs per step:
            <input
              type="number"
              value={epochsPerStep}
              onChange={(e) => setEpochsPerStep(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max="10"
              style={{ width: '60px' }}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            Training samples:
            <input
              type="number"
              value={trainingSamples}
              onChange={(e) => handleTrainingSamplesChange(Math.max(10, parseInt(e.target.value) || 100))}
              min="10"
              max="500"
              step="10"
              style={{ width: '80px' }}
              disabled={isTraining}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={showActivationHeatmaps}
              onChange={(e) => setShowActivationHeatmaps(e.target.checked)}
            />
            Show activation heatmaps
          </label>
        </div>
      </div>

      {/* Continual Learning Controls */}
      <div style={{
        backgroundColor: '#e8f4f8',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #b8e0ea'
      }}>
        <h3 style={{ marginTop: 0 }}>Task Switching</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {tasks.map((task, index) => (
            <button
              key={task}
              onClick={() => handleTaskSwitch(task)}
              disabled={isTraining || dataType === task}
              style={{
                padding: '8px 16px',
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
          <div style={{ marginTop: '10px', fontSize: '13px', color: '#666' }}>
            <strong>Task History:</strong> {taskHistory.map((t, i) => 
              `${t.task} (epoch ${t.startEpoch})`
            ).join(' → ')}
          </div>
        )}
      </div>

      {/* Model History Controls */}
      <div style={{
        backgroundColor: '#f0f8ff',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #b0d4ff'
      }}>
        <h3 style={{ marginTop: 0 }}>Model History</h3>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={autoSnapshot}
              onChange={(e) => setAutoSnapshot(e.target.checked)}
            />
            Auto-snapshot every
            <input
              type="number"
              value={snapshotInterval}
              onChange={(e) => setSnapshotInterval(Math.max(1, parseInt(e.target.value) || 50))}
              min="1"
              max="200"
              style={{ width: '60px' }}
              disabled={!autoSnapshot}
            />
            epochs
          </label>

          <button
            onClick={() => network && saveSnapshot(network, true)}
            disabled={isTraining || !network}
            style={{
              padding: '6px 12px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isTraining || !network ? 'not-allowed' : 'pointer'
            }}
          >
            Save Snapshot
          </button>
        </div>
      </div>

      {/* Model Timeline */}
      {snapshots.length > 0 && (
        <ModelTimeline
          snapshots={snapshots}
          currentIndex={currentSnapshotIndex}
          onSelectSnapshot={handleSelectSnapshot}
          onClearHistory={handleClearHistory}
        />
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
            {/* Dataset Visualization */}
            <div style={{ 
              backgroundColor: '#f5f5f5',
              padding: '20px',
              borderRadius: '8px'
            }}>
              <h3>Training Data</h3>
              <svg ref={svgRef} width={300} height={300} />
              
              <div style={{ marginTop: '10px' }}>
                <label>
                  Dataset:
                  <select
                    value={dataType}
                    onChange={(e) => handleDataTypeChange(e.target.value)}
                    disabled={isTraining}
                    style={{
                      marginLeft: '10px',
                      padding: '4px 8px',
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
              maxPoints={200}
            />
            {taskSwitchPoints.length > 0 && (
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                Task switches at epochs: {taskSwitchPoints.join(', ')}
              </div>
            )}
          </div>

          {/* Activation Heatmaps */}
          <div style={{ 
            backgroundColor: '#f5f5f5',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <h3>Activation Heatmaps</h3>
            
            {/* Layer Selection */}
            <div style={{ marginBottom: '15px' }}>
              <label>
                Select layer:
                <select
                  value={selectedHiddenLayer}
                  onChange={(e) => setSelectedHiddenLayer(parseInt(e.target.value))}
                  style={{
                    marginLeft: '10px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                >
                  <option value={0}>Hidden Layer 1</option>
                  <option value={1}>Hidden Layer 2</option>
                </select>
              </label>
            </div>

            {/* Heatmap Grid */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '15px'
            }}>
              {[0, 1, 2, 3].map(neuronIndex => (
                <div key={neuronIndex} style={{ textAlign: 'center' }}>
                  <ActivationHeatmap
                    network={network}
                    layerIndex={selectedHiddenLayer + 1}
                    neuronIndex={neuronIndex}
                    resolution={30}
                    width={150}
                    height={150}
                    inputBounds={[-6, 6]}
                    colorScheme="redblue"
                    showAxes={false}
                    title={`Neuron ${neuronIndex + 1}`}
                  />
                </div>
              ))}
            </div>

            {/* Decision Boundary */}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <h4>Decision Boundary</h4>
              <ActivationHeatmap
                network={network}
                layerIndex={3}
                neuronIndex={0}
                resolution={40}
                width={300}
                height={300}
                inputBounds={[-6, 6]}
                colorScheme="redblue"
                showAxes={true}
                title=""
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UnifiedContinualLearningDemo;