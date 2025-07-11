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
      display: 'flex', 
      flexWrap: 'wrap',
      gap: '15px',
      alignItems: 'center'
    }}>
      {/* Training Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onStart}
              disabled={isTraining}
              style={{
                padding: '5px 12px',
                backgroundColor: isTraining ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isTraining ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              {isTraining ? 'Training...' : 'Start'}
            </button>
            
            <button
              onClick={onStop}
              disabled={!isTraining}
              style={{
                padding: '5px 12px',
                backgroundColor: !isTraining ? '#6c757d' : '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: !isTraining ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              Stop
            </button>
            
            <button
              onClick={onReset}
              disabled={isTraining}
              style={{
                padding: '5px 12px',
                backgroundColor: isTraining ? '#6c757d' : '#ffc107',
                color: isTraining ? 'white' : '#212529',
                border: 'none',
                borderRadius: '4px',
                cursor: isTraining ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              Reset
            </button>
      </div>

      {/* Learning Rate */}
      <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
        Learning Rate:
          <input
            id="learning-rate"
            type="number"
            min="0.001"
            max="1"
            step="0.001"
            value={learningRate}
            onChange={(e) => onLearningRateChange(parseFloat(e.target.value) || 0.01)}
            disabled={isTraining}
            style={{ 
              width: '60px',
              padding: '3px 5px',
              fontSize: '12px',
              borderRadius: '4px',
              border: '1px solid #ced4da'
            }}
        />
      </label>


      {/* Batch Size */}
      {onBatchSizeChange && (
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
          Batch Size:
            <input
              id="batch-size"
              type="number"
              min="1"
              max="128"
              step="1"
              value={batchSize}
              onChange={(e) => onBatchSizeChange(parseInt(e.target.value) || 32)}
              disabled={isTraining}
              style={{ 
                width: '100%',
                padding: '3px 5px',
                fontSize: '12px',
                borderRadius: '4px',
                border: '1px solid #ced4da'
              }}
          />
        </label>
      )}

      {/* Epochs Per Step */}
      {onEpochsPerStepChange && (
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
          Epochs/Step:
            <input
            id="epochs-per-step"
            type="range"
            min="1"
            max="50"
            step="1"
            value={epochsPerStep}
            onChange={(e) => onEpochsPerStepChange(parseInt(e.target.value))}
            disabled={isTraining}
            style={{ width: '100px' }}
          />
          <span style={{ fontSize: '11px', color: '#6c757d' }}>{epochsPerStep}</span>
        </label>
      )}
    </div>
  );
};

export default TrainingControls;