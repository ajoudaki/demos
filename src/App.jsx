import React, { useState } from 'react'
import ContinualLearningDemoWrapper from './demos/ContinualLearningDemoWrapper'
import TestNeuralNetwork from './demos/TestNeuralNetwork'

function App() {
  const [showTest, setShowTest] = useState(false);

  return (
    <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0 }}>
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        right: '10px', 
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '5px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <button 
          onClick={() => setShowTest(!showTest)}
          style={{
            padding: '8px 16px',
            backgroundColor: showTest ? '#28a745' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showTest ? 'Show Demo' : 'Test Neural Network'}
        </button>
      </div>
      {showTest ? <TestNeuralNetwork /> : <ContinualLearningDemoWrapper />}
    </div>
  )
}

export default App