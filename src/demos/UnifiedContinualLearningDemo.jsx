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
  
  // Network architecture
  const [hiddenLayers, setHiddenLayers] = useState([4, 4]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [heatmapResolution, setHeatmapResolution] = useState(15);
  
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
  const dataContainerRef = useRef(null);
  const lossChartContainerRef = useRef(null);
  const [svgDimensions, setSvgDimensions] = useState({ width: 370, height: 370 });
  const [lossChartWidth, setLossChartWidth] = useState(370);
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
  const initializeNetwork = () => {
    const nn = new SimpleNeuralNetwork(2, hiddenLayers.length, hiddenLayers[0]);
    
    // Set hidden layer sizes if more than one layer
    if (hiddenLayers.length > 1) {
      nn.hiddenLayerSizes = [...hiddenLayers];
      nn.initializeWeightsAndBiases();
    }
    
    nn.setActivationType(activationType);
    nn.setLearningRate(learningRate);
    
    const trainData = generateData(trainingSamples, dataType);
    const testData = generateData(Math.floor(trainingSamples * 0.2), dataType);
    nn.setTrainTestData(trainData, testData);
    
    setNetwork(nn);
    networkRef.current = nn;
    
    // Clear history on architecture change
    setSnapshots([]);
    setCurrentSnapshotIndex(0);
    lastSnapshotEpoch.current = 0;
    setIsViewingHistory(false);
    setTaskSwitchPoints([]);
    setTaskHistory([{ task: dataType, startEpoch: 0 }]);
  };
  
  useEffect(() => {
    initializeNetwork();
  }, []);

  // Handle responsive sizing for data visualization
  useEffect(() => {
    if (!dataContainerRef.current) return;

    const handleResize = () => {
      if (dataContainerRef.current) {
        const rect = dataContainerRef.current.getBoundingClientRect();
        // Use container width minus padding
        const availableWidth = rect.width - 30;
        // Keep square aspect ratio
        const size = Math.min(availableWidth, 370);
        setSvgDimensions({ width: size, height: size });
      }
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(dataContainerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // Handle responsive sizing for loss chart
  useEffect(() => {
    if (!lossChartContainerRef.current) return;

    const handleResize = () => {
      if (lossChartContainerRef.current) {
        const rect = lossChartContainerRef.current.getBoundingClientRect();
        // Use container width minus padding
        const availableWidth = rect.width - 30;
        setLossChartWidth(Math.min(availableWidth, 370));
      }
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(lossChartContainerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // Draw current dataset
  useEffect(() => {
    if (!svgRef.current || !network) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgDimensions.width;
    const height = svgDimensions.height;
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


  }, [network, dataType, svgDimensions]);

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
    initializeNetwork();
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
    if (isTraining) return;
    setActivationType(type);
    
    // Reset with new activation type immediately
    const nn = new SimpleNeuralNetwork(2, hiddenLayers.length, hiddenLayers[0]);
    nn.hiddenLayerSizes = [...hiddenLayers];
    nn.initializeWeightsAndBiases();
    nn.setActivationType(type);
    nn.setLearningRate(learningRate);
    
    const trainData = generateData(trainingSamples, dataType);
    const testData = generateData(Math.floor(trainingSamples * 0.2), dataType);
    nn.setTrainTestData(trainData, testData);
    
    setNetwork(nn);
    networkRef.current = nn;
    
    // Clear history
    setSnapshots([]);
    setCurrentSnapshotIndex(0);
    lastSnapshotEpoch.current = 0;
    setIsViewingHistory(false);
    setTaskSwitchPoints([]);
    setTaskHistory([{ task: dataType, startEpoch: 0 }]);
  };
  
  // Architecture change handlers
  const handleArchitectureChange = (newLayers) => {
    if (isTraining) return;
    setHiddenLayers(newLayers);
    
    // Reset with new architecture immediately
    const nn = new SimpleNeuralNetwork(2, newLayers.length, newLayers[0]);
    nn.hiddenLayerSizes = [...newLayers];
    nn.initializeWeightsAndBiases();
    nn.setActivationType(activationType);
    nn.setLearningRate(learningRate);
    
    const trainData = generateData(trainingSamples, dataType);
    const testData = generateData(Math.floor(trainingSamples * 0.2), dataType);
    nn.setTrainTestData(trainData, testData);
    
    setNetwork(nn);
    networkRef.current = nn;
    
    // Clear history
    setSnapshots([]);
    setCurrentSnapshotIndex(0);
    lastSnapshotEpoch.current = 0;
    setIsViewingHistory(false);
    setTaskSwitchPoints([]);
    setTaskHistory([{ task: dataType, startEpoch: 0 }]);
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

      {/* Control Panel - All controls in one flexible block */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #dee2e6',
        marginBottom: '15px',
        flexShrink: 0
      }}>


        {/* Flexible Controls Grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
          {/* Training Controls Section */}
          <div>
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

          {/* Architecture & Task Section */}
          <div style={{ 
            display: 'flex',
            gap: '15px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
              Activation:
              <select
                value={activationType}
                onChange={(e) => handleActivationTypeChange(e.target.value)}
                disabled={isTraining}
                style={{
                  padding: '3px',
                  fontSize: '12px',
                  borderRadius: '4px',
                  border: '1px solid #ced4da'
                }}
              >
                <option value="tanh">Tanh</option>
                <option value="relu">ReLU</option>
                <option value="leakyRelu">Leaky ReLU</option>
                <option value="sigmoid">Sigmoid</option>
              </select>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
              Layers:
              <input
                type="number"
                value={hiddenLayers.length}
                onChange={(e) => {
                  const depth = Math.max(1, Math.min(4, parseInt(e.target.value) || 1));
                  const newLayers = Array(depth).fill(hiddenLayers[0] || 4);
                  handleArchitectureChange(newLayers);
                }}
                min="1"
                max="4"
                style={{ 
                  width: '40px',
                  padding: '3px',
                  fontSize: '12px',
                  borderRadius: '4px',
                  border: '1px solid #ced4da'
                }}
                disabled={isTraining}
              />
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
              Width:
              <input
                type="number"
                value={hiddenLayers[0]}
                onChange={(e) => {
                  const width = Math.max(1, Math.min(8, parseInt(e.target.value) || 1));
                  const newLayers = hiddenLayers.map(() => width);
                  handleArchitectureChange(newLayers);
                }}
                min="1"
                max="8"
                style={{ 
                  width: '40px',
                  padding: '3px',
                  fontSize: '12px',
                  borderRadius: '4px',
                  border: '1px solid #ced4da'
                }}
                disabled={isTraining}
              />
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
              Task:
              <select
                value={dataType}
                onChange={(e) => handleTaskSwitch(e.target.value)}
                disabled={isTraining}
                style={{
                  padding: '3px',
                  fontSize: '12px',
                  borderRadius: '4px',
                  border: '1px solid #ced4da'
                }}
              >
                {tasks.map(task => (
                  <option key={task} value={task}>{task.toUpperCase()}</option>
                ))}
              </select>
            </label>
            {taskHistory.length > 1 && (
              <span style={{ fontSize: '10px', color: '#666' }}>
                History: {taskHistory.map((t) => 
                  `${t.task}(E${t.startEpoch})`
                ).join(' → ')}
              </span>
            )}
          </div>

          {/* Additional Settings */}
          <div style={{ 
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            alignItems: 'center'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
              Epochs/step:
              <input
                type="number"
                value={epochsPerStep}
                onChange={(e) => setEpochsPerStep(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="10"
                style={{ width: '45px' }}
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
                style={{ width: '55px' }}
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
            
            {showActivationHeatmaps && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
                Resolution:
                <input
                  type="number"
                  value={heatmapResolution}
                  onChange={(e) => setHeatmapResolution(Math.max(5, Math.min(30, parseInt(e.target.value) || 15)))}
                  min="5"
                  max="30"
                  style={{ width: '45px' }}
                />
              </label>
            )}
          </div>
        </div>
        
        {/* Model History Row - only show if snapshots exist */}
        {snapshots.length > 0 && (
          <div style={{ marginTop: '15px' }}>
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
          </div>
        )}
      </div>

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
            {/* Left Column: Training Data + Loss Chart */}
            <div style={{
              width: '400px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              {/* Training Data */}
              <div 
                ref={dataContainerRef}
                style={{ 
                  backgroundColor: '#f5f5f5',
                  padding: '15px',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1
                }}
              >
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Training Data</h4>
                <svg ref={svgRef} width={svgDimensions.width} height={svgDimensions.height} style={{ alignSelf: 'center' }} />
              </div>
              
              {/* Loss Chart */}
              <div 
                ref={lossChartContainerRef}
                style={{ 
                  flex: 1,
                  backgroundColor: '#f5f5f5',
                  padding: '15px',
                  borderRadius: '8px',
                  minHeight: '200px'
                }}
              >
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Training Progress</h4>
                <LossChart
                  trainLoss={network.trainingLoss}
                  testLoss={network.testLoss}
                  width={lossChartWidth}
                  height={180}
                  maxPoints={150}
                />
                {taskSwitchPoints.length > 0 && (
                  <div style={{ marginTop: '5px', fontSize: '10px', color: '#666' }}>
                    Switches: {taskSwitchPoints.map(e => `E${e}`).join(', ')}
                  </div>
                )}
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
              <div 
                style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}
                onClick={(e) => {
                  // Close popup when clicking on the background
                  if (e.target === e.currentTarget || e.target.tagName === 'svg') {
                    setSelectedNode(null);
                  }
                }}
              >
                <NetworkVisualization
                  network={network}
                  showWeights={true}
                  showActivationHeatmaps={showActivationHeatmaps}
                  heatmapResolution={heatmapResolution}
                  dynamicSize={true}
                  onNodeClick={setSelectedNode}
                />
                
                {/* Click-based Decision Boundary Popup */}
                {selectedNode && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: selectedNode.y > 200 ? selectedNode.y - 320 : selectedNode.y + 40,
                      left: selectedNode.x > 400 ? selectedNode.x - 320 : selectedNode.x + 40,
                      backgroundColor: 'white',
                      border: '2px solid #333',
                      borderRadius: '8px',
                      padding: '10px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      zIndex: 1000
                    }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '5px'
                    }}>
                      <h5 style={{ margin: 0, fontSize: '12px' }}>
                        Decision Boundary (Layer {selectedNode.layerIndex}, Neuron {selectedNode.neuronIndex + 1})
                      </h5>
                      <button 
                        onClick={() => setSelectedNode(null)}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '16px',
                          cursor: 'pointer',
                          padding: '0 5px',
                          color: '#666'
                        }}
                      >
                        ×
                      </button>
                    </div>
                    <ActivationHeatmap
                      network={network}
                      layerIndex={selectedNode.layerIndex}
                      neuronIndex={selectedNode.neuronIndex}
                      resolution={40}
                      width={300}
                      height={300}
                      inputBounds={[-6, 6]}
                      colorScheme="redblue"
                      showAxes={true}
                      title=""
                    />
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