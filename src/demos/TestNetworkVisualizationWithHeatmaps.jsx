import React, { useState, useEffect } from 'react';
import NetworkVisualization from '../components/NetworkVisualization';
import { SimpleNeuralNetwork } from '../neural-network/NeuralNetwork';
import { generateData } from '../utils/dataGeneration';

const TestNetworkVisualizationWithHeatmaps = () => {
  const [network, setNetwork] = useState(null);
  const [showHeatmaps, setShowHeatmaps] = useState(true);
  const [heatmapResolution, setHeatmapResolution] = useState(20);
  const [trainedEpochs, setTrainedEpochs] = useState(0);

  useEffect(() => {
    // Create a simple neural network
    const nn = new SimpleNeuralNetwork(2, 2, 4);
    nn.setActivationType('tanh');
    nn.setLearningRate(0.01);
    
    // Generate some training data
    const trainData = generateData(100, 'spiral');
    const testData = generateData(20, 'spiral');
    nn.setTrainTestData(trainData, testData);
    
    setNetwork(nn);
  }, []);

  const handleTrain = () => {
    if (!network) return;
    
    // Train for 50 epochs
    const trainData = network.currentTrainData;
    const testData = network.currentTestData;
    
    for (let i = 0; i < 50; i++) {
      network.trainOneEpoch(
        trainData.data,
        trainData.labels,
        testData.data,
        testData.labels,
        32
      );
    }
    
    setTrainedEpochs(prev => prev + 50);
    setNetwork(network.clone());
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Network Visualization with Activation Heatmaps</h2>
      <p>This demo shows how neurons can display their activation patterns across the 2D input space.</p>

      <div style={{ 
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        <button
          onClick={handleTrain}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Train 50 Epochs
        </button>

        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            checked={showHeatmaps}
            onChange={(e) => setShowHeatmaps(e.target.checked)}
            style={{ width: '20px', height: '20px' }}
          />
          <span>Show Activation Heatmaps</span>
        </label>

        {showHeatmaps && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            Resolution:
            <input
              type="range"
              min="5"
              max="30"
              value={heatmapResolution}
              onChange={(e) => setHeatmapResolution(parseInt(e.target.value))}
              style={{ width: '100px' }}
            />
            <span>{heatmapResolution}</span>
          </label>
        )}

        <span style={{ color: '#666' }}>
          Epochs trained: {trainedEpochs}
        </span>
      </div>

      {network && (
        <>
          <div style={{ 
            backgroundColor: '#f5f5f5',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h3>Network Architecture</h3>
            <NetworkVisualization
              network={network}
              width={800}
              height={400}
              showWeights={true}
              showActivationHeatmaps={showHeatmaps}
              heatmapResolution={heatmapResolution}
            />
          </div>

          <div style={{
            backgroundColor: '#e8f4f8',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #b8e0ea'
          }}>
            <h4 style={{ marginTop: 0 }}>About Activation Heatmaps</h4>
            <ul style={{ marginBottom: 0 }}>
              <li>Each neuron displays its activation pattern across the 2D input space</li>
              <li>Square nodes with rounded corners show the full activation range</li>
              <li>Input neurons (X₁, X₂) show gradients along their respective axes</li>
              <li>Hidden and output neurons show how they respond to all input combinations</li>
              <li>Red indicates positive activation, blue indicates negative activation</li>
              <li>Train the network to see how activation patterns evolve</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default TestNetworkVisualizationWithHeatmaps;