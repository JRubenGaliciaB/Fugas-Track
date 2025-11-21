export enum LeakStatus {
  ACTIVE = 'ACTIVE',
  REPAIRING = 'REPAIRING',
  REPAIRED = 'REPAIRED'
}

export interface Leak {
  id: string;
  lat: number;
  lng: number;
  status: LeakStatus;
  address: string;
  description: string;
  reportedDate: string; // ISO string
  repairedDate?: string; // ISO string
  zone: string;
  reporterName: string;
  severity: 'Low' | 'Medium' | 'High';
  imageUrl: string;
}

export interface FilterState {
  status: LeakStatus | 'ALL';
}

export interface DashboardStats {
  total: number;
  active: number;
  repairing: number;
  repaired: number;
  avgRepairTimeHours: number;
}
