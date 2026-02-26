import { VFC } from 'react';
import { NodeSelectorProps } from '../types';

const NodeItem: VFC<{
  name: string;
  type: string;
  isSelected: boolean;
  onClick: () => void;
  disabled: boolean;
}> = ({ name, type, isSelected, onClick, disabled }) => (
  <div
    onClick={!disabled ? onClick : undefined}
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px',
      backgroundColor: isSelected ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.05)',
      border: isSelected ? '1px solid #4CAF50' : '1px solid transparent',
      borderRadius: '6px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'all 0.2s',
      marginBottom: '8px',
    }}
  >
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: '14px',
        fontWeight: 500,
        color: isSelected ? '#4CAF50' : 'white',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {name}
      </div>
      <div style={{
        fontSize: '11px',
        color: '#666',
        marginTop: '2px',
        textTransform: 'uppercase',
      }}>
        {type}
      </div>
    </div>
    {isSelected && (
      <div style={{
        color: '#4CAF50',
        marginLeft: '8px',
        fontSize: '16px',
      }}>
        ✓
      </div>
    )}
  </div>
);

export const NodeSelector: VFC<NodeSelectorProps> = ({
  nodes,
  selectedNode,
  onSelectNode,
  isLoading,
}) => {
  if (nodes.length === 0) {
    return (
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
      }}>
        <h3 style={{
          margin: '0 0 12px 0',
          fontSize: '18px',
          fontWeight: 600,
        }}>
          Node Selector
        </h3>
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#666',
        }}>
          {isLoading ? (
            <div>
              <span style={{
                display: 'inline-block',
                marginRight: '8px',
                animation: 'spin 1s linear infinite',
              }}>
                ⟳
              </span>
              Loading nodes...
            </div>
          ) : (
            <div>
              <p style={{ marginBottom: '8px' }}>No nodes available</p>
              <p style={{ fontSize: '12px' }}>
                Download a configuration first to see available nodes
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      maxHeight: '400px',
      overflowY: 'auto' as const,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: 600,
        }}>
          Node Selector
        </h3>
        <span style={{
          fontSize: '12px',
          color: '#666',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          padding: '4px 8px',
          borderRadius: '4px',
        }}>
          {nodes.length} nodes
        </span>
      </div>

      <div style={{
        maxHeight: '320px',
        overflowY: 'auto' as const,
        paddingRight: '4px',
      }}>
        {nodes.map((node) => (
          <NodeItem
            key={node.index}
            name={node.name}
            type={node.type}
            isSelected={selectedNode === node.name}
            onClick={() => onSelectNode(node.name)}
            disabled={isLoading}
          />
        ))}
      </div>

      {isLoading && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          borderRadius: '4px',
          textAlign: 'center',
        }}>
          <span style={{
            display: 'inline-block',
            marginRight: '8px',
            animation: 'spin 1s linear infinite',
          }}>
            ⟳
          </span>
          Switching node...
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        div::-webkit-scrollbar {
          width: 6px;
        }

        div::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }

        div::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        div::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default NodeSelector;
