import React, { useState } from 'react';
import TrainingControls from '../components/TrainingControls';

const TestTrainingControls = () => {
  const [isTraining, setIsTraining] = useState(false);
  const [learningRate, setLearningRate] = useState(0.01);
  const [activationType, setActivationType] = useState('tanh');
  const [batchSize, setBatchSize] = useState(32);
  const [epochsPerStep, setEpochsPerStep] = useState(1);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [trainLoss, setTrainLoss] = useState(0.693);
  const [testLoss, setTestLoss] = useState(0.702);
  const [intervalId, setIntervalId] = useState(null);

  const handleStart = () => {
    setIsTraining(true);
    
    // Simulate training progress
    const id = setInterval(() => {
      setCurrentEpoch(prev => prev + epochsPerStep);
      setTrainLoss(prev => Math.max(0.1, prev * 0.95 + Math.random() * 0.02));
      setTestLoss(prev => Math.max(0.12, prev * 0.94 + Math.random() * 0.03));
    }, 1000);
    
    setIntervalId(id);
  };

  const handleStop = () => {
    setIsTraining(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const handleReset = () => {
    setCurrentEpoch(0);
    setTrainLoss(0.693);
    setTestLoss(0.702);
    setLearningRate(0.01);
    setActivationType('tanh');
    setBatchSize(32);
    setEpochsPerStep(1);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Training Controls Test</h2>
      <p>Test the TrainingControls component with simulated training.</p>
      
      <div style={{ marginBottom: '40px' }}>
        <h3>Default Configuration</h3>
        <TrainingControls
          isTraining={isTraining}
          onStart={handleStart}
          onStop={handleStop}
          onReset={handleReset}
          learningRate={learningRate}
          onLearningRateChange={setLearningRate}
          activationType={activationType}
          onActivationTypeChange={setActivationType}
          batchSize={batchSize}
          onBatchSizeChange={setBatchSize}
          epochsPerStep={epochsPerStep}
          onEpochsPerStepChange={setEpochsPerStep}
          currentEpoch={currentEpoch}
          trainLoss={trainLoss}
          testLoss={testLoss}
        />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h3>Minimal Configuration (No Batch Size or Epochs Control)</h3>
        <TrainingControls
          isTraining={isTraining}
          onStart={handleStart}
          onStop={handleStop}
          onReset={handleReset}
          learningRate={learningRate}
          onLearningRateChange={setLearningRate}
          activationType={activationType}
          onActivationTypeChange={setActivationType}
          currentEpoch={currentEpoch}
          trainLoss={trainLoss}
          testLoss={testLoss}
        />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h3>Without Loss Display</h3>
        <TrainingControls
          isTraining={isTraining}
          onStart={handleStart}
          onStop={handleStop}
          onReset={handleReset}
          learningRate={learningRate}
          onLearningRateChange={setLearningRate}
          activationType={activationType}
          onActivationTypeChange={setActivationType}
          batchSize={batchSize}
          onBatchSizeChange={setBatchSize}
          currentEpoch={currentEpoch}
        />
      </div>

      <div style={{ 
        backgroundColor: '#f5f5f5',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h3>Current State</h3>
        <pre style={{ fontSize: '14px' }}>
{JSON.stringify({
  isTraining,
  learningRate,
  activationType,
  batchSize,
  epochsPerStep,
  currentEpoch,
  trainLoss: trainLoss.toFixed(4),
  testLoss: testLoss.toFixed(4)
}, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>Component Features:</p>
        <ul>
          <li>Start/Stop/Reset training controls</li>
          <li>Learning rate slider (0.001 to 0.1)</li>
          <li>Activation function dropdown</li>
          <li>Optional batch size control</li>
          <li>Optional epochs per step control</li>
          <li>Current epoch display</li>
          <li>Train/test loss display (optional)</li>
          <li>Disabled state during training</li>
          <li>Responsive grid layout</li>
        </ul>
      </div>
    </div>
  );
};

export default TestTrainingControls;