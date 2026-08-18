import { Reservation, ReservationStatus } from '@/types/database';

const LOCAL_STORAGE_RESERVATIONS_KEY = 'retro_boutique_saved_reservations_v1';

// In-memory fallback array on server/client
let inMemoryReservations: Reservation[] = [
  {
    id: 'res-demo-1001',
    reservation_number: 'RB-1001',
    customer_name: 'Марко Петров',
    customer_phone: '070 123 456',
    customer_email: 'marko@example.com',
    status: 'new',
    total: 1490,
    expires_at: new Date(Date.now() + 40 * 60 * 60 * 1000).toISOString(),
    email_sent: false,
    email_error: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'item-1',
        reservation_id: 'res-demo-1001',
        product_id: null,
        variant_id: null,
        product_name: 'Retro Black Graphic Shirt',
        size: 'L',
        quantity: 1,
        price: 1490,
        line_total: 1490,
        created_at: new Date().toISOString(),
      },
    ],
  },
];

export function getClientStoredReservations(): Reservation[] {
  if (typeof window === 'undefined') {
    return inMemoryReservations;
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_RESERVATIONS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_RESERVATIONS_KEY, JSON.stringify(inMemoryReservations));
      return inMemoryReservations;
    }
    return JSON.parse(raw);
  } catch {
    return inMemoryReservations;
  }
}

export function saveClientReservation(reservation: Reservation): void {
  inMemoryReservations = [reservation, ...inMemoryReservations.filter((r) => r.id !== reservation.id)];

  if (typeof window !== 'undefined') {
    try {
      const existing = getClientStoredReservations();
      const updated = [reservation, ...existing.filter((r) => r.id !== reservation.id && r.reservation_number !== reservation.reservation_number)];
      localStorage.setItem(LOCAL_STORAGE_RESERVATIONS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save reservation to localStorage', e);
    }
  }
}

export function updateClientReservationStatus(reservationId: string, newStatus: ReservationStatus): Reservation[] {
  inMemoryReservations = inMemoryReservations.map((r) =>
    r.id === reservationId || r.reservation_number === reservationId
      ? { ...r, status: newStatus, updated_at: new Date().toISOString() }
      : r
  );

  if (typeof window !== 'undefined') {
    try {
      const existing = getClientStoredReservations();
      const updated = existing.map((r) =>
        r.id === reservationId || r.reservation_number === reservationId
          ? { ...r, status: newStatus, updated_at: new Date().toISOString() }
          : r
      );
      localStorage.setItem(LOCAL_STORAGE_RESERVATIONS_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to update reservation status in localStorage', e);
    }
  }

  return inMemoryReservations;
}

export function getInMemoryReservations(): Reservation[] {
  return inMemoryReservations;
}

export function addInMemoryReservation(reservation: Reservation): void {
  inMemoryReservations = [reservation, ...inMemoryReservations.filter((r) => r.id !== reservation.id && r.reservation_number !== reservation.reservation_number)];
}
