import React, { useState, useEffect } from 'react';
import { SimpleNeuralNetwork } from '../neural-network/NeuralNetwork';

const TestNeuralNetwork = () => {
  const [trainLoss, setTrainLoss] = useState(null);
  const [testLoss, setTestLoss] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);

  // Generate simple XOR data for testing
  const generateXORData = (numSamples) => {
    const data = [];
    const labels = [];
    for (let i = 0; i < numSamples; i++) {
      const x = Math.random() * 2 - 1;
      const y = Math.random() * 2 - 1;
      data.push([x, y]);
      const label = (x > 0) ^ (y > 0) ? 1 : 0;
      labels.push(label);
    }
    return { data, labels };
  };

  const trainNetwork = () => {
    setIsTraining(true);
    
    // Create network
    const nn = new SimpleNeuralNetwork(2, 2, 8); // 2 inputs, 2 hidden layers, 8 neurons per layer
    
    // Generate data
    const trainData = generateXORData(200);
    const testData = generateXORData(50);
    
    nn.setTrainTestData(trainData, testData);
    
    // Train for a few epochs
    let epoch = 0;
    const trainInterval = setInterval(() => {
      const result = nn.trainOneEpoch(
        trainData.data, 
        trainData.labels, 
        testData.data, 
        testData.labels
      );
      
      setTrainLoss(result.trainLoss.toFixed(4));
      setTestLoss(result.testLoss.toFixed(4));
      setCurrentEpoch(epoch + 1);
      
      epoch++;
      if (epoch >= 50) {
        clearInterval(trainInterval);
        setIsTraining(false);
      }
    }, 100);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Neural Network Test</h2>
      <p>This is a simple test to verify the neural network works independently.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={trainNetwork} 
          disabled={isTraining}
          style={{
            padding: '10px 20px',
            backgroundColor: isTraining ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isTraining ? 'not-allowed' : 'pointer'
          }}
        >
          {isTraining ? 'Training...' : 'Train XOR Network'}
        </button>
      </div>
      
      {currentEpoch > 0 && (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '8px',
          fontFamily: 'monospace'
        }}>
          <div>Epoch: {currentEpoch}</div>
          <div>Training Loss: {trainLoss}</div>
          <div>Test Loss: {testLoss}</div>
          <div>Status: {isTraining ? 'Training...' : 'Completed'}</div>
        </div>
      )}
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>This test trains a neural network on the XOR problem:</p>
        <ul>
          <li>2 input neurons (X and Y coordinates)</li>
          <li>2 hidden layers with 8 neurons each</li>
          <li>1 output neuron (binary classification)</li>
          <li>Using tanh activation and binary cross-entropy loss</li>
        </ul>
      </div>
    </div>
  );
};

export default TestNeuralNetwork;