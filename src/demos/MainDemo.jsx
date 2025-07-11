import React from 'react';
import { useNavigate } from 'react-router-dom';

const MainDemo = () => {
  const navigate = useNavigate();
  const demos = [
    {
      title: "Original Continual Learning Demo",
      path: "demo",
      description: "The original monolithic demo preserved in an iframe",
      features: ["Complete original functionality", "All visualizations", "Model history"]
    },
    {
      title: "Continual Learning",
      path: "continual-learning",
      description: "Comprehensive neural network training with task switching and model history",
      features: [
        "Live training with real-time visualizations",
        "Task switching to demonstrate catastrophic forgetting",
        "Model history with timeline navigation",
        "Activation heatmaps on neurons",
        "Multiple datasets (XOR, Spiral, Circle, Ring, Gaussian)",
        "Manual and automatic snapshots"
      ]
    }
  ];

  const components = [
    {
      title: "Neural Network",
      path: "test-nn",
      description: "Core neural network implementation"
    },
    {
      title: "Data Generation",
      path: "test-data",
      description: "Various 2D classification datasets"
    },
    {
      title: "Network Visualization",
      path: "test-network-vis",
      description: "Interactive network architecture with activation heatmaps"
    },
    {
      title: "Loss Chart",
      path: "test-loss-chart",
      description: "Training/test loss curves"
    },
    {
      title: "Heatmap Visualization",
      path: "test-heatmap",
      description: "General purpose 2D data heatmap"
    },
    {
      title: "Activation Heatmap",
      path: "test-activation-heatmap",
      description: "Neuron activations across 2D input space"
    },
    {
      title: "Training Controls",
      path: "test-training-controls",
      description: "Reusable training UI controls"
    }
  ];

  const navigateTo = (path) => {
    navigate(`/${path}`);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Neural Network Visualization Demos</h1>
      <p style={{ fontSize: '18px', color: '#666' }}>
        A modular React implementation of continual learning neural network demonstrations.
      </p>

      <div style={{ 
        backgroundColor: '#e8f4f8',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #b8e0ea'
      }}>
        <h3 style={{ marginTop: 0 }}>🎯 Key Features</h3>
        <ul style={{ marginBottom: 0 }}>
          <li>Modular, reusable React components</li>
          <li>Real-time training visualization</li>
          <li>Multiple 2D classification datasets (XOR, Spiral, Circle, Ring, Gaussian)</li>
          <li>Continual learning with task switching</li>
          <li>Model history and timeline navigation</li>
          <li>Interactive network architecture with activation heatmaps on neurons</li>
          <li>Simple implementation following "don't over-engineer" principle</li>
        </ul>
      </div>

      <h2>Main Demos</h2>
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {demos.map(demo => (
          <div
            key={demo.path}
            style={{
              backgroundColor: '#f5f5f5',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              ':hover': {
                transform: 'translateY(-2px)'
              }
            }}
            onClick={() => navigateTo(demo.path)}
          >
            <h3 style={{ marginTop: 0, color: '#007bff' }}>{demo.title}</h3>
            <p style={{ color: '#666' }}>{demo.description}</p>
            <ul style={{ fontSize: '14px', color: '#555' }}>
              {demo.features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
            <button
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Open Demo →
            </button>
          </div>
        ))}
      </div>

      <h2>Component Tests</h2>
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px'
      }}>
        {components.map(comp => (
          <div
            key={comp.path}
            style={{
              backgroundColor: '#fff',
              padding: '15px',
              borderRadius: '6px',
              border: '1px solid #e0e0e0',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s'
            }}
            onClick={() => navigateTo(comp.path)}
          >
            <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{comp.title}</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{comp.description}</p>
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#fff3cd',
        borderRadius: '8px',
        border: '1px solid #ffeaa7'
      }}>
        <h3 style={{ marginTop: 0 }}>📚 Usage Guide</h3>
        <ol style={{ marginBottom: 0 }}>
          <li>Start with the <strong>Integrated Training</strong> demo to see all components working together</li>
          <li>Try <strong>Continual Learning</strong> to see how networks adapt to new tasks</li>
          <li>Use <strong>Model History</strong> to save and compare different training states</li>
          <li>Explore individual components to understand the modular architecture</li>
        </ol>
      </div>
    </div>
  );
};

export default MainDemo;