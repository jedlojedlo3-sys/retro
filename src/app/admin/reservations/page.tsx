'use client';

import React, { useEffect, useState } from 'react';
import { Phone, CheckCircle, PackageCheck, XCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Reservation, ReservationStatus } from '@/types/database';
import { formatPrice, formatDate, formatTimeRemaining, STATUS_MAP } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeTab, setActiveTab] = useState<ReservationStatus | 'all'>('new');
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    reservationId: string;
    reservationNumber: string;
    targetStatus: ReservationStatus;
    title: string;
    description: string;
  } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('reservations')
        .select('*, items:reservation_items(*)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setReservations(data as Reservation[]);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleActionClick = (
    reservation: Reservation,
    targetStatus: ReservationStatus
  ) => {
    if (targetStatus === 'ready') {
      executeStatusUpdate(reservation.id, 'ready');
      return;
    }

    if (targetStatus === 'picked_up') {
      setActionModal({
        isOpen: true,
        reservationId: reservation.id,
        reservationNumber: reservation.reservation_number,
        targetStatus: 'picked_up',
        title: 'Потврди подигнување',
        description: `Потврди дека купувачот ${reservation.customer_name} го подигна и плати производот (${formatPrice(reservation.total)})? Физичката залиха ќе биде автоматски намалена.`,
      });
      return;
    }

    if (targetStatus === 'cancelled') {
      setActionModal({
        isOpen: true,
        reservationId: reservation.id,
        reservationNumber: reservation.reservation_number,
        targetStatus: 'cancelled',
        title: 'Откажи резервација',
        description: `Дали сте сигурни дека сакате да ја откажете резервацијата ${reservation.reservation_number}? Резервираните парчиња ќе бидат вратени во слободна достапна залиха.`,
      });
      return;
    }
  };

  const executeStatusUpdate = async (reservationId: string, newStatus: ReservationStatus) => {
    setProcessingId(reservationId);
    try {
      const res = await fetch('/api/admin/reservations/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservation_id: reservationId,
          new_status: newStatus,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReservations((prev) =>
          prev.map((r) => (r.id === reservationId ? { ...r, status: newStatus } : r))
        );
      } else {
        alert(data.error || 'Грешка при ажурирање на статусот.');
      }
    } catch (err: any) {
      alert(err.message || 'Се појави неочекувана грешка.');
    } finally {
      setProcessingId(null);
      setActionModal(null);
    }
  };

  const tabCounts = {
    new: reservations.filter((r) => r.status === 'new').length,
    ready: reservations.filter((r) => r.status === 'ready').length,
    picked_up: reservations.filter((r) => r.status === 'picked_up').length,
    cancelled: reservations.filter((r) => r.status === 'cancelled').length,
  };

  const displayedReservations = reservations.filter((r) => {
    if (activeTab === 'all') return true;
    return r.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-paper flex flex-col pb-16">
      <AdminHeader title="РЕЗЕРВАЦИИ" showBack backUrl="/admin" />

      <main className="max-w-2xl mx-auto w-full p-4 sm:p-6 space-y-4">
        {/* Refresh & Tabs Header */}
        <div className="flex items-center justify-between pb-1">
          <h2 className="font-display text-2xl uppercase tracking-wider text-ink">
            Преглед на нарачки
          </h2>
          <button
            onClick={fetchReservations}
            disabled={loading}
            className="p-2 bg-white border border-ink/15 hover:border-ink rounded text-ink flex items-center gap-1 text-xs font-bold transition-colors"
            title="Освежи"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Освежи</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
          <button
            onClick={() => setActiveTab('new')}
            className={`py-2.5 px-2 border text-center transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
              activeTab === 'new' ? 'bg-ink text-white border-ink shadow-sm' : 'bg-white text-ink border-ink/15'
            }`}
          >
            <span>Нови</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'new' ? 'bg-retro-orange text-ink font-extrabold' : 'bg-amber-100 text-amber-900'}`}>
              {tabCounts.new}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ready')}
            className={`py-2.5 px-2 border text-center transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
              activeTab === 'ready' ? 'bg-ink text-white border-ink shadow-sm' : 'bg-white text-ink border-ink/15'
            }`}
          >
            <span>Подготвени</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'ready' ? 'bg-white text-ink font-bold' : 'bg-blue-100 text-blue-900'}`}>
              {tabCounts.ready}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('picked_up')}
            className={`py-2.5 px-2 border text-center transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
              activeTab === 'picked_up' ? 'bg-ink text-white border-ink shadow-sm' : 'bg-white text-ink border-ink/15'
            }`}
          >
            <span>Подигнати</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'picked_up' ? 'bg-white text-ink font-bold' : 'bg-emerald-100 text-emerald-900'}`}>
              {tabCounts.picked_up}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('cancelled')}
            className={`py-2.5 px-2 border text-center transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
              activeTab === 'cancelled' ? 'bg-ink text-white border-ink shadow-sm' : 'bg-white text-ink border-ink/15'
            }`}
          >
            <span>Откажани</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'cancelled' ? 'bg-white text-ink font-bold' : 'bg-zinc-100 text-zinc-700'}`}>
              {tabCounts.cancelled}
            </span>
          </button>
        </div>

        {/* Reservations List */}
        <div className="space-y-4 pt-2">
          {displayedReservations.map((res) => {
            const statusConfig = STATUS_MAP[res.status];
            const timeInfo = formatTimeRemaining(res.expires_at);
            const isFinished = res.status === 'picked_up' || res.status === 'cancelled';

            return (
              <div
                key={res.id}
                className={`bg-white border p-5 space-y-4 shadow-sm transition-all ${
                  res.status === 'new' ? 'border-amber-400/80 ring-1 ring-amber-300' : 'border-ink/15'
                }`}
              >
                {/* Card Top: Number, Date, Status */}
                <div className="flex items-start justify-between gap-3 border-b border-ink/10 pb-3">
                  <div>
                    <span className="font-display text-2xl text-retro-orange tracking-wider font-bold">
                      {res.reservation_number}
                    </span>
                    <p className="text-[11px] text-muted">{formatDate(res.created_at)}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider border rounded-none ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                    >
                      {statusConfig.label}
                    </span>

                    {!isFinished && (
                      <span
                        className={`text-[10px] font-semibold flex items-center gap-1 ${
                          timeInfo.isExpired ? 'text-red-600 font-bold' : 'text-muted'
                        }`}
                      >
                        <Clock size={11} />
                        <span>{timeInfo.isExpired ? 'Истечена!' : `Истекува за: ${timeInfo.formatted}`}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Customer Details */}
                <div className="bg-paper p-3 border border-ink/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-ink block">{res.customer_name}</span>
                    {res.customer_email && (
                      <span className="text-[11px] text-muted">{res.customer_email}</span>
                    )}
                  </div>

                  <a
                    href={`tel:${res.customer_phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-ink/20 hover:border-ink text-ink font-bold text-xs rounded transition-colors self-start sm:self-auto"
                  >
                    <Phone size={13} className="text-retro-orange" />
                    <span>{res.customer_phone}</span>
                  </a>
                </div>

                {/* Reservation Items */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted block">
                    Производи:
                  </span>
                  <div className="space-y-1 divide-y divide-ink/5">
                    {res.items?.map((item) => (
                      <div key={item.id} className="pt-1.5 flex items-center justify-between text-xs">
                        <div className="font-semibold text-ink">
                          <span>{item.product_name}</span>
                          <span className="ml-2 px-1.5 py-0.5 bg-paper border border-ink/10 text-[11px] font-bold">
                            {item.size}
                          </span>
                          <span className="ml-2 text-muted">× {item.quantity}</span>
                        </div>
                        <span className="font-bold text-ink">{formatPrice(item.line_total)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total & Action Buttons */}
                <div className="pt-3 border-t border-ink/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="w-full sm:w-auto text-left">
                    <span className="text-[10px] uppercase text-muted tracking-wider block">Вкупно:</span>
                    <span className="font-display text-2xl text-ink font-bold leading-none">
                      {formatPrice(res.total)}
                    </span>
                  </div>

                  {/* Actions for active reservations */}
                  {!isFinished && (
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                      {res.status === 'new' && (
                        <button
                          onClick={() => handleActionClick(res, 'ready')}
                          disabled={processingId === res.id}
                          className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                        >
                          <PackageCheck size={15} />
                          <span>Подготвено</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleActionClick(res, 'picked_up')}
                        disabled={processingId === res.id}
                        className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-ink hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle size={15} className="text-retro-orange" />
                        <span>Подигнато</span>
                      </button>

                      <button
                        onClick={() => handleActionClick(res, 'cancelled')}
                        disabled={processingId === res.id}
                        className="px-3 py-2.5 border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                        title="Откажи"
                      >
                        <XCircle size={15} />
                        <span className="hidden sm:inline">Откажи</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {displayedReservations.length === 0 && !loading && (
            <div className="bg-white border border-ink/10 p-12 text-center text-xs text-muted space-y-2">
              <p className="font-bold text-sm text-ink">Нема резервации во оваа категорија.</p>
              <p>Сите нови резервации од купувачите ќе се појават тука веднаш.</p>
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Modal for Destructive/Stock Actions */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-ink/20 p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-ink">
              <div className="w-10 h-10 rounded-full bg-paper flex items-center justify-center text-retro-orange shrink-0">
                <AlertTriangle size={22} />
              </div>
              <h3 className="font-display text-2xl uppercase tracking-wide">{actionModal.title}</h3>
            </div>

            <p className="text-xs text-ink/80 leading-relaxed">
              {actionModal.description}
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="px-4 py-2 border border-ink/20 text-xs font-bold uppercase tracking-wider hover:bg-paper"
              >
                Назад
              </button>

              <button
                type="button"
                onClick={() => executeStatusUpdate(actionModal.reservationId, actionModal.targetStatus)}
                className={`px-5 py-2 font-bold text-xs uppercase tracking-wider text-white ${
                  actionModal.targetStatus === 'picked_up'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Потврди
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
