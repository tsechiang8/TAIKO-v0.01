/**
 * 数据导出导入组件（全局）
 * 支持导出和导入完整的游戏数据
 */

import { useState, useRef } from 'react';
import { exportAllData, importGlobalData, GlobalImportSummary } from '../api';
import './DataExportImport.css';

interface DataExportImportProps {
  onImportComplete?: () => void;
}

export function DataExportImport({ onImportComplete }: DataExportImportProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [importSummary, setImportSummary] = useState<GlobalImportSummary | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setSuccessMessage('数据导出成功，文件已下载');
    } else {
      setError(response.error || '导出失败');
    }
    setLoading(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(false);
    setImportSummary(null);

    try {
      const fileContent = await file.text();
      const response = await importGlobalData(fileContent);

      if (response.success && response.data) {
        setSuccess(true);
        setSuccessMessage('数据导入成功');
        setImportSummary(response.data);
        onImportComplete?.();
      } else {
        setError(response.error || '导入失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '文件读取失败');
    } finally {
      setLoading(false);
      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="data-export-import">
      <h2>数据导出导入</h2>

      <div className="export-import-description">
        <p>导出或导入完整的游戏数据。</p>
        <p>导出的数据包括：游戏状态、郡国、势力、军团、武士、特产等所有数据。</p>
        <p>导入时会覆盖现有的所有数据，请谨慎操作。</p>
      </div>

      <div className="export-import-actions">
        <button
          className="export-btn"
          onClick={handleExport}
          disabled={loading}
          title="导出所有游戏数据为 JSON 文件"
        >
          {loading ? '处理中...' : '导出所有数据'}
        </button>

        <button
          className="import-btn"
          onClick={handleImportClick}
          disabled={loading}
          title="导入 JSON 文件覆盖现有数据"
        >
          {loading ? '处理中...' : '导入数据文件'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <span>处理中...</span>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="export-import-messages">
          <div className="error-message">
            <h4>操作失败</h4>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* 成功提示 */}
      {success && (
        <div className="export-import-messages">
          <div className="success-message">
            <h4>操作成功</h4>
            <p>{successMessage}</p>

            {importSummary && (
              <div className="import-summary">
                <h5>导入摘要：</h5>
                <ul>
                  <li>游戏状态：{importSummary.gameState ? '已导入' : '未导入'}</li>
                  <li>郡国数据：{importSummary.territories} 条</li>
                  <li>势力数据：{importSummary.factions} 条</li>
                  <li>武士数据：{importSummary.samurais} 条</li>
                  <li>军团数据：{importSummary.legions} 条</li>
                  <li>特产数据：{importSummary.specialProducts} 条</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DataExportImport;
