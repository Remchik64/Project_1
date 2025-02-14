import React, { useState, useEffect } from 'react';
import logger from '../utils/logger';
import './LogViewer.css';

const LogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const updateLogs = () => {
      setLogs(logger.getLogs());
    };

    // Обновляем логи каждую секунду
    const interval = setInterval(updateLogs, 1000);
    updateLogs();

    return () => clearInterval(interval);
  }, []);

  const filteredLogs = filter === 'ALL' 
    ? logs 
    : logs.filter(log => log.type === filter);

  const handleClearLogs = () => {
    logger.clearLogs();
    setLogs([]);
  };

  return (
    <div className="log-viewer">
      <div className="log-controls">
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="log-filter"
        >
          <option value="ALL">Все логи</option>
          <option value="ERROR">Ошибки</option>
          <option value="WARN">Предупреждения</option>
          <option value="INFO">Информация</option>
          <option value="DEBUG">Отладка</option>
        </select>
        <button onClick={handleClearLogs} className="clear-logs-button">
          Очистить логи
        </button>
      </div>

      <div className="logs-container">
        {filteredLogs.map((log, index) => (
          <div 
            key={index} 
            className={`log-entry log-${log.type.toLowerCase()}`}
          >
            <div className="log-header">
              <span className="log-timestamp">{new Date(log.timestamp).toLocaleString()}</span>
              <span className={`log-type log-type-${log.type.toLowerCase()}`}>
                {log.type}
              </span>
            </div>
            <div className="log-message">{log.message}</div>
            {log.data && (
              <pre className="log-data">
                {JSON.stringify(log.data, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogViewer; 