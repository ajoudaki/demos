import React, { useState, useEffect } from 'react';
import LossChart from '../components/LossChart';

const TestLossChart = () => {
  const [trainLoss, setTrainLoss] = useState([]);
  const [testLoss, setTestLoss] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  // Generate dummy loss data that simulates training
  const generateLossData = () => {
    const epochs = trainLoss.length;
    
    // Simulate decaying loss with some noise
    const trainBase = 1.0 * Math.exp(-epochs * 0.05);
    const testBase = 1.1 * Math.exp(-epochs * 0.045);
    
    const newTrainLoss = trainBase + Math.random() * 0.1;
    const newTestLoss = testBase + Math.random() * 0.15;
    
    setTrainLoss(prev => [...prev, newTrainLoss]);
    setTestLoss(prev => [...prev, newTestLoss]);
  };

  const startGenerating = () => {
    if (intervalId) return;
    
    setIsGenerating(true);
    const id = setInterval(generateLossData, 500);
    setIntervalId(id);
  };

  const stopGenerating = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsGenerating(false);
  };

  const reset = () => {
    stopGenerating();
    setTrainLoss([]);
    setTestLoss([]);
  };

  const addBatch = () => {
    for (let i = 0; i < 10; i++) {
      generateLossData();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Loss Chart Test</h2>
      <p>Test the LossChart component with simulated training data.</p>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={startGenerating}
          disabled={isGenerating}
          style={{
            padding: '8px 16px',
            backgroundColor: isGenerating ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isGenerating ? 'not-allowed' : 'pointer'
          }}
        >
          Start Auto-Generate
        </button>
        
        <button 
          onClick={stopGenerating}
          disabled={!isGenerating}
          style={{
            padding: '8px 16px',
            backgroundColor: !isGenerating ? '#ccc' : '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !isGenerating ? 'not-allowed' : 'pointer'
          }}
        >
          Stop
        </button>
        
        <button 
          onClick={addBatch}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add 10 Points
        </button>
        
        <button 
          onClick={reset}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>

      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ 
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px'
        }}>
          <h3>Default Size (400x200)</h3>
          <LossChart 
            trainLoss={trainLoss}
            testLoss={testLoss}
          />
        </div>

        <div style={{ 
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px'
        }}>
          <h3>Large Size (600x300)</h3>
          <LossChart 
            trainLoss={trainLoss}
            testLoss={testLoss}
            width={600}
            height={300}
          />
        </div>
      </div>

      <div style={{ 
        backgroundColor: '#f5f5f5',
        padding: '20px',
        borderRadius: '8px'
      }}>
        <h3>Fixed Y-Domain (0 to 2)</h3>
        <LossChart 
          trainLoss={trainLoss}
          testLoss={testLoss}
          width={800}
          height={250}
          yDomain={[0, 2]}
        />
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>Current Statistics:</p>
        <ul>
          <li>Epochs: {trainLoss.length}</li>
          <li>Latest Train Loss: {trainLoss.length > 0 ? trainLoss[trainLoss.length - 1].toFixed(4) : 'N/A'}</li>
          <li>Latest Test Loss: {testLoss.length > 0 ? testLoss[testLoss.length - 1].toFixed(4) : 'N/A'}</li>
          <li>Auto-generating: {isGenerating ? 'Yes' : 'No'}</li>
        </ul>
        <p>Component Features:</p>
        <ul>
          <li>Displays train (blue) and test (red) loss curves</li>
          <li>Automatically scales Y-axis or uses fixed domain</li>
          <li>Shows latest values at bottom left</li>
          <li>Includes legend</li>
          <li>Configurable size and max points to display</li>
          <li>Smooth curve interpolation</li>
        </ul>
      </div>
    </div>
  );
};

export default TestLossChart;