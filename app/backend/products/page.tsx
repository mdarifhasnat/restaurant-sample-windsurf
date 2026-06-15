'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProducts, createProduct, updateProduct, deleteProduct, toggleProductAvailability } from '../_actions/products';
import { getCategories } from '../_actions/categories';
import { Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight, X, ChevronDown } from 'lucide-react';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedProductForOptions, setSelectedProductForOptions] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameDe: '',
    nameEn: '',
    description: '',
    descriptionDe: '',
    descriptionEn: '',
    price: '',
    categoryId: '',
    imageUrl: '',
    imageFile: null as File | null,
    isActive: true,
    isAvailable: true,
    allergens: [] as string[],
    calories: '',
    preparationTime: '',
  });

  // Get filter values from URL params
  const search = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || 'ALL';
  const availabilityFilter = searchParams.get('availability') || 'all';
  const sortBy = searchParams.get('sortBy') || 'nameDe';
  const sortOrder = searchParams.get('sortOrder') || 'asc';

  const loadData = async () => {
    setLoading(true);
    const [productsResult, categoriesResult] = await Promise.all([
      getProducts({
        search: search || undefined,
        categoryId: categoryFilter === 'ALL' ? undefined : categoryFilter,
        availability: availabilityFilter as 'all' | 'available' | 'unavailable',
        sortBy: sortBy as 'nameDe' | 'price',
        sortOrder: sortOrder as 'asc' | 'desc',
      }),
      getCategories(),
    ]);
    if (productsResult.success && productsResult.products) setProducts(productsResult.products);
    if (categoriesResult.success && categoriesResult.categories) setCategories(categoriesResult.categories);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [searchParams]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/backend/products?${params.toString()}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = editingProduct
      ? await updateProduct({ ...formData, id: editingProduct.id })
      : await createProduct(formData);
    if (result.success) {
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      loadData();
      setToast({
        type: 'success',
        message: editingProduct ? 'Produkt erfolgreich aktualisiert' : 'Produkt erfolgreich erstellt',
      });
    } else {
      setToast({
        type: 'error',
        message: result.error || 'Fehler beim Speichern des Produkts',
      });
    }
  };

  const handleDelete = async (productId: string) => {
    if (confirm('Produkt wirklich löschen?')) {
      const result = await deleteProduct(productId);
      if (result.success) {
        loadData();
        setToast({
          type: 'success',
          message: 'Produkt gelöscht',
        });
      } else {
        setToast({
          type: 'error',
          message: result.error || 'Fehler beim Löschen des Produkts',
        });
      }
    }
  };

  const handleToggleAvailability = async (productId: string) => {
    const result = await toggleProductAvailability(productId);
    if (result.success) {
      loadData();
      setToast({
        type: 'success',
        message: 'Verfügbarkeit aktualisiert',
      });
    } else {
      setToast({
        type: 'error',
        message: result.error || 'Fehler beim Aktualisieren der Verfügbarkeit',
      });
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      nameDe: product.nameDe,
      nameEn: product.nameEn,
      description: product.description || '',
      descriptionDe: product.descriptionDe || '',
      descriptionEn: product.descriptionEn || '',
      price: product.price.toString(),
      categoryId: product.categoryId,
      imageUrl: product.imageUrl || '',
      imageFile: null,
      isActive: product.isActive,
      isAvailable: product.isAvailable,
      allergens: product.allergens || [],
      calories: product.calories?.toString() || '',
      preparationTime: product.preparationTime?.toString() || '',
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
      price: '',
      categoryId: '',
      imageUrl: '',
      imageFile: null,
      isActive: true,
      isAvailable: true,
      allergens: [],
      calories: '',
      preparationTime: '',
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(Number(amount));
  };

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produkte</h1>
          <p className="text-gray-600 mt-1">Verwalten Sie alle Produkte</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingProduct(null);
            setShowModal(true);
          }}
          className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Neues Produkt
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Produktname suchen..."
              value={search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="ALL">Alle Kategorien</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nameDe}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>

          {/* Availability Filter */}
          <div className="relative">
            <select
              value={availabilityFilter}
              onChange={(e) => updateFilter('availability', e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="all">Alle Verfügbarkeiten</option>
              <option value="available">Verfügbar</option>
              <option value="unavailable">Nicht verfügbar</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>

          {/* Sorting */}
          <div className="relative">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('-');
                updateFilter('sortBy', sort);
                updateFilter('sortOrder', order);
              }}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="nameDe-asc">Name A → Z</option>
              <option value="nameDe-desc">Name Z → A</option>
              <option value="price-asc">Preis niedrig → hoch</option>
              <option value="price-desc">Preis hoch → niedrig</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Wird geladen...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Keine Produkte gefunden</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produkt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verfügbar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.nameDe}
                            className="w-12 h-12 rounded-lg object-cover mr-4"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{product.nameDe}</p>
                          {product.nameEn && product.nameEn !== product.nameDe && (
                            <p className="text-sm text-gray-600">{product.nameEn}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {product.category?.nameDe}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(product.price.toString())}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleAvailability(product.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        {product.isAvailable ? (
                          <ToggleRight className="w-6 h-6 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Produkt bearbeiten"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProductForOptions(product);
                            setShowOptionsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Optionen verwalten"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Produkt löschen"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingProduct ? 'Produkt bearbeiten' : 'Neues Produkt'}
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
                    Produktname *
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preis (€) *
                    </label>
                    <input
                      type="text"
                      required
                      pattern="^\d+(\.\d{1,2})?$"
                      placeholder="9.90"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategorie *
                    </label>
                    <select
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      <option value="">Kategorie wählen</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nameDe}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Produktbild
                  </label>
                  <div className="space-y-3">
                    {/* Image Preview */}
                    {(formData.imageUrl || formData.imageFile) && (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                        <img
                          src={formData.imageFile ? URL.createObjectURL(formData.imageFile) : formData.imageUrl}
                          alt="Vorschau"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, imageUrl: '', imageFile: null });
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* File Upload */}
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-sm text-gray-500">
                              <span className="font-semibold">Klicken zum Hochladen</span>
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG bis 5MB</p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setFormData({ ...formData, imageFile: file, imageUrl: '' });
                              }
                            }}
                          />
                        </label>
                      </div>

                      {/* URL Input */}
                      <div className="flex-1">
                        <input
                          type="url"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value, imageFile: null })}
                          placeholder="oder Bild-URL eingeben"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 h-32"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kalorien (kcal)
                    </label>
                    <input
                      type="number"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zubereitungszeit (Min)
                    </label>
                    <input
                      type="number"
                      value={formData.preparationTime}
                      onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergene
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      'Gluten',
                      'Milch',
                      'Eier',
                      'Nüsse',
                      'Erdnüsse',
                      'Soja',
                      'Fisch',
                      'Schalentiere',
                      'Senf',
                      'Sesam',
                      'Schwefeldioxid',
                      'Lupinen',
                      'Weichtiere',
                    ].map((allergen) => (
                      <label key={allergen} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.allergens.includes(allergen)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, allergens: [...formData.allergens, allergen] });
                            } else {
                              setFormData({ ...formData, allergens: formData.allergens.filter(a => a !== allergen) });
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{allergen}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Aktiv</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Verfügbar</span>
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
                    {editingProduct ? 'Aktualisieren' : 'Erstellen'}
                  </button>
                </div>
              </form>
            </div>
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

      {/* Product Options Modal */}
      {showOptionsModal && selectedProductForOptions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Optionen für {selectedProductForOptions.nameDe}
                </h2>
                <button
                  onClick={() => {
                    setShowOptionsModal(false);
                    setSelectedProductForOptions(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Hinweis:</strong> Diese Funktion erfordert eine Datenbank-Migration. Führen Sie <code>npx prisma migrate dev --name add_product_options</code> aus, wenn die Datenbank verfügbar ist.
                </p>
              </div>

              <div className="text-center py-8 text-gray-500">
                <p className="mb-2">Optionen-Verwaltung wird nach der Migration aktiviert.</p>
                <p className="text-sm">Die Optionen werden aus der Datenbank geladen und können hier verwaltet werden.</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowOptionsModal(false);
                  setSelectedProductForOptions(null);
                }}
                className="w-full px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
