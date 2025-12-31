/**
 * 投资面板组件
 * Requirements: 7.1-7.4, 2.1-2.14
 */

import { useState, useEffect } from 'react';
import {
  getInvestmentStatus,
  getAvailableSamuraisForInvestment,
  getInvestmentPreview,
  executeInvestment,
  getFactionTerritoriesForCommerce,
  getCommerceInvestmentPreview,
  executeCommerceInvestment,
  InvestmentType,
  InvestmentStatus,
  InvestmentPreview,
  InvestmentResult,
  CommerceInvestmentPreview,
  CommerceInvestmentResult,
} from '../api';
import { Samurai, Territory } from '../types';
import './InvestmentPanel.css';

interface InvestmentPanelProps {
  factionId?: string;
  onInvestmentComplete?: () => void;
}

// 投资类型配置
const INVESTMENT_TYPES: { type: InvestmentType; name: string; description: string }[] = [
  { type: 'agriculture', name: '农业', description: '文治属性，7000石/次，5点基础' },
  { type: 'commerce', name: '商业', description: '文治属性，自定义投入金额，开发特产' },
  { type: 'navy', name: '水军', description: '武功属性，9000石/次，4点基础' },
  { type: 'armament', name: '武备', description: '武勇属性，6000石/次，6点基础' },
];

// 商业投资最低金额
const COMMERCE_MIN_AMOUNT = 1000;

export function InvestmentPanel({ factionId, onInvestmentComplete }: InvestmentPanelProps) {
  const [status, setStatus] = useState<InvestmentStatus | null>(null);
  const [samurais, setSamurais] = useState<Samurai[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 投资表单状态
  const [selectedType, setSelectedType] = useState<InvestmentType | null>(null);
  const [selectedSamurai, setSelectedSamurai] = useState<string>('');
  const [selectedTerritory, setSelectedTerritory] = useState<string>('');
  const [commerceAmount, setCommerceAmount] = useState<number>(COMMERCE_MIN_AMOUNT);
  const [preview, setPreview] = useState<InvestmentPreview | null>(null);
  const [commercePreview, setCommercePreview] = useState<CommerceInvestmentPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // 确认弹窗状态
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [executing, setExecuting] = useState(false);

  // 结果弹窗状态
  const [result, setResult] = useState<InvestmentResult | null>(null);
  const [commerceResult, setCommerceResult] = useState<CommerceInvestmentResult | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, [factionId]);

  useEffect(() => {
    // 当选择改变时，获取预览
    if (selectedType && selectedSamurai) {
      if (selectedType === 'commerce') {
        if (selectedTerritory && commerceAmount >= COMMERCE_MIN_AMOUNT) {
          loadCommercePreview();
        } else {
          setCommercePreview(null);
        }
      } else {
        loadPreview();
      }
    } else {
      setPreview(null);
      setCommercePreview(null);
    }
  }, [selectedType, selectedSamurai, selectedTerritory, commerceAmount]);

  // 当选择商业投资时，加载领地列表
  useEffect(() => {
    if (selectedType === 'commerce') {
      loadTerritories();
    }
  }, [selectedType, factionId]);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const [statusRes, samuraisRes] = await Promise.all([
        getInvestmentStatus(factionId),
        getAvailableSamuraisForInvestment(factionId),
      ]);

      if (statusRes.success && statusRes.data) {
        setStatus(statusRes.data);
      } else {
        setError(statusRes.error || '获取投资状态失败');
      }

      if (samuraisRes.success && samuraisRes.data) {
        setSamurais(samuraisRes.data);
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  }

  async function loadTerritories() {
    try {
      const response = await getFactionTerritoriesForCommerce(factionId);
      if (response.success && response.data) {
        setTerritories(response.data);
      }
    } catch (err) {
      console.error('获取领地列表失败:', err);
    }
  }

  async function loadPreview() {
    if (!selectedType || !selectedSamurai) return;

    setPreviewLoading(true);
    try {
      const response = await getInvestmentPreview(selectedType, selectedSamurai, undefined, factionId);
      if (response.success && response.data) {
        setPreview(response.data);
      }
    } catch (err) {
      console.error('获取预览失败:', err);
    } finally {
      setPreviewLoading(false);
    }
  }

  async function loadCommercePreview() {
    if (!selectedSamurai || !selectedTerritory || commerceAmount < COMMERCE_MIN_AMOUNT) return;

    setPreviewLoading(true);
    try {
      const response = await getCommerceInvestmentPreview(
        selectedSamurai,
        selectedTerritory,
        commerceAmount,
        factionId
      );
      if (response.success && response.data) {
        setCommercePreview(response.data);
      }
    } catch (err) {
      console.error('获取商业投资预览失败:', err);
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleExecuteInvestment() {
    if (!selectedType || !selectedSamurai) return;

    setExecuting(true);
    try {
      if (selectedType === 'commerce') {
        if (!selectedTerritory || !commercePreview?.canExecute) return;
        
        const response = await executeCommerceInvestment(
          selectedSamurai,
          selectedTerritory,
          commerceAmount,
          factionId
        );
        
        if (response.success && response.data) {
          setCommerceResult(response.data);
          setShowResultDialog(true);
          setShowConfirmDialog(false);
          await loadData();
          onInvestmentComplete?.();
        } else {
          alert(response.error || '商业投资执行失败');
        }
      } else {
        if (!preview?.canExecute) return;
        
        const response = await executeInvestment(selectedType, selectedSamurai, undefined, factionId);
        
        if (response.success && response.data) {
          setResult(response.data);
          setShowResultDialog(true);
          setShowConfirmDialog(false);
          await loadData();
          onInvestmentComplete?.();
        } else {
          alert(response.error || '投资执行失败');
        }
      }
    } catch (err) {
      alert('网络错误');
    } finally {
      setExecuting(false);
    }
  }

  function handleTypeChange(type: InvestmentType) {
    setSelectedType(type);
    // 切换类型时重置相关状态
    setSelectedTerritory('');
    setCommerceAmount(COMMERCE_MIN_AMOUNT);
    setPreview(null);
    setCommercePreview(null);
  }

  function resetForm() {
    setSelectedType(null);
    setSelectedSamurai('');
    setSelectedTerritory('');
    setCommerceAmount(COMMERCE_MIN_AMOUNT);
    setPreview(null);
    setCommercePreview(null);
    setResult(null);
    setCommerceResult(null);
  }

  if (loading) {
    return (
      <div className="investment-panel loading">
        <p>加载中...</p>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="investment-panel error">
        <p>{error || '数据加载失败'}</p>
        <button onClick={loadData}>重试</button>
      </div>
    );
  }

  const canExecute = selectedType === 'commerce' 
    ? commercePreview?.canExecute 
    : preview?.canExecute;

  return (
    <div className="investment-panel">
      {/* 当前状态 */}
      <div className="investment-status">
        <h3>投资状态</h3>
        <div className="status-grid">
          <div className="status-item">
            <span className="label">库存</span>
            <span className="value">{status.treasury.toLocaleString()} 石</span>
          </div>
          <div className="status-item">
            <span className="label">农业</span>
            <span className="value">{status.agriculturePoints}点 ({status.agricultureLevel})</span>
          </div>
          <div className="status-item">
            <span className="label">商业</span>
            <span className="value">{status.commercePoints}点 ({status.commerceLevel})</span>
          </div>
          <div className="status-item">
            <span className="label">水军</span>
            <span className="value">{status.navyPoints}点 ({status.navyLevel})</span>
          </div>
          <div className="status-item">
            <span className="label">武备</span>
            <span className="value">{status.armamentPoints}点 ({status.armamentLevel})</span>
          </div>
        </div>
      </div>

      {/* 投资选择 */}
      <div className="investment-form">
        <h3>执行投资</h3>
        
        {/* 投资类型选择 */}
        <div className="form-group">
          <label>投资项目</label>
          <div className="type-buttons">
            {INVESTMENT_TYPES.map(({ type, name, description }) => (
              <button
                key={type}
                className={`type-btn ${selectedType === type ? 'selected' : ''}`}
                onClick={() => handleTypeChange(type)}
                title={description}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* 武士选择 */}
        <div className="form-group">
          <label>执行武将</label>
          {samurais.length === 0 ? (
            <p className="no-samurai">没有可用的武将（行动力不足）</p>
          ) : (
            <select
              value={selectedSamurai}
              onChange={(e) => setSelectedSamurai(e.target.value)}
            >
              <option value="">请选择武将</option>
              {samurais.map((samurai) => (
                <option key={samurai.id} value={samurai.id}>
                  {samurai.name} (武功:{samurai.martialValue} 文治:{samurai.civilValue} 行动力:{samurai.actionPoints})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* 商业投资：郡国选择 */}
        {selectedType === 'commerce' && (
          <div className="form-group">
            <label>目标郡国</label>
            {territories.length === 0 ? (
              <p className="no-territory">没有可投资的领地</p>
            ) : (
              <select
                value={selectedTerritory}
                onChange={(e) => setSelectedTerritory(e.target.value)}
              >
                <option value="">请选择郡国</option>
                {territories.map((territory) => (
                  <option key={territory.id} value={territory.id}>
                    {territory.provinceName} - {territory.districtName}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* 商业投资：金额输入 */}
        {selectedType === 'commerce' && (
          <div className="form-group">
            <label>投入金额（最低{COMMERCE_MIN_AMOUNT}石）</label>
            <div className="amount-input">
              <input
                type="range"
                min={COMMERCE_MIN_AMOUNT}
                max={Math.max(COMMERCE_MIN_AMOUNT, Math.min(status.treasury, 100000))}
                step={1000}
                value={commerceAmount}
                onChange={(e) => setCommerceAmount(Number(e.target.value))}
              />
              <input
                type="number"
                min={COMMERCE_MIN_AMOUNT}
                max={status.treasury}
                step={1000}
                value={commerceAmount}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCommerceAmount(Math.max(COMMERCE_MIN_AMOUNT, Math.min(status.treasury, val)));
                }}
              />
              <span className="unit">石</span>
            </div>
          </div>
        )}

        {/* 普通投资预览 */}
        {selectedType !== 'commerce' && preview && (
          <div className="investment-preview">
            <h4>预计效果</h4>
            {preview.canExecute ? (
              <div className="preview-content">
                <div className="preview-row">
                  <span>使用属性</span>
                  <span>{preview.attributeName}: {preview.samuraiAttribute}</span>
                </div>
                <div className="preview-row">
                  <span>成功率</span>
                  <span className="success-rate">{(preview.successRate * 100).toFixed(0)}%</span>
                </div>
                <div className="preview-row">
                  <span>修正系数</span>
                  <span>{preview.modifierCoefficient.toFixed(2)}</span>
                </div>
                <div className="preview-row">
                  <span>花费</span>
                  <span>{preview.cost.toLocaleString()} 石</span>
                </div>
                <div className="preview-outcomes">
                  <div className="outcome critical">
                    <span className="outcome-label">大成功 (&lt;5)</span>
                    <span className="outcome-value">+{preview.expectedPointsOnCritical}点</span>
                  </div>
                  <div className="outcome success">
                    <span className="outcome-label">成功</span>
                    <span className="outcome-value">+{preview.expectedPointsOnSuccess}点</span>
                  </div>
                  <div className="outcome failure">
                    <span className="outcome-label">失败</span>
                    <span className="outcome-value">+{preview.expectedPointsOnFailure}点</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="preview-error">
                <p>{preview.error}</p>
              </div>
            )}
          </div>
        )}

        {/* 商业投资预览 */}
        {selectedType === 'commerce' && commercePreview && (
          <div className="investment-preview commerce-preview">
            <h4>商业投资预览</h4>
            {commercePreview.canExecute ? (
              <div className="preview-content">
                <div className="preview-row">
                  <span>目标郡国</span>
                  <span>{commercePreview.territoryName}</span>
                </div>
                <div className="preview-row">
                  <span>武将文治</span>
                  <span>{commercePreview.samuraiCivilValue}</span>
                </div>
                <div className="preview-row">
                  <span>成功率</span>
                  <span className="success-rate">{(commercePreview.successRate * 100).toFixed(0)}%</span>
                </div>
                <div className="preview-row">
                  <span>投入金额</span>
                  <span>{commercePreview.cost.toLocaleString()} 石</span>
                </div>
                <div className="commerce-outcomes">
                  <div className="outcome-info">
                    <strong>大成功 (≤5):</strong> 退还50%投资
                  </div>
                  <div className="outcome-info">
                    <strong>成功:</strong> 若有可开发特产则成功开发
                  </div>
                  <div className="outcome-info">
                    <strong>失败:</strong> 投资失败，金额不退还
                  </div>
                </div>
              </div>
            ) : (
              <div className="preview-error">
                <p>{commercePreview.error}</p>
              </div>
            )}
          </div>
        )}

        {/* 执行按钮 */}
        <button
          className="execute-btn"
          disabled={!selectedType || !selectedSamurai || !canExecute || previewLoading}
          onClick={() => setShowConfirmDialog(true)}
        >
          执行投资
        </button>
      </div>

      {/* 确认弹窗 - 统一四种投资的确认对话框 (Requirements: 3.1, 3.2, 3.6) */}
      {showConfirmDialog && (
        <div className="dialog-overlay">
          <div className="dialog confirm-dialog">
            <h3>确认投资</h3>
            <div className="confirm-content">
              <div className="confirm-row">
                <span className="confirm-label">投资类型</span>
                <span className="confirm-value">{INVESTMENT_TYPES.find(t => t.type === selectedType)?.name}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">执行武将</span>
                <span className="confirm-value">{samurais.find(s => s.id === selectedSamurai)?.name}</span>
              </div>
              {selectedType === 'commerce' && commercePreview ? (
                <>
                  <div className="confirm-row">
                    <span className="confirm-label">目标郡国</span>
                    <span className="confirm-value">{commercePreview.territoryName}</span>
                  </div>
                  <div className="confirm-row">
                    <span className="confirm-label">投入金额</span>
                    <span className="confirm-value">{commercePreview.cost.toLocaleString()} 石</span>
                  </div>
                  <div className="confirm-row">
                    <span className="confirm-label">成功率</span>
                    <span className="confirm-value highlight">{(commercePreview.successRate * 100).toFixed(0)}%</span>
                  </div>
                </>
              ) : preview && (
                <>
                  <div className="confirm-row">
                    <span className="confirm-label">使用属性</span>
                    <span className="confirm-value">{preview.attributeName}: {preview.samuraiAttribute}</span>
                  </div>
                  <div className="confirm-row">
                    <span className="confirm-label">花费</span>
                    <span className="confirm-value">{preview.cost.toLocaleString()} 石</span>
                  </div>
                  <div className="confirm-row">
                    <span className="confirm-label">成功率</span>
                    <span className="confirm-value highlight">{(preview.successRate * 100).toFixed(0)}%</span>
                  </div>
                  <div className="confirm-outcomes">
                    <div className="confirm-outcome critical">
                      <span>大成功</span>
                      <span>+{preview.expectedPointsOnCritical}点</span>
                    </div>
                    <div className="confirm-outcome success">
                      <span>成功</span>
                      <span>+{preview.expectedPointsOnSuccess}点</span>
                    </div>
                    <div className="confirm-outcome failure">
                      <span>失败</span>
                      <span>+{preview.expectedPointsOnFailure}点</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="dialog-buttons">
              <button
                className="cancel-btn"
                onClick={() => setShowConfirmDialog(false)}
                disabled={executing}
              >
                取消
              </button>
              <button
                className="confirm-btn"
                onClick={handleExecuteInvestment}
                disabled={executing}
              >
                {executing ? '执行中...' : '确认投资'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 普通投资结果弹窗 - 显示具体数值变化 (Requirements: 3.3, 3.4, 3.5) */}
      {showResultDialog && result && (
        <div className="dialog-overlay">
          <div className={`dialog result-dialog ${result.outcome}`}>
            <h3>
              {result.outcome === 'critical_success' && '🎉 大成功！'}
              {result.outcome === 'success' && '✅ 成功！'}
              {result.outcome === 'failure' && '❌ 失败'}
            </h3>
            <div className="result-content">
              <p className="roll-result">D100: {result.roll}</p>
              <div className="result-detail">
                <span className="result-label">
                  {INVESTMENT_TYPES.find(t => t.type === selectedType)?.name || '投资'}点数变化
                </span>
                <span className={`result-value ${result.outcome !== 'failure' ? 'positive' : 'neutral'}`}>
                  {result.outcome !== 'failure' 
                    ? `+${result.pointsGained} 点`
                    : '+0 点'}
                </span>
              </div>
              <div className="result-summary">
                <p className="new-level">
                  当前{INVESTMENT_TYPES.find(t => t.type === selectedType)?.name}等级: <strong>{result.newLevel}</strong>
                </p>
                <p className="new-points">
                  累计点数: <strong>{result.newPoints}点</strong>
                </p>
              </div>
            </div>
            <button
              className="close-btn"
              onClick={() => {
                setShowResultDialog(false);
                resetForm();
              }}
            >
              确定
            </button>
          </div>
        </div>
      )}

      {/* 商业投资结果弹窗 - 显示特产开发结果或失败原因 (Requirements: 3.3, 3.4, 3.5) */}
      {showResultDialog && commerceResult && (
        <div className="dialog-overlay">
          <div className={`dialog result-dialog commerce-result ${commerceResult.outcome}`}>
            <h3>
              {commerceResult.outcome === 'critical_success' && '🎉 大成功！'}
              {commerceResult.outcome === 'success' && '✅ 成功！'}
              {commerceResult.outcome === 'failure' && '❌ 失败'}
            </h3>
            <div className="result-content">
              <p className="roll-result">D100: {commerceResult.roll}</p>
              <p className="result-message">{commerceResult.message}</p>
              
              <div className="commerce-result-details">
                <div className="result-row">
                  <span className="result-label">投入金额</span>
                  <span className="result-value">{(commerceResult.costDeducted + (commerceResult.refundAmount || 0)).toLocaleString()} 石</span>
                </div>
                <div className="result-row">
                  <span className="result-label">实际花费</span>
                  <span className="result-value">{commerceResult.costDeducted.toLocaleString()} 石</span>
                </div>
                {commerceResult.refundAmount && commerceResult.refundAmount > 0 && (
                  <div className="result-row refund-row">
                    <span className="result-label">退还金额</span>
                    <span className="result-value refund">+{commerceResult.refundAmount.toLocaleString()} 石</span>
                  </div>
                )}
              </div>
              
              {commerceResult.developedProduct && (
                <div className="developed-product">
                  🎁 成功开发特产: <strong>{commerceResult.developedProduct}</strong>
                  <p className="product-hint">下月起开始产出收益</p>
                </div>
              )}
            </div>
            <button
              className="close-btn"
              onClick={() => {
                setShowResultDialog(false);
                resetForm();
              }}
            >
              确定
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvestmentPanel;
