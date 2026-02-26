import { VFC, useState } from 'react';
import { SettingsPanelProps } from '../types';

const Input: VFC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}> = ({ value, onChange, placeholder, disabled, type = 'text' }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    disabled={disabled}
    style={{
      width: '100%',
      padding: '10px 12px',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      border: '1px solid #444',
      borderRadius: '4px',
      color: 'white',
      fontSize: '14px',
      boxSizing: 'border-box',
    }}
  />
);

export const Settings: VFC<SettingsPanelProps> = ({
  configUrl,
  onUrlChange,
  onFetchConfig,
  isFetching,
}) => {
  const [localUrl, setLocalUrl] = useState(configUrl);

  const handleFetch = () => {
    if (localUrl.trim()) {
      onFetchConfig();
    }
  };

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
        Configuration
      </h3>

      <div style={{ marginBottom: '12px' }}>
        <label style={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '12px',
          color: '#888',
          textTransform: 'uppercase',
        }}>
          Config URL
        </label>
        <Input
          value={localUrl}
          onChange={(value) => {
            setLocalUrl(value);
            onUrlChange(value);
          }}
          placeholder="https://example.com/config.json"
          disabled={isFetching}
        />
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <button
          onClick={handleFetch}
          disabled={isFetching || !localUrl.trim()}
          style={{
            backgroundColor: isFetching || !localUrl.trim() ? '#333' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '10px 20px',
            cursor: isFetching || !localUrl.trim() ? 'not-allowed' : 'pointer',
            fontWeight: 500,
            flex: 1,
          }}
        >
          {isFetching ? 'Downloading...' : 'Download Config'}
        </button>
      </div>

      {isFetching && (
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
          Fetching configuration...
        </div>
      )}

      <div style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#888',
      }}>
        <p style={{ margin: '0 0 8px 0' }}>
          <strong>Note:</strong> The configuration file will be saved to:
        </p>
        <code style={{
          display: 'block',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          padding: '8px',
          borderRadius: '4px',
          wordBreak: 'break-all',
        }}>
          /home/deck/.config/sing-box/config.json
        </code>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Settings;
