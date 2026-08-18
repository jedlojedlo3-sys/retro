import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Category, ReservationStatus } from '@/types/database';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0 den.';
  }
  return `${new Intl.NumberFormat('mk-MK').format(amount)} den.`;
}

export const CATEGORIES: { key: Category; labelMk: string }[] = [
  { key: 'jeans', labelMk: 'Фармерки' },
  { key: 'sweaters', labelMk: 'Џемпери' },
  { key: 'shirts', labelMk: 'Кошули' },
  { key: 'trousers', labelMk: 'Панталони' },
  { key: 'other', labelMk: 'Останато' },
];

export function getCategoryLabel(category: Category | string): string {
  const found = CATEGORIES.find((c) => c.key === category);
  return found ? found.labelMk : category;
}

export const STATUS_MAP: Record<
  ReservationStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  new: {
    label: 'Нова',
    bg: 'bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-500/30',
  },
  ready: {
    label: 'Подготвена',
    bg: 'bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-500/30',
  },
  picked_up: {
    label: 'Подигната',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-500/30',
  },
  cancelled: {
    label: 'Откажана',
    bg: 'bg-zinc-500/10',
    text: 'text-zinc-600 dark:text-zinc-400',
    border: 'border-zinc-500/30',
  },
};

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('mk-MK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatTimeRemaining(expiresAt: string): {
  isExpired: boolean;
  formatted: string;
} {
  try {
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const diffMs = expiry - now;

    if (diffMs <= 0) {
      return { isExpired: true, formatted: 'Истечена' };
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return {
        isExpired: false,
        formatted: `${days}д ${remainingHours}ч`,
      };
    }

    if (hours > 0) {
      return {
        isExpired: false,
        formatted: `${hours}ч ${minutes}м`,
      };
    }

    return {
      isExpired: false,
      formatted: `${minutes} мин`,
    };
  } catch {
    return { isExpired: false, formatted: '48 часа' };
  }
}
