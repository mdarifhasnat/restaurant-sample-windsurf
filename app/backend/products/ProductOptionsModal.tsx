'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';
import {
  getOptionGroups,
  createOptionGroup,
  updateOptionGroup,
  deleteOptionGroup,
  createOptionValue,
  updateOptionValue,
  deleteOptionValue,
} from '../_actions/option-groups';

interface ProductOptionsModalProps {
  product: any;
  onClose: () => void;
}

interface OptionGroup {
  id: string;
  nameDe: string;
  nameEn: string | null;
  sortOrder: number;
  isActive: boolean;
  isRequired: boolean;
  minSelection: number;
  maxSelection: number;
  values: OptionValue[];
}

interface OptionValue {
  id: string;
  nameDe: string;
  nameEn: string | null;
  extraPrice: number;
  sortOrder: number;
  isActive: boolean;
  isDefault: boolean;
}

export default function ProductOptionsModal({ product, onClose }: ProductOptionsModalProps) {
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<OptionGroup | null>(null);
  const [showValueForm, setShowValueForm] = useState(false);
  const [editingValue, setEditingValue] = useState<OptionValue | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [groupForm, setGroupForm] = useState({
    nameDe: '',
    nameEn: '',
    sortOrder: 0,
    isActive: true,
    isRequired: false,
    minSelection: 0,
    maxSelection: 1,
  });

  const [valueForm, setValueForm] = useState({
    nameDe: '',
    nameEn: '',
    extraPrice: 0,
    sortOrder: 0,
    isActive: true,
    isDefault: false,
  });

  useEffect(() => {
    loadOptionGroups();
  }, [product.id]);

  const loadOptionGroups = async () => {
    setLoading(true);
    try {
      const result = await getOptionGroups(product.id);
      if (result.success) {
        setOptionGroups(result.optionGroups);
      } else {
        setToast({ type: 'error', message: result.error || 'Fehler beim Laden der Optionsgruppen' });
      }
    } catch (error) {
      console.error('Error loading option groups:', error);
      setToast({ type: 'error', message: 'Fehler beim Laden der Optionsgruppen' });
    } finally {
      setLoading(false);
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

  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let result;
      if (editingGroup) {
        result = await updateOptionGroup(editingGroup.id, groupForm);
      } else {
        result = await createOptionGroup({ ...groupForm, productId: product.id });
      }

      if (result.success) {
        setShowGroupForm(false);
        setEditingGroup(null);
        setGroupForm({
          nameDe: '',
          nameEn: '',
          sortOrder: 0,
          isActive: true,
          isRequired: false,
          minSelection: 0,
          maxSelection: 1,
        });
        setToast({ type: 'success', message: editingGroup ? 'Optionsgruppe aktualisiert' : 'Optionsgruppe erstellt' });
        loadOptionGroups();
      } else {
        setToast({ type: 'error', message: result.error || 'Fehler beim Speichern der Optionsgruppe' });
      }
    } catch (error) {
      console.error('Error saving option group:', error);
      setToast({ type: 'error', message: 'Fehler beim Speichern der Optionsgruppe' });
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Optionsgruppe wirklich löschen?')) return;
    try {
      const result = await deleteOptionGroup(groupId);
      if (result.success) {
        setToast({ type: 'success', message: 'Optionsgruppe gelöscht' });
        loadOptionGroups();
      } else {
        setToast({ type: 'error', message: result.error || 'Fehler beim Löschen der Optionsgruppe' });
      }
    } catch (error) {
      console.error('Error deleting option group:', error);
      setToast({ type: 'error', message: 'Fehler beim Löschen der Optionsgruppe' });
    }
  };

  const handleValueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId) return;
    try {
      let result;
      if (editingValue) {
        result = await updateOptionValue(editingValue.id, valueForm);
      } else {
        result = await createOptionValue(selectedGroupId, valueForm);
      }

      if (result.success) {
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
        setToast({ type: 'success', message: editingValue ? 'Optionswert aktualisiert' : 'Optionswert erstellt' });
        loadOptionGroups();
      } else {
        setToast({ type: 'error', message: result.error || 'Fehler beim Speichern des Optionswerts' });
      }
    } catch (error) {
      console.error('Error saving option value:', error);
      setToast({ type: 'error', message: 'Fehler beim Speichern des Optionswerts' });
    }
  };

  const handleDeleteValue = async (groupId: string, valueId: string) => {
    if (!confirm('Optionswert wirklich löschen?')) return;
    try {
      const result = await deleteOptionValue(valueId);
      if (result.success) {
        setToast({ type: 'success', message: 'Optionswert gelöscht' });
        loadOptionGroups();
      } else {
        setToast({ type: 'error', message: result.error || 'Fehler beim Löschen des Optionswerts' });
      }
    } catch (error) {
      console.error('Error deleting option value:', error);
      setToast({ type: 'error', message: 'Fehler beim Löschen des Optionswerts' });
    }
  };

  const openGroupForm = (group?: OptionGroup) => {
    if (group) {
      setEditingGroup(group);
      setGroupForm({
        nameDe: group.nameDe,
        nameEn: group.nameEn || '',
        sortOrder: group.sortOrder,
        isActive: group.isActive,
        isRequired: group.isRequired,
        minSelection: group.minSelection,
        maxSelection: group.maxSelection,
      });
    } else {
      setEditingGroup(null);
      setGroupForm({
        nameDe: '',
        nameEn: '',
        sortOrder: 0,
        isActive: true,
        isRequired: false,
        minSelection: 0,
        maxSelection: 1,
      });
    }
    setShowGroupForm(true);
  };

  const openValueForm = (groupId: string, value?: OptionValue) => {
    setSelectedGroupId(groupId);
    if (value) {
      setEditingValue(value);
      setValueForm({
        nameDe: value.nameDe,
        nameEn: value.nameEn || '',
        extraPrice: value.extraPrice,
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Optionen für {product.nameDe}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Wird geladen...</div>
          ) : (
            <>
              {/* Add Group Button */}
              <button
                onClick={() => openGroupForm()}
                className="w-full mb-6 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Neue Optionsgruppe
              </button>

              {/* Option Groups List */}
              {optionGroups.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Keine Optionsgruppen vorhanden
                </div>
              ) : (
                <div className="space-y-4">
                  {optionGroups.map((group) => (
                    <div key={group.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Group Header */}
                      <div className="p-4 bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleGroupExpand(group.id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {expandedGroups.has(group.id) ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                          <div>
                            <h3 className="font-semibold text-gray-900">{group.nameDe}</h3>
                            {group.nameEn && (
                              <p className="text-sm text-gray-600">{group.nameEn}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {group.isRequired && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                Pflicht
                              </span>
                            )}
                            {!group.isActive && (
                              <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                                Inaktiv
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openGroupForm(group)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Group Details (Expanded) */}
                      {expandedGroups.has(group.id) && (
                        <div className="p-4 border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                            <div>
                              <span className="text-gray-500">Min. Auswahl:</span>{' '}
                              <span className="font-medium">{group.minSelection}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Max. Auswahl:</span>{' '}
                              <span className="font-medium">{group.maxSelection}</span>
                            </div>
                          </div>

                          {/* Add Value Button */}
                          <button
                            onClick={() => openValueForm(group.id)}
                            className="w-full mb-4 px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                          >
                            <Plus className="w-4 h-4" />
                            Neuer Optionswert
                          </button>

                          {/* Values List */}
                          {group.values.length === 0 ? (
                            <div className="text-center py-4 text-gray-500 text-sm">
                              Keine Optionswerte vorhanden
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {group.values.map((value) => (
                                <div
                                  key={value.id}
                                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <div>
                                      <p className="font-medium text-gray-900">{value.nameDe}</p>
                                      {value.nameEn && (
                                        <p className="text-sm text-gray-600">{value.nameEn}</p>
                                      )}
                                      {value.extraPrice > 0 && (
                                        <p className="text-sm text-green-600">+{value.extraPrice.toFixed(2)}€</p>
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      {value.isDefault && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                          Standard
                                        </span>
                                      )}
                                      {!value.isActive && (
                                        <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                                          Inaktiv
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => openValueForm(group.id, value)}
                                      className="text-gray-600 hover:text-gray-900"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteValue(group.id, value.id)}
                                      className="text-red-600 hover:text-red-900"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Group Form Modal */}
        {showGroupForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editingGroup ? 'Optionsgruppe bearbeiten' : 'Neue Optionsgruppe'}
              </h3>
              <form onSubmit={handleGroupSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deutscher Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={groupForm.nameDe}
                    onChange={(e) => setGroupForm({ ...groupForm, nameDe: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Englischer Name
                  </label>
                  <input
                    type="text"
                    value={groupForm.nameEn}
                    onChange={(e) => setGroupForm({ ...groupForm, nameEn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
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
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
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
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={groupForm.isRequired}
                      onChange={(e) => setGroupForm({ ...groupForm, isRequired: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Pflichtfeld</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={groupForm.isActive}
                      onChange={(e) => setGroupForm({ ...groupForm, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Aktiv</span>
                  </label>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGroupForm(false);
                      setEditingGroup(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Speichern
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Value Form Modal */}
        {showValueForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editingValue ? 'Optionswert bearbeiten' : 'Neuer Optionswert'}
              </h3>
              <form onSubmit={handleValueSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deutscher Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={valueForm.nameDe}
                    onChange={(e) => setValueForm({ ...valueForm, nameDe: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Englischer Name
                  </label>
                  <input
                    type="text"
                    value={valueForm.nameEn}
                    onChange={(e) => setValueForm({ ...valueForm, nameEn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aufschlag (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={valueForm.extraPrice}
                    onChange={(e) => setValueForm({ ...valueForm, extraPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={valueForm.isDefault}
                      onChange={(e) => setValueForm({ ...valueForm, isDefault: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Standard</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={valueForm.isActive}
                      onChange={(e) => setValueForm({ ...valueForm, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Aktiv</span>
                  </label>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowValueForm(false);
                      setEditingValue(null);
                      setSelectedGroupId(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Speichern
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-4 right-4 z-50">
            <div
              className={`px-6 py-4 rounded-lg shadow-lg ${
                toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {toast.message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
