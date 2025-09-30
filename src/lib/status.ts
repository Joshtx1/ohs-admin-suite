import { BadgeProps } from "@/components/ui/badge";

export type TableStatus = 'active' | 'inactive' | 'suspended' | 'created' | 'pending' | 'completed' | 'cancelled';

export function getStatusBadgeVariant(status: string): BadgeProps['variant'] {
  const normalizedStatus = status.toLowerCase();
  
  switch (normalizedStatus) {
    case 'active':
    case 'completed':
      return 'default';
    case 'pending':
    case 'created':
      return 'secondary';
    case 'inactive':
    case 'suspended':
    case 'cancelled':
      return 'outline';
    default:
      return 'outline';
  }
}

export function getStatusDisplay(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

export const VALID_STATUSES = {
  clients: ['active', 'inactive', 'suspended'] as const,
  trainees: ['active', 'inactive'] as const,
  orders: ['created', 'pending', 'completed', 'cancelled'] as const,
  orderItems: ['pending', 'completed', 'cancelled'] as const,
  profiles: ['active', 'inactive', 'suspended'] as const,
  services: ['active', 'inactive'] as const,
  assignments: ['active', 'inactive', 'completed'] as const,
} as const;
