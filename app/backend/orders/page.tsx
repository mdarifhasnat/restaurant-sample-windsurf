'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getOrders, updateOrderStatus } from '../_actions/orders';
import { Search, Filter, Eye, ChevronDown, Calendar } from 'lucide-react';
import { OrderStatus } from '@prisma/client';
import Link from 'next/link';

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Get filter values from URL params
  const search = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || 'ALL';
  const orderTypeFilter = searchParams.get('orderType') || 'ALL';
  const plzFilter = searchParams.get('plz') || '';
  const dateFilter = searchParams.get('dateFilter') || '';
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const page = parseInt(searchParams.get('page') || '1');

  const loadOrders = async () => {
    setLoading(true);
    
    // Calculate date range based on dateFilter
    let fromDate: Date | undefined;
    let toDate: Date | undefined;
    
    if (dateFilter) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (dateFilter) {
        case 'today':
          fromDate = today;
          toDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'yesterday':
          fromDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
          toDate = today;
          break;
        case 'last7days':
          fromDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          toDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'thisMonth':
          fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
          toDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
        case 'lastMonth':
          fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          toDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }
    } else if (dateFrom) {
      fromDate = new Date(dateFrom);
    }
    
    if (dateTo) {
      toDate = new Date(dateTo);
      // Set to end of day
      toDate.setHours(23, 59, 59, 999);
    }

    const result = await getOrders({
      search: search || undefined,
      status: statusFilter === 'ALL' ? undefined : statusFilter as OrderStatus,
      orderType: orderTypeFilter === 'ALL' ? undefined : orderTypeFilter as 'DELIVERY' | 'PICKUP',
      plz: plzFilter || undefined,
      dateFrom: fromDate,
      dateTo: toDate,
      sortBy: sortBy as 'createdAt' | 'total',
      sortOrder: sortOrder as 'asc' | 'desc',
      limit: 25,
      offset: (page - 1) * 25,
    });
    
    if (result.success && result.orders) {
      setOrders(result.orders);
      setTotal(result.total || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, [searchParams]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1'); // Reset to page 1 when filter changes
    router.push(`/backend/orders?${params.toString()}`);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    const result = await updateOrderStatus({ orderId, status: newStatus });
    if (result.success) {
      loadOrders();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(Number(amount));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PREPARING: 'bg-purple-100 text-purple-800',
      READY: 'bg-green-100 text-green-800',
      DELIVERED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Ausstehend',
      CONFIRMED: 'Bestätigt',
      PREPARING: 'In Zubereitung',
      READY: 'Bereit',
      DELIVERED: 'Geliefert',
      CANCELLED: 'Storniert',
    };
    return labels[status] || status;
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bestellungen</h1>
        <p className="text-gray-600 mt-1">Verwalten Sie alle Bestellungen</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="space-y-4">
          {/* First Row: Search, Status, Order Type, PLZ */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Bestellnummer, E-Mail, Telefon..."
                value={search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="ALL">Alle Status</option>
                <option value="PENDING">Ausstehend</option>
                <option value="CONFIRMED">Bestätigt</option>
                <option value="PREPARING">In Zubereitung</option>
                <option value="READY">Bereit</option>
                <option value="DELIVERED">Geliefert</option>
                <option value="CANCELLED">Storniert</option>
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>

            {/* Order Type Filter */}
            <div className="relative">
              <select
                value={orderTypeFilter}
                onChange={(e) => updateFilter('orderType', e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="ALL">Alle Typen</option>
                <option value="DELIVERY">Lieferung</option>
                <option value="PICKUP">Abholung</option>
              </select>
            </div>

            {/* PLZ Filter */}
            <div className="relative">
              <input
                type="text"
                placeholder="PLZ..."
                value={plzFilter}
                onChange={(e) => updateFilter('plz', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>

          {/* Second Row: Date Filters and Sorting */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Date Quick Filters */}
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => {
                  updateFilter('dateFilter', e.target.value);
                  if (e.target.value) {
                    updateFilter('dateFrom', '');
                    updateFilter('dateTo', '');
                  }
                }}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="">Zeitraum wählen</option>
                <option value="today">Heute</option>
                <option value="yesterday">Gestern</option>
                <option value="last7days">Letzte 7 Tage</option>
                <option value="thisMonth">Dieser Monat</option>
                <option value="lastMonth">Letzter Monat</option>
              </select>
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>

            {/* Custom Date From */}
            <div>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  updateFilter('dateFrom', e.target.value);
                  updateFilter('dateFilter', '');
                }}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            {/* Custom Date To */}
            <div>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  updateFilter('dateTo', e.target.value);
                  updateFilter('dateFilter', '');
                }}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
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
                <option value="createdAt-desc">Neueste zuerst</option>
                <option value="createdAt-asc">Älteste zuerst</option>
                <option value="total-desc">Höchster Betrag</option>
                <option value="total-asc">Niedrigster Betrag</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Wird geladen...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Keine Bestellungen gefunden</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bestellnummer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kunde
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Typ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Betrag
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.orderType === 'DELIVERY' ? 'Lieferung' : 'Abholung'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(Number(order.total))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/backend/orders/${order.id}`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <div className="relative">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order.id, e.target.value as OrderStatus)}
                            className="appearance-none bg-white border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-gray-900"
                          >
                            <option value="PENDING">Ausstehend</option>
                            <option value="CONFIRMED">Bestätigt</option>
                            <option value="PREPARING">In Zubereitung</option>
                            <option value="READY">Bereit</option>
                            <option value="DELIVERED">Geliefert</option>
                            <option value="CANCELLED">Storniert</option>
                          </select>
                          <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 25 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Zeige {(page - 1) * 25 + 1} bis {Math.min(page * 25, total)} von {total} Bestellungen
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateFilter('page', (page - 1).toString())}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Zurück
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Seite {page} von {Math.ceil(total / 25)}
            </span>
            <button
              onClick={() => updateFilter('page', (page + 1).toString())}
              disabled={page >= Math.ceil(total / 25)}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Weiter
            </button>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDetails(false)} />
            <div className="relative bg-white rounded-xl max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Bestellung {selectedOrder.orderNumber}
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Kunde</p>
                  <p className="font-medium">{selectedOrder.email}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lieferadresse</p>
                  <p className="font-medium">
                    {selectedOrder.deliveryStreet} {selectedOrder.deliveryHouseNumber}
                  </p>
                  <p className="font-medium">
                    {selectedOrder.deliveryPostalCode} {selectedOrder.deliveryCity}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Artikel</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <p className="font-medium">{item.productNameDe}</p>
                          <p className="text-sm text-gray-600">Menge: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatCurrency(Number(item.productPrice))}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Gesamt</span>
                    <span>{formatCurrency(Number(selectedOrder.total))}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="mt-6 w-full bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
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
