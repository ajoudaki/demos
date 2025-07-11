import React, { useState, useEffect } from 'react';
import { SimpleNeuralNetwork } from '../neural-network/NeuralNetwork';
import ActivationHeatmap from '../components/ActivationHeatmap';
import { generateData } from '../utils/dataGeneration';

const TestActivationHeatmap = () => {
  const [network, setNetwork] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState(0);
  const [resolution, setResolution] = useState(30);
  const [colorScheme, setColorScheme] = useState('redblue');
  const [isTraining, setIsTraining] = useState(false);
  const [dataType, setDataType] = useState('xor');

  useEffect(() => {
    // Create network on mount
    const nn = new SimpleNeuralNetwork(2, 2, 4);
    setNetwork(nn);
  }, []);

  const trainNetwork = () => {
    if (!network || isTraining) return;
    
    setIsTraining(true);
    
    // Generate training data
    const trainData = generateData(100, dataType);
    const testData = generateData(20, dataType);
    
    network.setTrainTestData(trainData, testData);
    
    // Train for multiple epochs
    const trainEpochs = 50;
    for (let i = 0; i < trainEpochs; i++) {
      network.trainOneEpoch(
        trainData.data,
        trainData.labels,
        testData.data,
        testData.labels
      );
    }
    
    // Force re-render with new network reference
    setNetwork(network.clone());
    setIsTraining(false);
  };

  const resetNetwork = () => {
    if (!network) return;
    network.reset();
    setNetwork(network.clone());
  };

  const getLayerInfo = () => {
    if (!network) return [];
    
    const layers = [
      { index: -1, name: 'Input Layer', neurons: 2 },
      { index: 0, name: 'Hidden Layer 1', neurons: network.neuronsPerLayer },
      { index: 1, name: 'Hidden Layer 2', neurons: network.neuronsPerLayer },
      { index: 2, name: 'Output Layer', neurons: 1 }
    ];
    
    return layers;
  };

  const layers = getLayerInfo();
  const currentLayer = layers[selectedLayer + 1]; // +1 because -1 is input layer

  return (
    <div style={{ padding: '20px' }}>
      <h2>Activation Heatmap Test</h2>
      <p>Visualize how each neuron responds across the 2D input space.</p>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div>
          <label htmlFor="layer" style={{ marginRight: '10px' }}>
            Layer:
          </label>
          <select
            id="layer"
            value={selectedLayer}
            onChange={(e) => setSelectedLayer(Number(e.target.value))}
            style={{
              padding: '5px',
              fontSize: '14px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          >
            {layers.map(layer => (
              <option key={layer.index} value={layer.index}>
                {layer.name} ({layer.neurons} neurons)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dataType" style={{ marginRight: '10px' }}>
            Data Type:
          </label>
          <select
            id="dataType"
            value={dataType}
            onChange={(e) => setDataType(e.target.value)}
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
            <option value="gaussian">Gaussian</option>
          </select>
        </div>

        <div>
          <label htmlFor="colorScheme" style={{ marginRight: '10px' }}>
            Color:
          </label>
          <select
            id="colorScheme"
            value={colorScheme}
            onChange={(e) => setColorScheme(e.target.value)}
            style={{
              padding: '5px',
              fontSize: '14px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          >
            <option value="redblue">Red-Blue</option>
            <option value="viridis">Viridis</option>
            <option value="plasma">Plasma</option>
          </select>
        </div>

        <div>
          <label htmlFor="resolution" style={{ marginRight: '10px' }}>
            Resolution:
          </label>
          <select
            id="resolution"
            value={resolution}
            onChange={(e) => setResolution(Number(e.target.value))}
            style={{
              padding: '5px',
              fontSize: '14px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          >
            <option value={20}>20×20</option>
            <option value={30}>30×30</option>
            <option value={40}>40×40</option>
            <option value={50}>50×50</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={trainNetwork}
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
          {isTraining ? 'Training...' : `Train Network (50 epochs on ${dataType})`}
        </button>
        
        <button 
          onClick={resetNetwork}
          disabled={!network}
          style={{
            padding: '8px 16px',
            backgroundColor: !network ? '#ccc' : '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !network ? 'not-allowed' : 'pointer'
          }}
        >
          Reset Weights
        </button>
      </div>

      {network && currentLayer && (
        <div style={{ 
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px'
        }}>
          <h3>{currentLayer.name} Activation Heatmaps</h3>
          <p style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
            Each heatmap shows how a single neuron responds to all possible (x₁, x₂) input combinations.
            {selectedLayer === -1 && ' For input layer, this just shows the input values themselves.'}
            {selectedLayer === 2 && ' For output layer, this shows the final network prediction.'}
          </p>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: selectedLayer === 2 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            justifyItems: 'center'
          }}>
            {Array.from({ length: currentLayer.neurons }, (_, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <ActivationHeatmap
                  network={network}
                  layerIndex={selectedLayer}
                  neuronIndex={i}
                  resolution={resolution}
                  width={200}
                  height={200}
                  colorScheme={colorScheme}
                  showAxes={true}
                  title={selectedLayer === -1 ? `Input x${i + 1}` : 
                         selectedLayer === 2 ? 'Output' : 
                         `Neuron ${i + 1}`}
                />
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            <p>Network Info:</p>
            <ul>
              <li>Architecture: 2 → 4 → 4 → 1</li>
              <li>Activation: {network.activationType} (hidden layers), sigmoid (output)</li>
              <li>Learning Rate: {network.learningRate}</li>
              <li>Current Epoch: {network.currentEpoch}</li>
              {network.trainingLoss.length > 0 && (
                <li>Last Training Loss: {network.trainingLoss[network.trainingLoss.length - 1].toFixed(4)}</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestActivationHeatmap;