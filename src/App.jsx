import React from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
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
import MainDemo from './demos/MainDemo'
import TestNetworkVisualizationWithHeatmaps from './demos/TestNetworkVisualizationWithHeatmaps'
import UnifiedContinualLearningDemo from './demos/UnifiedContinualLearningDemo'

const routes = [
  { path: '/', name: 'Home', component: MainDemo },
  { path: '/demo', name: 'Original Demo', component: ContinualLearningDemoWrapper },
  { path: '/test-nn', name: 'Test Neural Network', component: TestNeuralNetwork },
  { path: '/test-data', name: 'Test Data Generation', component: TestDataGeneration },
  { path: '/test-network-vis', name: 'Test Network Visualization', component: TestNetworkVisualization },
  { path: '/test-network-vis-heatmaps', name: 'Network Visualization with Heatmaps', component: TestNetworkVisualizationWithHeatmaps },
  { path: '/test-loss-chart', name: 'Test Loss Chart', component: TestLossChart },
  { path: '/test-heatmap', name: 'Test Heatmap', component: TestHeatmapVisualization },
  { path: '/test-activation-heatmap', name: 'Test Activation Heatmap', component: TestActivationHeatmap },
  { path: '/test-training-controls', name: 'Test Training Controls', component: TestTrainingControls },
  { path: '/continual-learning', name: 'Continual Learning', component: UnifiedContinualLearningDemo },
];

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <Routes>
        {routes.map(route => (
          <Route 
            key={route.path} 
            path={route.path} 
            element={<route.component />} 
          />
        ))}
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App