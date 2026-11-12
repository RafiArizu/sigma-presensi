export type Role = 'peserta' | 'staff_presensi' | 'super_admin';
export type AccountStatus = 'pending' | 'active' | 'inactive' | 'expired';
export interface User { id: number; code: string; name: string; email?: string; role: Role; status: AccountStatus; }
