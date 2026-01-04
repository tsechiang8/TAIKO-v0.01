/**
 * 数据导出组件
 * Requirements: 3.1-3.3
 */

import { useState } from 'react';
import { exportAllData } from '../api';
import './DataExport.css';

interface DataExportProps {
  onExportComplete?: () => void;
}

export function DataExport({ onExportComplete }: DataExportProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const response = await exportAllData();
    if (response.success && response.data) {
      // 创建 JSON 文件并下载
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      // 生成文件名：exported-data-{时间戳}.json
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `exported-data-${timestamp}.json`;
      
      // 创建下载链接
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSuccess(true);
      onExportComplete?.();
    } else {
      setError(response.error || '导出失败');
    }
    setLoading(false);
  };

  return (
    <div className="data-export">
      <h2>数据导出</h2>

      <div className="export-description">
        <p>点击下方按钮导出所有游戏数据为 JSON 文件。</p>
        <p>导出的数据包括：游戏状态、郡国、势力、军团、武士、特产等所有数据。</p>
        <p>导出的文件可以用于备份或导入到其他游戏实例中。</p>
      </div>

      <div className="export-actions">
        <button
          className="export-btn"
          onClick={handleExport}
          disabled={loading}
        >
          {loading ? '导出中...' : '导出所有数据'}
        </button>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <span>导出中...</span>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="export-messages">
          <div className="error-message">
            <h4>导出失败</h4>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* 成功提示 */}
      {success && (
        <div className="export-messages">
          <div className="success-message">
            <h4>导出成功</h4>
            <p>数据已导出并下载。文件名格式：exported-data-[时间戳].json</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataExport;
