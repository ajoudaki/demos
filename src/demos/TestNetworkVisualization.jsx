import React, { useState } from 'react';
import { SimpleNeuralNetwork } from '../neural-network/NeuralNetwork';
import NetworkVisualization from '../components/NetworkVisualization';
import { generateXorData } from '../utils/dataGeneration';

const TestNetworkVisualization = () => {
  const [network, setNetwork] = useState(null);
  const [showWeights, setShowWeights] = useState(false);
  const [isTraining, setIsTraining] = useState(false);

  const createNetwork = () => {
    const nn = new SimpleNeuralNetwork(2, 2, 4);
    setNetwork(nn);
  };

  const trainStep = () => {
    if (!network) return;
    
    setIsTraining(true);
    const trainData = generateXorData(100);
    const testData = generateXorData(20);
    
    network.setTrainTestData(trainData, testData);
    
    // Train for one epoch
    network.trainOneEpoch(
      trainData.data,
      trainData.labels,
      testData.data,
      testData.labels
    );
    
    // Force re-render by creating new network reference
    setNetwork(network.clone());
    setIsTraining(false);
  };

  const randomizeWeights = () => {
    if (!network) return;
    network.reset();
    setNetwork(network.clone());
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Network Visualization Test</h2>
      <p>Test the NetworkVisualization component with a simple neural network.</p>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={createNetwork}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Create Network
        </button>
        
        <button 
          onClick={trainStep}
          disabled={!network || isTraining}
          style={{
            padding: '8px 16px',
            backgroundColor: !network || isTraining ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !network || isTraining ? 'not-allowed' : 'pointer'
          }}
        >
          {isTraining ? 'Training...' : 'Train One Epoch'}
        </button>
        
        <button 
          onClick={randomizeWeights}
          disabled={!network}
          style={{
            padding: '8px 16px',
            backgroundColor: !network ? '#ccc' : '#ffc107',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !network ? 'not-allowed' : 'pointer'
          }}
        >
          Randomize Weights
        </button>
        
        <label style={{ display: 'flex', alignItems: 'center', marginLeft: '20px' }}>
          <input 
            type="checkbox" 
            checked={showWeights}
            onChange={(e) => setShowWeights(e.target.checked)}
            style={{ marginRight: '5px' }}
          />
          Show Weights on Hover
        </label>
      </div>

      {network ? (
        <div style={{ 
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <NetworkVisualization 
            network={network}
            width={600}
            height={300}
            showWeights={showWeights}
          />
          
          <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            <p>Network Architecture:</p>
            <ul>
              <li>Input Layer: 2 neurons (X₁, X₂)</li>
              <li>Hidden Layer 1: 4 neurons ({network.activationType})</li>
              <li>Hidden Layer 2: 4 neurons ({network.activationType})</li>
              <li>Output Layer: 1 neuron (sigmoid)</li>
            </ul>
            <p>Visualization Features:</p>
            <ul>
              <li>Blue connections: positive weights</li>
              <li>Red connections: negative weights</li>
              <li>Line thickness: weight magnitude</li>
              <li>Current epoch: {network.currentEpoch}</li>
            </ul>
          </div>
        </div>
      ) : (
        <div style={{ 
          padding: '40px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#666'
        }}>
          Click "Create Network" to start
        </div>
      )}
    </div>
  );
};

export default TestNetworkVisualization;