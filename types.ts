export interface User {
  id: string;
  username: string;
  email?: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface PayloadItem {
  id: string;
  userId: string;
  name: string;
  type: 'individual' | 'daily';
  status: 'active' | 'inactive' | 'pending';
  value: number;
  date: string;
  createdAt: string;
  photoUrl?: string;
  details: {
    parcelCount?: number;
    collectionCount?: number;
    driverId?: string;
    isTwoIds?: boolean;
    id1?: string;
    count1?: number;
    id2?: string;
    count2?: number;
  };
}

export type PageView = 'login' | 'register' | 'admin-login' | 'user-dashboard' | 'admin-dashboard' | 'history';
