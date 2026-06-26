'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Save, X } from 'lucide-react';
import {
  getOptionGroupTemplates,
  createOptionGroupTemplate,
  updateOptionGroupTemplate,
  deleteOptionGroupTemplate,
  createOptionTemplateValue,
  updateOptionTemplateValue,
  deleteOptionTemplateValue,
} from '../_actions/option-templates';

interface OptionGroupTemplateValue {
  id: string;
  templateId: string;
  nameDe: string;
  nameEn: string | null;
  extraPrice: number;
  sortOrder: number;
  isActive: boolean;
  isDefault: boolean;
}

interface OptionGroupTemplate {
  id: string;
  nameDe: string;
  nameEn: string | null;
  isRequired: boolean;
  minSelection: number;
  maxSelection: number;
  sortOrder: number;
  isActive: boolean;
  values: OptionGroupTemplateValue[];
}

export default function OptionTemplatesPage() {
  const [templates, setTemplates] = useState<OptionGroupTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<OptionGroupTemplate | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [groupForm, setGroupForm] = useState({
    nameDe: '',
    nameEn: '',
    isRequired: false,
    minSelection: 0,
    maxSelection: 1,
    sortOrder: 0,
    isActive: true,
  });

  const [valueForm, setValueForm] = useState({
    nameDe: '',
    nameEn: '',
    extraPrice: 0,
    sortOrder: 0,
    isActive: true,
    isDefault: false,
  });

  const [showValueForm, setShowValueForm] = useState(false);
  const [editingValue, setEditingValue] = useState<OptionGroupTemplateValue | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    const result = await getOptionGroupTemplates();
    if (result.success) {
      setTemplates(result.templates);
    }
    setLoading(false);
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let result;
      if (editingGroup) {
        result = await updateOptionGroupTemplate(editingGroup.id, groupForm);
      } else {
        result = await createOptionGroupTemplate(groupForm);
      }

      if (result.success) {
        showToast('success', editingGroup ? 'Vorlage aktualisiert' : 'Vorlage erstellt');
        setShowGroupForm(false);
        setEditingGroup(null);
        setGroupForm({
          nameDe: '',
          nameEn: '',
          isRequired: false,
          minSelection: 0,
          maxSelection: 1,
          sortOrder: 0,
          isActive: true,
        });
        loadTemplates();
      } else {
        showToast('error', result.error || 'Fehler beim Speichern');
      }
    } catch (error) {
      showToast('error', 'Fehler beim Speichern');
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Vorlage wirklich löschen?')) return;
    try {
      const result = await deleteOptionGroupTemplate(id);
      if (result.success) {
        showToast('success', 'Vorlage gelöscht');
        loadTemplates();
      } else {
        showToast('error', result.error || 'Fehler beim Löschen');
      }
    } catch (error) {
      showToast('error', 'Fehler beim Löschen');
    }
  };

  const handleValueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId) return;
    try {
      let result;
      if (editingValue) {
        result = await updateOptionTemplateValue(editingValue.id, valueForm);
      } else {
        result = await createOptionTemplateValue(selectedGroupId, valueForm);
      }

      if (result.success) {
        showToast('success', editingValue ? 'Wert aktualisiert' : 'Wert erstellt');
        setShowValueForm(false);
        setEditingValue(null);
        setSelectedGroupId(null);
        setValueForm({
          nameDe: '',
          nameEn: '',
          extraPrice: 0,
          sortOrder: 0,
          isActive: true,
          isDefault: false,
        });
        loadTemplates();
      } else {
        showToast('error', result.error || 'Fehler beim Speichern');
      }
    } catch (error) {
      showToast('error', 'Fehler beim Speichern');
    }
  };

  const handleDeleteValue = async (valueId: string) => {
    if (!confirm('Wert wirklich löschen?')) return;
    try {
      const result = await deleteOptionTemplateValue(valueId);
      if (result.success) {
        showToast('success', 'Wert gelöscht');
        loadTemplates();
      } else {
        showToast('error', result.error || 'Fehler beim Löschen');
      }
    } catch (error) {
      showToast('error', 'Fehler beim Löschen');
    }
  };

  const toggleGroupExpand = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const openGroupForm = (template?: OptionGroupTemplate) => {
    if (template) {
      setEditingGroup(template);
      setGroupForm({
        nameDe: template.nameDe,
        nameEn: template.nameEn || '',
        isRequired: template.isRequired,
        minSelection: template.minSelection,
        maxSelection: template.maxSelection,
        sortOrder: template.sortOrder,
        isActive: template.isActive,
      });
    } else {
      setEditingGroup(null);
      setGroupForm({
        nameDe: '',
        nameEn: '',
        isRequired: false,
        minSelection: 0,
        maxSelection: 1,
        sortOrder: 0,
        isActive: true,
      });
    }
    setShowGroupForm(true);
  };

  const openValueForm = (groupId: string, value?: OptionGroupTemplateValue) => {
    setSelectedGroupId(groupId);
    if (value) {
      setEditingValue(value);
      setValueForm({
        nameDe: value.nameDe,
        nameEn: value.nameEn || '',
        extraPrice: Number(value.extraPrice),
        sortOrder: value.sortOrder,
        isActive: value.isActive,
        isDefault: value.isDefault,
      });
    } else {
      setEditingValue(null);
      setValueForm({
        nameDe: '',
        nameEn: '',
        extraPrice: 0,
        sortOrder: 0,
        isActive: true,
        isDefault: false,
      });
    }
    setShowValueForm(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Optionsgruppen-Vorlagen</h1>
          <p className="text-gray-600 mt-1">Erstellen Sie wiederverwendbare Optionsgruppen für Produkte</p>
        </div>
        <button
          onClick={() => openGroupForm()}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Neue Vorlage
        </button>
      </div>

      {toast && (
        <div className={`mb-6 p-4 rounded-lg ${
          toast.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Group Form Modal */}
      {showGroupForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingGroup ? 'Vorlage bearbeiten' : 'Neue Vorlage erstellen'}
            </h2>
            <form onSubmit={handleGroupSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (DE) *
                </label>
                <input
                  type="text"
                  required
                  value={groupForm.nameDe}
                  onChange={(e) => setGroupForm({ ...groupForm, nameDe: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (EN)
                </label>
                <input
                  type="text"
                  value={groupForm.nameEn}
                  onChange={(e) => setGroupForm({ ...groupForm, nameEn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min. Auswahl
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={groupForm.minSelection}
                    onChange={(e) => setGroupForm({ ...groupForm, minSelection: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max. Auswahl
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={groupForm.maxSelection}
                    onChange={(e) => setGroupForm({ ...groupForm, maxSelection: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={groupForm.isRequired}
                    onChange={(e) => setGroupForm({ ...groupForm, isRequired: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Pflichtfeld</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={groupForm.isActive}
                    onChange={(e) => setGroupForm({ ...groupForm, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Aktiv</span>
                </label>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                >
                  Speichern
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowGroupForm(false);
                    setEditingGroup(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Value Form Modal */}
      {showValueForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingValue ? 'Wert bearbeiten' : 'Neuen Wert erstellen'}
            </h2>
            <form onSubmit={handleValueSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (DE) *
                </label>
                <input
                  type="text"
                  required
                  value={valueForm.nameDe}
                  onChange={(e) => setValueForm({ ...valueForm, nameDe: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (EN)
                </label>
                <input
                  type="text"
                  value={valueForm.nameEn}
                  onChange={(e) => setValueForm({ ...valueForm, nameEn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aufpreis (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={valueForm.extraPrice}
                  onChange={(e) => setValueForm({ ...valueForm, extraPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={valueForm.isDefault}
                    onChange={(e) => setValueForm({ ...valueForm, isDefault: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Standard</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={valueForm.isActive}
                    onChange={(e) => setValueForm({ ...valueForm, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Aktiv</span>
                </label>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                >
                  Speichern
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowValueForm(false);
                    setEditingValue(null);
                    setSelectedGroupId(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Templates List */}
      <div className="space-y-4">
        {templates.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center text-gray-500">
            Keine Vorlagen vorhanden. Erstellen Sie Ihre erste Vorlage.
          </div>
        ) : (
          templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleGroupExpand(template.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {expandedGroups.has(template.id) ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <h3 className="font-semibold text-gray-900">{template.nameDe}</h3>
                      {template.nameEn && (
                        <p className="text-sm text-gray-500">{template.nameEn}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 ml-8">
                    <span className="text-xs text-gray-500">
                      {template.isRequired && 'Pflichtfeld • '}
                      Min: {template.minSelection} • Max: {template.maxSelection}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {template.isActive ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openGroupForm(template)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(template.id)}
                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {expandedGroups.has(template.id) && (
                <div className="border-t border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Werte ({template.values.length})</h4>
                    <button
                      onClick={() => openValueForm(template.id)}
                      className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Wert hinzufügen
                    </button>
                  </div>
                  {template.values.length === 0 ? (
                    <p className="text-sm text-gray-500">Keine Werte vorhanden</p>
                  ) : (
                    <div className="space-y-2">
                      {template.values.map((value) => (
                        <div key={value.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <span className="text-sm font-medium">{value.nameDe}</span>
                            {value.nameEn && <span className="text-sm text-gray-500 ml-2">({value.nameEn})</span>}
                            {value.extraPrice > 0 && (
                              <span className="text-sm text-gray-600 ml-2">+{value.extraPrice.toFixed(2)}€</span>
                            )}
                            {value.isDefault && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded ml-2">Standard</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openValueForm(template.id, value)}
                              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteValue(value.id)}
                              className="p-1 text-red-600 hover:text-red-900 hover:bg-red-100 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
