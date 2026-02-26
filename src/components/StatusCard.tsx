import { VFC, useEffect } from 'react';
import { StatusCardProps } from '../types';

// Decky Loader styled components
const Card: VFC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`singbox-card ${className || ''}`} style={{
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
  }}>
    {children}
  </div>
);

const Button: VFC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: React.CSSProperties;
}> = ({ children, onClick, disabled, variant = 'primary', style }) => {
  const bgColors = {
    primary: '#4CAF50',
    secondary: '#58656E',
    danger: '#F44336',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: disabled ? '#333' : bgColors[variant],
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 16px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontWeight: 500,
        marginRight: '8px',
        ...style,
      }}
    >
      {children}
    </button>
  );
};

const StatusIndicator: VFC<{ status: string; running: boolean }> = ({ status, running }) => {
  const getColor = () => {
    if (running) return '#4CAF50';
    if (status === 'active') return '#8BC34A';
    if (status === 'inactive') return '#FF9800';
    return '#F44336';
  };

  const getLabel = () => {
    if (running) return 'Running';
    if (status === 'active') return 'Active';
    if (status === 'inactive') return 'Stopped';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '16px',
    }}>
      <div style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: getColor(),
        boxShadow: `0 0 8px ${getColor()}`,
      }} />
      <span style={{
        fontSize: '16px',
        fontWeight: 600,
      }}>
        {getLabel()}
      </span>
    </div>
  );
};

export const StatusCard: VFC<StatusCardProps> = ({
  status,
  isLoading,
  onStart,
  onStop,
  onRefresh,
}) => {
  const isRunning = status?.running || status?.active;

  return (
    <Card>
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
          Service Status
        </h3>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#888',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            padding: '4px',
          }}
          title="Refresh status"
        >
          <span style={{
            display: 'inline-block',
            transform: isLoading ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.3s',
          }}>
            ↻
          </span>
        </button>
      </div>

      {status ? (
        <StatusIndicator status={status.status} running={status.running} />
      ) : (
        <p style={{ color: '#888' }}>Loading status...</p>
      )}

      <div style={{ marginTop: '16px' }}>
        {isRunning ? (
          <>
            <Button variant="secondary" onClick={onStop} disabled={isLoading}>
              Stop
            </Button>
            <Button variant="primary" onClick={onStart} disabled={isLoading}>
              Restart
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={onStart} disabled={isLoading}>
            Start Service
          </Button>
        )}
      </div>

      {isLoading && (
        <p style={{
          color: '#888',
          fontSize: '12px',
          marginTop: '8px',
        }}>
          Processing...
        </p>
      )}
    </Card>
  );
};

export default StatusCard;
