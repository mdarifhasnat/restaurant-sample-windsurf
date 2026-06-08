'use client';

import { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../_actions/categories';
import { Search, Plus, Edit, Trash2, X, GripVertical } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameDe: '',
    nameEn: '',
    description: '',
    descriptionDe: '',
    descriptionEn: '',
    sortOrder: 0,
    imageUrl: '',
    isActive: true,
  });

  const loadData = async () => {
    setLoading(true);
    const result = await getCategories({ search: search || undefined });
    if (result.success && result.categories) setCategories(result.categories);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = editingCategory
      ? await updateCategory({ ...formData, id: editingCategory.id })
      : await createCategory(formData);
    if (result.success) {
      setShowModal(false);
      setEditingCategory(null);
      resetForm();
      loadData();
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (confirm('Kategorie wirklich löschen?')) {
      const result = await deleteCategory(categoryId);
      if (result.success) {
        loadData();
      } else {
        alert(result.error);
      }
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      nameDe: category.nameDe,
      nameEn: category.nameEn,
      description: category.description || '',
      descriptionDe: category.descriptionDe || '',
      descriptionEn: category.descriptionEn || '',
      sortOrder: category.sortOrder,
      imageUrl: category.imageUrl || '',
      isActive: category.isActive,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameDe: '',
      nameEn: '',
      description: '',
      descriptionDe: '',
      descriptionEn: '',
      sortOrder: 0,
      imageUrl: '',
      isActive: true,
    });
  };

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kategorien</h1>
          <p className="text-gray-600 mt-1">Verwalten Sie alle Kategorien</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingCategory(null);
            setShowModal(true);
          }}
          className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Neue Kategorie
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Kategorien suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadData()}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center text-gray-500">Wird geladen...</div>
        ) : categories.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500">Keine Kategorien gefunden</div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {category.imageUrl && (
                    <img
                      src={category.imageUrl}
                      alt={category.nameDe}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.nameDe}</h3>
                    <p className="text-sm text-gray-600">{category.nameEn}</p>
                  </div>
                </div>
                <GripVertical className="w-5 h-5 text-gray-400" />
              </div>

              {category.descriptionDe && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {category.descriptionDe}
                </p>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{category._count?.products || 0} Produkte</span>
                <span>Sortierung: {category.sortOrder}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Bearbeiten
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="px-3 py-2 border border-red-200 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-xl max-w-lg w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingCategory ? 'Kategorie bearbeiten' : 'Neue Kategorie'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategoriename *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deutscher Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nameDe}
                      onChange={(e) => setFormData({ ...formData, nameDe: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Englischer Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beschreibung
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deutsche Beschreibung
                    </label>
                    <textarea
                      value={formData.descriptionDe}
                      onChange={(e) => setFormData({ ...formData, descriptionDe: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Englische Beschreibung
                    </label>
                    <textarea
                      value={formData.descriptionEn}
                      onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sortierreihenfolge
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bild-URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Aktiv</span>
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    {editingCategory ? 'Aktualisieren' : 'Erstellen'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
