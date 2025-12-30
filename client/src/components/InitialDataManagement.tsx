/**
 * 初始数据管理组件
 * Requirements: 2.5.2, 2.5.3, 2.5.4, 2.5.5
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Territory } from '../types';
import {
  getInitialData,
  saveCurrentAsInitialData,
  updateInitialData,
  InitialData,
} from '../api';
import { DataTable, Column } from './DataTable';
import './InitialDataManagement.css';

interface EditingTerritory {
  id: string;
  baseKokudaka: number;
  specialProduct1: string;
  specialProduct2: string;
  specialProduct3: string;
  developableProduct: string;
}

export function InitialDataManagement() {
  const [initialData, setInitialData] = useState<InitialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingTerritory, setEditingTerritory] = useState<EditingTerritory | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [modifiedTerritories, setModifiedTerritories] = useState<Map<string, Partial<Territory>>>(new Map());

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getInitialData();
      if (response.success && response.data) {
        setInitialData(response.data);
      } else {
        setError(response.error || '加载初始数据失败');
      }
    } catch {
      setError('加载初始数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleSaveCurrentAsInitial = async () => {
    if (!confirm('确定要将当前游戏数据保存为初始数据吗？这将覆盖现有的初始数据。')) {
      return;
    }

    setSaving(true);
    try {
      const response = await saveCurrentAsInitialData();
      if (response.success) {
        alert('已保存当前数据为初始数据');
        loadInitialData();
      } else {
        alert(response.error || '保存失败');
      }
    } catch {
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleEditTerritory = (territory: Territory) => {
    setEditingTerritory({
      id: territory.id,
      baseKokudaka: territory.baseKokudaka,
      specialProduct1: territory.specialProduct1 || '',
      specialProduct2: territory.specialProduct2 || '',
      specialProduct3: territory.specialProduct3 || '',
      developableProduct: territory.developableProduct || '',
    });
  };

  const handleSaveTerritory = () => {
    if (!editingTerritory || !initialData) return;

    const updates: Partial<Territory> = {
      baseKokudaka: editingTerritory.baseKokudaka,
      specialProduct1: editingTerritory.specialProduct1 || undefined,
      specialProduct2: editingTerritory.specialProduct2 || undefined,
      specialProduct3: editingTerritory.specialProduct3 || undefined,
      developableProduct: editingTerritory.developableProduct || undefined,
    };

    const newModified = new Map(modifiedTerritories);
    newModified.set(editingTerritory.id, updates);
    setModifiedTerritories(newModified);
    setHasChanges(true);
    setEditingTerritory(null);
  };

  const handleSaveAllChanges = async () => {
    if (!initialData || modifiedTerritories.size === 0) return;

    if (!confirm('确定要保存所有修改吗？')) {
      return;
    }

    setSaving(true);
    try {
      // 合并修改到territories
      const updatedTerritories = initialData.territories.map((t: Territory) => {
        const modifications = modifiedTerritories.get(t.id);
        if (modifications) {
          return { ...t, ...modifications };
        }
        return t;
      });

      const response = await updateInitialData(updatedTerritories);
      if (response.success) {
        alert('初始数据已更新');
        setModifiedTerritories(new Map());
        setHasChanges(false);
        loadInitialData();
      } else {
        alert(response.error || '保存失败');
      }
    } catch {
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    if (!confirm('确定要放弃所有未保存的修改吗？')) {
      return;
    }
    setModifiedTerritories(new Map());
    setHasChanges(false);
  };

  // 获取显示用的territories（合并修改）
  const getDisplayTerritories = (): Territory[] => {
    if (!initialData) return [];
    return initialData.territories.map((t: Territory) => {
      const modifications = modifiedTerritories.get(t.id);
      if (modifications) {
        return { ...t, ...modifications };
      }
      return t;
    });
  };

  const columns: Column<Territory>[] = [
    { key: 'provinceName', title: '令制国', width: '80px' },
    { key: 'districtName', title: '郡名', width: '100px' },
    { 
      key: 'baseKokudaka', 
      title: '初始石高', 
      width: '100px',
      render: (row: Territory) => {
        const isModified = modifiedTerritories.has(row.id);
        return (
          <span className={isModified ? 'modified-value' : ''}>
            {row.baseKokudaka.toLocaleString()}
          </span>
        );
      }
    },
    { 
      key: 'specialProduct1', 
      title: '特产1', 
      width: '100px',
      render: (row: Territory) => row.specialProduct1 || '-'
    },
    { 
      key: 'specialProduct2', 
      title: '特产2', 
      width: '100px',
      render: (row: Territory) => row.specialProduct2 || '-'
    },
    { 
      key: 'specialProduct3', 
      title: '特产3', 
      width: '100px',
      render: (row: Territory) => row.specialProduct3 || '-'
    },
    { 
      key: 'developableProduct', 
      title: '可开发特产', 
      width: '100px',
      render: (row: Territory) => row.developableProduct || '-'
    },
    {
      key: 'actions',
      title: '操作',
      width: '80px',
      render: (row: Territory) => (
        <button
          className="btn btn-sm btn-secondary"
          onClick={() => handleEditTerritory(row)}
        >
          编辑
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="initial-data-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="initial-data-management">
        <div className="management-section">
          <div className="management-header">
            <h2>初始数据管理</h2>
            <button className="btn btn-primary" onClick={handleSaveCurrentAsInitial} disabled={saving}>
              {saving ? '保存中...' : '保存当前数据为初始数据'}
            </button>
          </div>
          <div className="management-body">
            <div className="empty-state">
              <p>{error}</p>
              <button className="btn btn-primary" onClick={handleSaveCurrentAsInitial} disabled={saving}>
                {saving ? '保存中...' : '保存当前数据为初始数据'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="initial-data-management">
      <div className="management-section">
        <div className="management-header">
          <h2>初始数据管理</h2>
          <div className="management-actions">
            {hasChanges && (
              <>
                <button className="btn btn-secondary" onClick={handleDiscardChanges}>
                  放弃修改
                </button>
                <button className="btn btn-success" onClick={handleSaveAllChanges} disabled={saving}>
                  {saving ? '保存中...' : '保存所有修改'}
                </button>
              </>
            )}
            <button className="btn btn-primary" onClick={handleSaveCurrentAsInitial} disabled={saving}>
              {saving ? '保存中...' : '重新保存当前数据'}
            </button>
          </div>
        </div>

        <div className="management-body">
          {initialData && (
            <div className="initial-data-info">
              <p>
                <strong>创建时间：</strong>
                {new Date(initialData.createdAt).toLocaleString()}
              </p>
              <p>
                <strong>郡国数量：</strong>
                {initialData.territories.length}
              </p>
              {hasChanges && (
                <p className="changes-warning">
                  <strong>⚠️ 有 {modifiedTerritories.size} 个郡国已修改，请保存更改</strong>
                </p>
              )}
            </div>
          )}

          <DataTable
            data={getDisplayTerritories()}
            columns={columns}
            rowKey={(t) => t.id}
            emptyText="暂无初始数据"
          />
        </div>
      </div>

      {/* 编辑对话框 */}
      {editingTerritory && (
        <div className="modal-overlay" onClick={() => setEditingTerritory(null)}>
          <div className="modal-content" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>编辑初始数据</h3>
              <button className="modal-close" onClick={() => setEditingTerritory(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>初始石高</label>
                <input
                  type="number"
                  value={editingTerritory.baseKokudaka}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingTerritory({
                    ...editingTerritory,
                    baseKokudaka: parseInt(e.target.value) || 0
                  })}
                />
              </div>
              <div className="form-group">
                <label>特产1</label>
                <input
                  type="text"
                  value={editingTerritory.specialProduct1}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingTerritory({
                    ...editingTerritory,
                    specialProduct1: e.target.value
                  })}
                  placeholder="留空表示无特产"
                />
              </div>
              <div className="form-group">
                <label>特产2</label>
                <input
                  type="text"
                  value={editingTerritory.specialProduct2}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingTerritory({
                    ...editingTerritory,
                    specialProduct2: e.target.value
                  })}
                  placeholder="留空表示无特产"
                />
              </div>
              <div className="form-group">
                <label>特产3</label>
                <input
                  type="text"
                  value={editingTerritory.specialProduct3}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingTerritory({
                    ...editingTerritory,
                    specialProduct3: e.target.value
                  })}
                  placeholder="留空表示无特产"
                />
              </div>
              <div className="form-group">
                <label>可开发特产</label>
                <input
                  type="text"
                  value={editingTerritory.developableProduct}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingTerritory({
                    ...editingTerritory,
                    developableProduct: e.target.value
                  })}
                  placeholder="留空表示无可开发特产"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditingTerritory(null)}>
                取消
              </button>
              <button className="btn btn-primary" onClick={handleSaveTerritory}>
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InitialDataManagement;
