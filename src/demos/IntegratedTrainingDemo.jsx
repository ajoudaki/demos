import React, { useState, useRef, useCallback, useEffect } from 'react';
import { SimpleNeuralNetwork } from '../neural-network/NeuralNetwork';
import { generateData } from '../utils/dataGeneration';
import NetworkVisualization from '../components/NetworkVisualization';
import LossChart from '../components/LossChart';
import ActivationHeatmap from '../components/ActivationHeatmap';
import TrainingControls from '../components/TrainingControls';
import * as d3 from 'd3';

const IntegratedTrainingDemo = () => {
  const [network, setNetwork] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [learningRate, setLearningRate] = useState(0.01);
  const [activationType, setActivationType] = useState('tanh');
  const [batchSize, setBatchSize] = useState(32);
  const [epochsPerStep, setEpochsPerStep] = useState(1);
  const [dataType, setDataType] = useState('xor');
  const [trainingSamples, setTrainingSamples] = useState(100);
  const [selectedNeuron, setSelectedNeuron] = useState({ layer: 0, index: 0 });
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [showActivationHeatmaps, setShowActivationHeatmaps] = useState(true);
  
  const animationRef = useRef(null);
  const svgRef = useRef(null);
  const networkRef = useRef(null);
  const epochsPerStepRef = useRef(epochsPerStep);
  const batchSizeRef = useRef(batchSize);

  // Update refs when values change
  useEffect(() => {
    epochsPerStepRef.current = epochsPerStep;
  }, [epochsPerStep]);

  useEffect(() => {
    batchSizeRef.current = batchSize;
  }, [batchSize]);

  // Initialize network
  useEffect(() => {
    const nn = new SimpleNeuralNetwork(2, 2, 4);
    const trainData = generateData(trainingSamples, dataType);
    const testData = generateData(Math.floor(trainingSamples * 0.2), dataType);
    nn.setTrainTestData(trainData, testData);
    setNetwork(nn);
    networkRef.current = nn;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Draw data points
  useEffect(() => {
    if (!svgRef.current || !network) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 400;
    const height = 400;
    const margin = 40;

    const xScale = d3.scaleLinear()
      .domain([-6, 6])
      .range([margin, width - margin]);

    const yScale = d3.scaleLinear()
      .domain([-6, 6])
      .range([height - margin, margin]);

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin})`)
      .call(d3.axisBottom(xScale));

    svg.append('g')
      .attr('transform', `translate(${margin},0)`)
      .call(d3.axisLeft(yScale));

    // Plot training data
    const trainData = network.currentTrainData;
    svg.selectAll('circle')
      .data(trainData.data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d[0]))
      .attr('cy', d => yScale(d[1]))
      .attr('r', 4)
      .attr('fill', (d, i) => trainData.labels[i] === 1 ? '#3498db' : '#e74c3c')
      .attr('stroke', 'black')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.8);

    // Add labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('x₁');

    svg.append('text')
      .attr('transform', `translate(12,${height / 2}) rotate(-90)`)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('x₂');

  }, [network, dataType]);

  const trainStep = () => {
    if (!networkRef.current || animationRef.current === null) return;

    const network = networkRef.current;
    const trainData = network.currentTrainData;
    const testData = network.currentTestData;

    // Check if we have data
    if (!trainData.data || trainData.data.length === 0) {
      console.error('No training data available');
      return;
    }

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

    // Trigger re-render
    setUpdateTrigger(prev => prev + 1);

    // Continue training if still training
    if (animationRef.current !== null) {
      animationRef.current = requestAnimationFrame(trainStep);
    }
  };

  const handleStart = () => {
    if (!network) return;
    setIsTraining(true);
    animationRef.current = 1; // Set to non-null to indicate training
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
    setUpdateTrigger(0);
  };

  const handleDataTypeChange = (newType) => {
    handleStop();
    setDataType(newType);
    
    if (network) {
      const trainData = generateData(trainingSamples, newType);
      const testData = generateData(Math.floor(trainingSamples * 0.2), newType);
      network.setTrainTestData(trainData, testData);
      networkRef.current = network;
      setUpdateTrigger(prev => prev + 1);
    }
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

  return (
    <div style={{ padding: '20px' }}>
      <h2>Integrated Training Demo</h2>
      <p>Live visualization of neural network training on 2D classification tasks.</p>

      {/* Data Controls */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div>
          <label htmlFor="data-type" style={{ marginRight: '10px' }}>
            Dataset:
          </label>
          <select
            id="data-type"
            value={dataType}
            onChange={(e) => handleDataTypeChange(e.target.value)}
            disabled={isTraining}
            style={{
              padding: '5px',
              fontSize: '14px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          >
            <option value="xor">XOR</option>
            <option value="spiral">Spiral</option>
            <option value="circle">Circle</option>
            <option value="ring">Ring</option>
            <option value="gaussian">Gaussian</option>
          </select>
        </div>

        <div>
          <label htmlFor="samples" style={{ marginRight: '10px' }}>
            Training Samples:
          </label>
          <select
            id="samples"
            value={trainingSamples}
            onChange={(e) => setTrainingSamples(Number(e.target.value))}
            disabled={isTraining}
            style={{
              padding: '5px',
              fontSize: '14px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={500}>500</option>
          </select>
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
        epochsPerStep={epochsPerStep}
        onEpochsPerStepChange={setEpochsPerStep}
        currentEpoch={network?.currentEpoch || 0}
        trainLoss={network?.trainingLoss[network.trainingLoss.length - 1] || null}
        testLoss={network?.testLoss[network.testLoss.length - 1] || null}
      />

      {network && (
        <>
          {/* Main Visualizations */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginTop: '20px'
          }}>
            {/* Data and Network */}
            <div style={{ 
              backgroundColor: '#f5f5f5',
              padding: '20px',
              borderRadius: '8px'
            }}>
              <h3>Data Distribution</h3>
              <svg ref={svgRef} width={400} height={400} />
            </div>

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
                width={400}
                height={400}
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
              height={200}
            />
          </div>

          {/* Activation Heatmaps */}
          <div style={{ 
            backgroundColor: '#f5f5f5',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <h3>Neuron Activations</h3>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="neuron-select" style={{ marginRight: '10px' }}>
                Select Neuron:
              </label>
              <select
                id="neuron-select"
                value={`${selectedNeuron.layer}-${selectedNeuron.index}`}
                onChange={(e) => {
                  const [layer, index] = e.target.value.split('-').map(Number);
                  setSelectedNeuron({ layer, index });
                }}
                style={{
                  padding: '5px',
                  fontSize: '14px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              >
                <optgroup label="Hidden Layer 1">
                  {[0, 1, 2, 3].map(i => (
                    <option key={`0-${i}`} value={`0-${i}`}>Layer 1, Neuron {i + 1}</option>
                  ))}
                </optgroup>
                <optgroup label="Hidden Layer 2">
                  {[0, 1, 2, 3].map(i => (
                    <option key={`1-${i}`} value={`1-${i}`}>Layer 2, Neuron {i + 1}</option>
                  ))}
                </optgroup>
                <option value="2-0">Output Layer</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <ActivationHeatmap
                network={network}
                layerIndex={selectedNeuron.layer}
                neuronIndex={selectedNeuron.index}
                resolution={30}
                width={300}
                height={300}
                colorScheme="redblue"
                title={`Selected: ${selectedNeuron.layer === 2 ? 'Output' : `Layer ${selectedNeuron.layer + 1}, Neuron ${selectedNeuron.index + 1}`}`}
              />
              
              <ActivationHeatmap
                network={network}
                layerIndex={2}
                neuronIndex={0}
                resolution={30}
                width={300}
                height={300}
                colorScheme="redblue"
                title="Network Output"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default IntegratedTrainingDemo;