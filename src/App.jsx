import React, { useState } from 'react'
import ContinualLearningDemoWrapper from './demos/ContinualLearningDemoWrapper'
import TestNeuralNetwork from './demos/TestNeuralNetwork'
import TestDataGeneration from './demos/TestDataGeneration'
import TestNetworkVisualization from './demos/TestNetworkVisualization'
import TestLossChart from './demos/TestLossChart'
import TestHeatmapVisualization from './demos/TestHeatmapVisualization'
import TestActivationHeatmap from './demos/TestActivationHeatmap'
import TestTrainingControls from './demos/TestTrainingControls'
import IntegratedTrainingDemo from './demos/IntegratedTrainingDemo'
import IntegratedTrainingDemoSimple from './demos/IntegratedTrainingDemoSimple'
import ContinualLearningFeatureDemo from './demos/ContinualLearningFeatureDemo'
import ModelHistoryDemo from './demos/ModelHistoryDemo'

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
          <option value="test-loss-chart">Test Loss Chart</option>
          <option value="test-heatmap">Test Heatmap</option>
          <option value="test-activation-heatmap">Test Activation Heatmap</option>
          <option value="test-training-controls">Test Training Controls</option>
          <option value="integrated-training">Integrated Training Demo</option>
          <option value="integrated-training-simple">Integrated Training (Simple)</option>
          <option value="continual-learning">Continual Learning</option>
          <option value="model-history">Model History</option>
        </select>
      </div>
      
      {currentView === 'demo' && <ContinualLearningDemoWrapper />}
      {currentView === 'test-nn' && <TestNeuralNetwork />}
      {currentView === 'test-data' && <TestDataGeneration />}
      {currentView === 'test-network-vis' && <TestNetworkVisualization />}
      {currentView === 'test-loss-chart' && <TestLossChart />}
      {currentView === 'test-heatmap' && <TestHeatmapVisualization />}
      {currentView === 'test-activation-heatmap' && <TestActivationHeatmap />}
      {currentView === 'test-training-controls' && <TestTrainingControls />}
      {currentView === 'integrated-training' && <IntegratedTrainingDemo />}
      {currentView === 'integrated-training-simple' && <IntegratedTrainingDemoSimple />}
      {currentView === 'continual-learning' && <ContinualLearningFeatureDemo />}
      {currentView === 'model-history' && <ModelHistoryDemo />}
    </div>
  )
}

export default App