import React from 'react';

const TrainingControls = ({
  isTraining,
  onStart,
  onStop,
  onReset,
  learningRate,
  onLearningRateChange,
  activationType,
  onActivationTypeChange,
  batchSize,
  onBatchSizeChange,
  epochsPerStep = 1,
  onEpochsPerStepChange,
  currentEpoch = 0,
  trainLoss = null,
  testLoss = null
}) => {
  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      padding: '15px',
      borderRadius: '8px',
      border: '1px solid #dee2e6'
    }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '15px'
      }}>
        {/* Training Actions */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
            Training Control
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onStart}
              disabled={isTraining}
              style={{
                padding: '8px 16px',
                backgroundColor: isTraining ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isTraining ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              {isTraining ? 'Training...' : 'Start'}
            </button>
            
            <button
              onClick={onStop}
              disabled={!isTraining}
              style={{
                padding: '8px 16px',
                backgroundColor: !isTraining ? '#6c757d' : '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: !isTraining ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              Stop
            </button>
            
            <button
              onClick={onReset}
              disabled={isTraining}
              style={{
                padding: '8px 16px',
                backgroundColor: isTraining ? '#6c757d' : '#ffc107',
                color: isTraining ? 'white' : '#212529',
                border: 'none',
                borderRadius: '4px',
                cursor: isTraining ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Learning Rate */}
        <div>
          <label htmlFor="learning-rate" style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
            Learning Rate: {learningRate}
          </label>
          <input
            id="learning-rate"
            type="range"
            min="0.001"
            max="0.1"
            step="0.001"
            value={learningRate}
            onChange={(e) => onLearningRateChange(parseFloat(e.target.value))}
            disabled={isTraining}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6c757d' }}>
            <span>0.001</span>
            <span>0.1</span>
          </div>
        </div>

        {/* Activation Type */}
        <div>
          <label htmlFor="activation-type" style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
            Activation Function
          </label>
          <select
            id="activation-type"
            value={activationType}
            onChange={(e) => onActivationTypeChange(e.target.value)}
            disabled={isTraining}
            style={{
              width: '100%',
              padding: '6px',
              fontSize: '14px',
              borderRadius: '4px',
              border: '1px solid #ced4da'
            }}
          >
            <option value="tanh">Tanh</option>
            <option value="relu">ReLU</option>
            <option value="leakyRelu">Leaky ReLU</option>
            <option value="sigmoid">Sigmoid</option>
          </select>
        </div>

        {/* Batch Size */}
        {onBatchSizeChange && (
          <div>
            <label htmlFor="batch-size" style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
              Batch Size: {batchSize}
            </label>
            <input
              id="batch-size"
              type="range"
              min="1"
              max="64"
              step="1"
              value={batchSize}
              onChange={(e) => onBatchSizeChange(parseInt(e.target.value))}
              disabled={isTraining}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6c757d' }}>
              <span>1</span>
              <span>64</span>
            </div>
          </div>
        )}

        {/* Epochs Per Step */}
        {onEpochsPerStepChange && (
          <div>
            <label htmlFor="epochs-per-step" style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
              Epochs per Step: {epochsPerStep}
            </label>
            <input
              id="epochs-per-step"
              type="range"
              min="1"
              max="50"
              step="1"
              value={epochsPerStep}
              onChange={(e) => onEpochsPerStepChange(parseInt(e.target.value))}
              disabled={isTraining}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6c757d' }}>
              <span>1</span>
              <span>50</span>
            </div>
          </div>
        )}
      </div>

      {/* Status Display */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '10px',
        borderTop: '1px solid #dee2e6',
        fontSize: '14px'
      }}>
        <div>
          <strong>Epoch:</strong> {currentEpoch}
        </div>
        {trainLoss !== null && (
          <div>
            <strong>Train Loss:</strong> {trainLoss.toFixed(4)}
          </div>
        )}
        {testLoss !== null && (
          <div>
            <strong>Test Loss:</strong> {testLoss.toFixed(4)}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingControls;