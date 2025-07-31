import React, { useState, useMemo } from 'react';
import { useFloxMonitor } from '../hooks/useFloxMonitor';

export const FloxMonitorDashboard: React.FC = React.memo(() => {
  const {
    errors,
    warnings,
    stats,
    hasErrors,
    hasWarnings,
    totalIssues,
    clearErrors,
    clearWarnings,
    enableMonitoring,
    disableMonitoring
  } = useFloxMonitor({ componentName: 'FloxMonitorDashboard' });

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'errors' | 'warnings' | 'stats'>('errors');

  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'critical': return '🚨';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const getWarningIcon = (type: string) => {
    switch (type) {
      case 'performance': return '⚡';
      case 'memory': return '🧠';
      case 'pattern': return '🔍';
      default: return '⚠️';
    }
  };

  const getTimeAgo = useMemo(() => (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  }, []);

  if (!hasErrors && !hasWarnings) {
    return (
      <div className="flox-monitor-mini">
        <div className="flox-monitor-status flox-status-clean">
          <span className="flox-status-icon">✅</span>
          <span className="flox-status-text">All Good!</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flox-monitor-dashboard ${isExpanded ? 'expanded' : ''}`}>
      {/* Mini Status Bar */}
      <div className="flox-monitor-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flox-monitor-status">
          <span className="flox-status-icon">
            {hasErrors ? '🚨' : hasWarnings ? '⚠️' : '✅'}
          </span>
          <span className="flox-status-text">
            {hasErrors ? `${errors.length} Errors` : hasWarnings ? `${warnings.length} Warnings` : 'All Good!'}
          </span>
          <span className="flox-status-count">{totalIssues}</span>
        </div>
        <div className="flox-monitor-controls">
          <button 
            className="flox-btn flox-btn-clear"
            onClick={(e) => {
              e.stopPropagation();
              clearErrors();
              clearWarnings();
            }}
            title="Clear all issues"
          >
            🗑️
          </button>
          <button 
            className="flox-btn flox-btn-toggle"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {/* Expanded Dashboard */}
      {isExpanded && (
        <div className="flox-monitor-content">
          {/* Tabs */}
          <div className="flox-monitor-tabs">
            <button 
              className={`flox-tab ${activeTab === 'errors' ? 'active' : ''}`}
              onClick={() => setActiveTab('errors')}
            >
              🚨 Errors ({errors.length})
            </button>
            <button 
              className={`flox-tab ${activeTab === 'warnings' ? 'active' : ''}`}
              onClick={() => setActiveTab('warnings')}
            >
              ⚠️ Warnings ({warnings.length})
            </button>
            <button 
              className={`flox-tab ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              📊 Stats
            </button>
          </div>

          {/* Tab Content */}
          <div className="flox-monitor-tab-content">
            {activeTab === 'errors' && (
              <div className="flox-errors-list">
                {errors.length === 0 ? (
                  <div className="flox-empty-state">
                    <span className="flox-empty-icon">✅</span>
                    <p>No errors detected</p>
                  </div>
                ) : (
                  errors.map((error) => (
                    <div key={error.id} className={`flox-issue-item flox-error-item flox-${error.type}`}>
                      <div className="flox-issue-header">
                        <span className="flox-issue-icon">{getErrorIcon(error.type)}</span>
                        <span className="flox-issue-title">{error.message}</span>
                        <span className="flox-issue-time">{getTimeAgo(error.timestamp)}</span>
                      </div>
                      <div className="flox-issue-body">
                        <p className="flox-issue-details">{error.details}</p>
                        {error.component && (
                          <p className="flox-issue-meta">
                            <strong>Component:</strong> {error.component}
                          </p>
                        )}
                        {error.controller && (
                          <p className="flox-issue-meta">
                            <strong>Controller:</strong> {error.controller}
                          </p>
                        )}
                        {error.suggestions && (
                          <div className="flox-issue-suggestions">
                            <strong>Suggestions:</strong>
                            <ul>
                              {error.suggestions.map((suggestion, index) => (
                                <li key={index}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'warnings' && (
              <div className="flox-warnings-list">
                {warnings.length === 0 ? (
                  <div className="flox-empty-state">
                    <span className="flox-empty-icon">✅</span>
                    <p>No warnings detected</p>
                  </div>
                ) : (
                  warnings.map((warning) => (
                    <div key={warning.id} className={`flox-issue-item flox-warning-item flox-${warning.type}`}>
                      <div className="flox-issue-header">
                        <span className="flox-issue-icon">{getWarningIcon(warning.type)}</span>
                        <span className="flox-issue-title">{warning.message}</span>
                        <span className="flox-issue-time">{getTimeAgo(warning.timestamp)}</span>
                      </div>
                      <div className="flox-issue-body">
                        <p className="flox-issue-details">{warning.details}</p>
                        {warning.component && (
                          <p className="flox-issue-meta">
                            <strong>Component:</strong> {warning.component}
                          </p>
                        )}
                        {warning.controller && (
                          <p className="flox-issue-meta">
                            <strong>Controller:</strong> {warning.controller}
                          </p>
                        )}
                        {warning.suggestions && (
                          <div className="flox-issue-suggestions">
                            <strong>Suggestions:</strong>
                            <ul>
                              {warning.suggestions.map((suggestion, index) => (
                                <li key={index}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="flox-stats-content">
                <div className="flox-stats-grid">
                  <div className="flox-stat-card">
                    <div className="flox-stat-icon">🚨</div>
                    <div className="flox-stat-value">{stats.errorCount}</div>
                    <div className="flox-stat-label">Total Errors</div>
                  </div>
                  <div className="flox-stat-card">
                    <div className="flox-stat-icon">⚠️</div>
                    <div className="flox-stat-value">{stats.warningCount}</div>
                    <div className="flox-stat-label">Total Warnings</div>
                  </div>
                  <div className="flox-stat-card">
                    <div className="flox-stat-icon">📊</div>
                    <div className="flox-stat-value">{stats.currentErrors}</div>
                    <div className="flox-stat-label">Current Errors</div>
                  </div>
                  <div className="flox-stat-card">
                    <div className="flox-stat-icon">📈</div>
                    <div className="flox-stat-value">{stats.currentWarnings}</div>
                    <div className="flox-stat-label">Current Warnings</div>
                  </div>
                </div>
                
                <div className="flox-monitor-controls-panel">
                  <h4>Monitor Controls</h4>
                  <div className="flox-control-buttons">
                    <button 
                      className="flox-btn flox-btn-primary"
                      onClick={enableMonitoring}
                    >
                      Enable Monitoring
                    </button>
                    <button 
                      className="flox-btn flox-btn-secondary"
                      onClick={disableMonitoring}
                    >
                      Disable Monitoring
                    </button>
                    <button 
                      className="flox-btn flox-btn-danger"
                      onClick={() => {
                        clearErrors();
                        clearWarnings();
                      }}
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .flox-monitor-dashboard {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 400px;
          max-width: 90vw;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          transition: all 0.3s ease;
        }

        .flox-monitor-dashboard.expanded {
          height: 500px;
        }

        .flox-monitor-mini {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 10000;
        }

        .flox-monitor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #f9fafb;
          border-radius: 10px 10px 0 0;
          cursor: pointer;
          border-bottom: 1px solid #e5e7eb;
        }

        .flox-monitor-status {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .flox-status-icon {
          font-size: 18px;
        }

        .flox-status-text {
          font-weight: 600;
          color: #374151;
        }

        .flox-status-count {
          background: #ef4444;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .flox-monitor-controls {
          display: flex;
          gap: 8px;
        }

        .flox-btn {
          background: none;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .flox-btn:hover {
          background: rgba(0,0,0,0.05);
        }

        .flox-btn-clear {
          color: #6b7280;
        }

        .flox-btn-toggle {
          color: #374151;
        }

        .flox-monitor-content {
          height: calc(100% - 60px);
          display: flex;
          flex-direction: column;
        }

        .flox-monitor-tabs {
          display: flex;
          border-bottom: 1px solid #e5e7eb;
        }

        .flox-tab {
          flex: 1;
          padding: 12px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          transition: all 0.2s;
        }

        .flox-tab.active {
          color: #374151;
          border-bottom: 2px solid #3b82f6;
          background: #f8fafc;
        }

        .flox-tab:hover {
          background: #f1f5f9;
        }

        .flox-monitor-tab-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }

        .flox-issue-item {
          margin-bottom: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .flox-error-item {
          border-left: 4px solid #ef4444;
        }

        .flox-warning-item {
          border-left: 4px solid #f59e0b;
        }

        .flox-issue-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .flox-issue-icon {
          font-size: 16px;
        }

        .flox-issue-title {
          flex: 1;
          font-weight: 600;
          color: #374151;
        }

        .flox-issue-time {
          font-size: 12px;
          color: #6b7280;
        }

        .flox-issue-body {
          padding: 16px;
        }

        .flox-issue-details {
          margin: 0 0 12px 0;
          color: #374151;
          line-height: 1.5;
        }

        .flox-issue-meta {
          margin: 8px 0;
          font-size: 14px;
          color: #6b7280;
        }

        .flox-issue-suggestions {
          margin-top: 12px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 6px;
        }

        .flox-issue-suggestions ul {
          margin: 8px 0 0 0;
          padding-left: 20px;
        }

        .flox-issue-suggestions li {
          margin-bottom: 4px;
          color: #374151;
        }

        .flox-empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #6b7280;
        }

        .flox-empty-icon {
          font-size: 48px;
          display: block;
          margin-bottom: 16px;
        }

        .flox-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        .flox-stat-card {
          text-align: center;
          padding: 20px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .flox-stat-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .flox-stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #374151;
          margin-bottom: 4px;
        }

        .flox-stat-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .flox-monitor-controls-panel {
          border-top: 1px solid #e5e7eb;
          padding-top: 16px;
        }

        .flox-monitor-controls-panel h4 {
          margin: 0 0 12px 0;
          color: #374151;
        }

        .flox-control-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .flox-btn-primary {
          background: #3b82f6;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 500;
        }

        .flox-btn-primary:hover {
          background: #2563eb;
        }

        .flox-btn-secondary {
          background: #6b7280;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 500;
        }

        .flox-btn-secondary:hover {
          background: #4b5563;
        }

        .flox-btn-danger {
          background: #ef4444;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 500;
        }

        .flox-btn-danger:hover {
          background: #dc2626;
        }

        .flox-status-clean {
          background: #10b981;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
      `}</style>
    </div>
  );
}); 