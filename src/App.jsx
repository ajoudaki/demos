import React, { useState } from 'react'
import ContinualLearningDemoWrapper from './demos/ContinualLearningDemoWrapper'
import TestNeuralNetwork from './demos/TestNeuralNetwork'
import TestDataGeneration from './demos/TestDataGeneration'
import TestNetworkVisualization from './demos/TestNetworkVisualization'

function App() {
  const [currentView, setCurrentView] = useState('demo');

  return (
    <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0 }}>
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        right: '10px', 
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <select 
          value={currentView}
          onChange={(e) => setCurrentView(e.target.value)}
          style={{
            padding: '8px 12px',
            fontSize: '14px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          <option value="demo">Main Demo</option>
          <option value="test-nn">Test Neural Network</option>
          <option value="test-data">Test Data Generation</option>
          <option value="test-network-vis">Test Network Visualization</option>
        </select>
      </div>
      
      {currentView === 'demo' && <ContinualLearningDemoWrapper />}
      {currentView === 'test-nn' && <TestNeuralNetwork />}
      {currentView === 'test-data' && <TestDataGeneration />}
      {currentView === 'test-network-vis' && <TestNetworkVisualization />}
    </div>
  )
}

export default App