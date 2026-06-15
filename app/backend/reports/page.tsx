'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getReportData } from '../_actions/reports';
import { Search, Calendar, Download, FileText, DollarSign, ShoppingBag, CheckCircle, XCircle, TrendingUp, Truck, Store, CreditCard, ChevronDown } from 'lucide-react';

export default function ReportsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Get filter values from URL params
  const dateFilter = searchParams.get('dateFilter') || '';
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';

  const loadReportData = async () => {
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

    const result = await getReportData({
      dateFrom: fromDate,
      dateTo: toDate,
    });
    
    if (result.success) {
      setReportData(result);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReportData();
  }, [searchParams]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/backend/reports?${params.toString()}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  const exportCSV = () => {
    if (!reportData || !reportData.orders) return;

    const orders = reportData.orders;
    const headers = ['date', 'orderNumber', 'email', 'phone', 'postalCode', 'orderType', 'status', 'subtotal', 'deliveryFee', 'discountAmount', 'total'];
    const csvContent = [
      headers.join(','),
      ...orders.map((order: any) => [
        formatDate(order.createdAt),
        order.orderNumber,
        order.email,
        order.phone,
        order.deliveryPostalCode || '',
        order.orderType,
        order.status,
        order.subtotal,
        order.deliveryFee,
        order.discountAmount,
        order.total,
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `speisenreise-orders-${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const params = new URLSearchParams();
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    window.open(`/api/backend/reports/pdf?${params.toString()}`, '_blank');
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
        <h1 className="text-3xl font-bold text-gray-900">Berichte</h1>
        <p className="text-gray-600 mt-1">Umsatz- und Bestellübersicht für Restaurantbetreiber und Steuerberater</p>
      </div>

      {/* Date Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
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

          {/* Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              disabled={!reportData || reportData.orders.length === 0}
              className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              CSV exportieren
            </button>
            <button
              onClick={exportPDF}
              disabled={!reportData || reportData.orders.length === 0}
              className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-4 h-4" />
              PDF herunterladen
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Wird geladen...</div>
      ) : !reportData ? (
        <div className="p-8 text-center text-gray-500">Keine Daten verfügbar</div>
      ) : (
        <>
          {/* Report Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Total Revenue */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 text-green-600" />
                <span className="text-sm text-gray-500">Gesamtumsatz</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.summary.totalRevenue)}</p>
              <p className="text-sm text-gray-500 mt-1">Nicht stornierte Bestellungen</p>
            </div>

            {/* Total Orders */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <ShoppingBag className="w-8 h-8 text-blue-600" />
                <span className="text-sm text-gray-500">Gesamtbestellungen</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalOrders}</p>
              <p className="text-sm text-gray-500 mt-1">Alle Bestellungen</p>
            </div>

            {/* Delivered Orders */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <span className="text-sm text-gray-500">Gelieferte Bestellungen</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{reportData.summary.deliveredOrdersCount}</p>
              <p className="text-sm text-gray-500 mt-1">Status: Geliefert</p>
            </div>

            {/* Cancelled Orders */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
                <span className="text-sm text-gray-500">Stornierte Bestellungen</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{reportData.summary.cancelledOrdersCount}</p>
              <p className="text-sm text-gray-500 mt-1">Status: Storniert</p>
            </div>

            {/* Average Order Value */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <span className="text-sm text-gray-500">Durchschnittlicher Bestellwert</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.summary.averageOrderValue)}</p>
              <p className="text-sm text-gray-500 mt-1">Umsatz / Bestellungen</p>
            </div>

            {/* Delivery Orders */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <Truck className="w-8 h-8 text-orange-600" />
                <span className="text-sm text-gray-500">Lieferungen</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{reportData.summary.deliveryOrdersCount}</p>
              <p className="text-sm text-gray-500 mt-1">Bestelltyp: Lieferung</p>
            </div>

            {/* Pickup Orders */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <Store className="w-8 h-8 text-teal-600" />
                <span className="text-sm text-gray-500">Abholungen</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{reportData.summary.pickupOrdersCount}</p>
              <p className="text-sm text-gray-500 mt-1">Bestelltyp: Abholung</p>
            </div>

            {/* Delivery Fee Total */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <CreditCard className="w-8 h-8 text-indigo-600" />
                <span className="text-sm text-gray-500">Liefergebühr gesamt</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.summary.deliveryFeeTotal)}</p>
              <p className="text-sm text-gray-500 mt-1">Summe aller Liefergebühren</p>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Zahlungsübersicht</h2>
            {Object.keys(reportData.paymentSummary).length === 0 ? (
              <p className="text-gray-500">No payment data available yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(reportData.paymentSummary).map(([method, amount]) => (
                  <div key={method} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{method}</span>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tax Advisor Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Steuerberater Übersicht</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Zeitraum</p>
                <p className="font-medium text-gray-900">
                  {reportData.taxAdvisor.dateRange.from ? formatDate(reportData.taxAdvisor.dateRange.from) : 'Alle'} - {reportData.taxAdvisor.dateRange.to ? formatDate(reportData.taxAdvisor.dateRange.to) : 'Alle'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Gesamtumsatz</p>
                <p className="font-medium text-gray-900">{formatCurrency(reportData.taxAdvisor.totalRevenue)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Gesamtbestellungen</p>
                <p className="font-medium text-gray-900">{reportData.taxAdvisor.totalOrders}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Stornierte Bestellungen</p>
                <p className="font-medium text-gray-900">{reportData.taxAdvisor.cancelledOrdersCount}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Barzahlung</p>
                <p className="font-medium text-gray-900">{formatCurrency(reportData.taxAdvisor.cashTotal)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Online-Zahlungen</p>
                <p className="font-medium text-gray-900">{formatCurrency(reportData.taxAdvisor.onlinePaymentTotal)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Liefergebühr gesamt</p>
                <p className="font-medium text-gray-900">{formatCurrency(reportData.taxAdvisor.deliveryFeeTotal)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                <p className="text-sm text-gray-500">VAT summary placeholder — requires VAT rate per product/order item</p>
              </div>
            </div>
          </div>

          {/* Order Export Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Bestellübersicht</h2>
              <p className="text-sm text-gray-500 mt-1">{reportData.orders.length} Bestellungen</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bestellnummer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kunde</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefon</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PLZ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Typ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zahlung</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zwischensumme</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Liefergebühr</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rabatt</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gesamt</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {reportData.orders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.deliveryPostalCode || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.orderType === 'DELIVERY' ? 'Lieferung' : 'Abholung'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.payments.length > 0 ? order.payments[0].method : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(order.subtotal)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(order.deliveryFee)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(order.discountAmount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
