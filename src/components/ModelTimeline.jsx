import React from 'react';

const ModelTimeline = ({
  snapshots = [],
  currentIndex = 0,
  onSelectSnapshot,
  onClearHistory,
  autoSnapshot = true,
  snapshotInterval = 50,
  onAutoSnapshotChange,
  onSnapshotIntervalChange,
  onSaveSnapshot,
  network = null,
  isTraining = false,
  width = 800,
  height = 80
}) => {
  if (snapshots.length === 0) {
    return (
      <div style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        border: '1px solid #ddd',
        color: '#666',
        fontSize: '14px'
      }}>
        No snapshots saved yet. Snapshots are saved automatically during training.
      </div>
    );
  }

  const handleSliderChange = (e) => {
    const index = parseInt(e.target.value);
    onSelectSnapshot(index);
  };

  const currentSnapshot = snapshots[currentIndex];

  return (
    <div style={{
      backgroundColor: '#f0f8ff',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #b0d4ff'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <h4 style={{ margin: 0, fontSize: '16px' }}>Model History</h4>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
            <input
              type="checkbox"
              checked={autoSnapshot}
              onChange={(e) => onAutoSnapshotChange && onAutoSnapshotChange(e.target.checked)}
            />
            Auto-snapshot every
            <input
              type="number"
              value={snapshotInterval}
              onChange={(e) => onSnapshotIntervalChange && onSnapshotIntervalChange(Math.max(1, parseInt(e.target.value) || 50))}
              min="1"
              max="200"
              style={{ width: '50px' }}
              disabled={!autoSnapshot}
            />
            epochs
          </label>

          <button
            onClick={() => onSaveSnapshot && onSaveSnapshot()}
            disabled={isTraining || !network}
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isTraining || !network ? 'not-allowed' : 'pointer'
            }}
          >
            Save Snapshot
          </button>
          
          <button
            onClick={onClearHistory}
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{ fontSize: '12px', minWidth: '45px' }}>
          E{snapshots[0]?.epoch || 0}
        </span>
        
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="range"
            min="0"
            max={snapshots.length - 1}
            value={currentIndex}
            onChange={handleSliderChange}
            style={{
              width: '100%',
              cursor: 'pointer'
            }}
          />
          {/* Task switch markers */}
          <div style={{ position: 'absolute', top: '-8px', left: 0, right: 0, pointerEvents: 'none' }}>
            {snapshots.map((snapshot, i) => {
              if (!snapshot.isTaskSwitch) return null;
              const position = (i / (snapshots.length - 1)) * 100;
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${position}%`,
                    transform: 'translateX(-50%)',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#ff6b6b',
                    border: '2px solid white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                  }}
                  title={`Task switch at epoch ${snapshot.epoch}`}
                />
              );
            })}
          </div>
        </div>
        
        <span style={{ fontSize: '12px', minWidth: '45px', textAlign: 'right' }}>
          E{snapshots[snapshots.length - 1]?.epoch || 0}
        </span>
      </div>

    </div>
  );
};

export default ModelTimeline;