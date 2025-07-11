import React, { useState, useRef, useEffect } from 'react';
import { SimpleNeuralNetwork } from '../neural-network/NeuralNetwork';
import { generateData } from '../utils/dataGeneration';
import NetworkVisualization from '../components/NetworkVisualization';
import LossChart from '../components/LossChart';
import TrainingControls from '../components/TrainingControls';

const IntegratedTrainingDemoSimple = () => {
  const [network, setNetwork] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [learningRate, setLearningRate] = useState(0.01);
  const [activationType, setActivationType] = useState('tanh');
  const trainingRef = useRef(false);

  // Initialize network
  useEffect(() => {
    const nn = new SimpleNeuralNetwork(2, 2, 4);
    const trainData = generateData(100, 'xor');
    const testData = generateData(20, 'xor');
    nn.setTrainTestData(trainData, testData);
    setNetwork(nn);
  }, []);

  // Training loop
  useEffect(() => {
    if (!isTraining || !network) return;

    trainingRef.current = true;
    
    const intervalId = setInterval(() => {
      if (!trainingRef.current) {
        clearInterval(intervalId);
        return;
      }

      // Train one epoch
      const trainData = network.currentTrainData;
      const testData = network.currentTestData;
      
      network.trainOneEpoch(
        trainData.data,
        trainData.labels,
        testData.data,
        testData.labels,
        32
      );

      // Force re-render by updating a counter or timestamp
      setNetwork(network.clone());
    }, 100); // 100ms between epochs

    return () => {
      trainingRef.current = false;
      clearInterval(intervalId);
    };
  }, [isTraining]); // Remove network from dependencies to avoid infinite loop

  const handleStart = () => {
    setIsTraining(true);
  };

  const handleStop = () => {
    setIsTraining(false);
    trainingRef.current = false;
  };

  const handleReset = () => {
    handleStop();
    const nn = new SimpleNeuralNetwork(2, 2, 4);
    nn.setActivationType(activationType);
    nn.setLearningRate(learningRate);
    
    const trainData = generateData(100, 'xor');
    const testData = generateData(20, 'xor');
    nn.setTrainTestData(trainData, testData);
    
    setNetwork(nn);
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
      <h2>Integrated Training Demo (Simple)</h2>
      <p>Testing basic training functionality with XOR dataset.</p>

      <TrainingControls
        isTraining={isTraining}
        onStart={handleStart}
        onStop={handleStop}
        onReset={handleReset}
        learningRate={learningRate}
        onLearningRateChange={handleLearningRateChange}
        activationType={activationType}
        onActivationTypeChange={handleActivationTypeChange}
        currentEpoch={network?.currentEpoch || 0}
        trainLoss={network?.trainingLoss[network.trainingLoss.length - 1] || null}
        testLoss={network?.testLoss[network.testLoss.length - 1] || null}
      />

      {network && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
          }}>
            <div style={{ 
              backgroundColor: '#f5f5f5',
              padding: '20px',
              borderRadius: '8px'
            }}>
              <h3>Network Architecture</h3>
              <NetworkVisualization
                network={network}
                width={400}
                height={300}
                showWeights={true}
              />
            </div>

            <div style={{ 
              backgroundColor: '#f5f5f5',
              padding: '20px',
              borderRadius: '8px'
            }}>
              <h3>Training Progress</h3>
              <LossChart
                trainLoss={network.trainingLoss}
                testLoss={network.testLoss}
                width={400}
                height={300}
              />
            </div>
          </div>

          <div style={{ 
            marginTop: '20px',
            padding: '10px',
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            <strong>Debug Info:</strong> 
            Epoch: {network.currentEpoch}, 
            Train samples: {network.currentTrainData.data.length}, 
            Test samples: {network.currentTestData.data.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegratedTrainingDemoSimple;