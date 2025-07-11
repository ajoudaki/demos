import React, { useState } from 'react';
import HeatmapVisualization from '../components/HeatmapVisualization';

const TestHeatmapVisualization = () => {
  const [dataType, setDataType] = useState('weights');
  const [colorScheme, setColorScheme] = useState('viridis');
  const [showValues, setShowValues] = useState(false);

  // Generate different types of test data
  const generateData = (type) => {
    switch (type) {
      case 'weights':
        // Simulated neural network weights (4x6 matrix)
        return Array.from({ length: 4 }, (_, i) => 
          Array.from({ length: 6 }, (_, j) => 
            (Math.random() - 0.5) * 2 // Random values between -1 and 1
          )
        );
      
      case 'activations':
        // Simulated neuron activations (8x8 matrix)
        return Array.from({ length: 8 }, (_, i) => 
          Array.from({ length: 8 }, (_, j) => 
            Math.random() // Random values between 0 and 1
          )
        );
      
      case 'gradients':
        // Simulated gradients with some structure
        return Array.from({ length: 5 }, (_, i) => 
          Array.from({ length: 5 }, (_, j) => 
            Math.sin(i * 0.5) * Math.cos(j * 0.5) + (Math.random() - 0.5) * 0.2
          )
        );
      
      case 'confusion':
        // Simulated confusion matrix (3x3)
        const matrix = [
          [45, 2, 3],
          [5, 38, 7],
          [1, 4, 45]
        ];
        return matrix;
      
      default:
        return [];
    }
  };

  const data = generateData(dataType);

  // Generate labels based on data type
  const getLabels = () => {
    if (dataType === 'confusion') {
      return {
        xLabels: ['Class A', 'Class B', 'Class C'],
        yLabels: ['Class A', 'Class B', 'Class C']
      };
    } else if (dataType === 'weights') {
      return {
        xLabels: Array.from({ length: 6 }, (_, i) => `N${i + 1}`),
        yLabels: Array.from({ length: 4 }, (_, i) => `Input ${i + 1}`)
      };
    }
    return { xLabels: null, yLabels: null };
  };

  const { xLabels, yLabels } = getLabels();

  const getTitle = () => {
    switch (dataType) {
      case 'weights': return 'Neural Network Weights';
      case 'activations': return 'Neuron Activations';
      case 'gradients': return 'Gradient Flow';
      case 'confusion': return 'Confusion Matrix';
      default: return '';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Heatmap Visualization Test</h2>
      <p>Test the HeatmapVisualization component with different data types.</p>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
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
            <option value="weights">Neural Network Weights</option>
            <option value="activations">Neuron Activations</option>
            <option value="gradients">Gradient Flow</option>
            <option value="confusion">Confusion Matrix</option>
          </select>
        </div>

        <div>
          <label htmlFor="colorScheme" style={{ marginRight: '10px' }}>
            Color Scheme:
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
            <option value="viridis">Viridis</option>
            <option value="blues">Blues</option>
            <option value="redblue">Red-Blue Diverging</option>
          </select>
        </div>

        <label style={{ display: 'flex', alignItems: 'center' }}>
          <input 
            type="checkbox" 
            checked={showValues}
            onChange={(e) => setShowValues(e.target.checked)}
            style={{ marginRight: '5px' }}
          />
          Show Values (for small matrices)
        </label>
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
          <h3>Default Size</h3>
          <HeatmapVisualization 
            data={data}
            colorScheme={colorScheme}
            showValues={showValues}
            title={getTitle()}
            xLabels={xLabels}
            yLabels={yLabels}
          />
        </div>

        <div style={{ 
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px'
        }}>
          <h3>Large Size</h3>
          <HeatmapVisualization 
            data={data}
            width={500}
            height={400}
            colorScheme={colorScheme}
            showValues={showValues}
            title={getTitle()}
            xLabels={xLabels}
            yLabels={yLabels}
          />
        </div>
      </div>

      <div style={{ 
        backgroundColor: '#f5f5f5',
        padding: '20px',
        borderRadius: '8px'
      }}>
        <h3>Wide Format</h3>
        <HeatmapVisualization 
          data={data}
          width={800}
          height={250}
          colorScheme={colorScheme}
          showValues={showValues}
          title={getTitle()}
          xLabels={xLabels}
          yLabels={yLabels}
        />
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>Current Data Info:</p>
        <ul>
          <li>Matrix dimensions: {data.length} × {data[0]?.length || 0}</li>
          <li>Min value: {data.length > 0 ? Math.min(...data.flat()).toFixed(3) : 'N/A'}</li>
          <li>Max value: {data.length > 0 ? Math.max(...data.flat()).toFixed(3) : 'N/A'}</li>
        </ul>
        <p>Component Features:</p>
        <ul>
          <li>Visualizes 2D numerical data as colored cells</li>
          <li>Multiple color schemes (viridis, blues, red-blue diverging)</li>
          <li>Optional value display for small matrices</li>
          <li>Hover tooltip showing row, column, and value</li>
          <li>Support for custom axis labels</li>
          <li>Configurable title and dimensions</li>
        </ul>
      </div>
    </div>
  );
};

export default TestHeatmapVisualization;