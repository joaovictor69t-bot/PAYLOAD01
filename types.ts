export interface User {
  id: string;
  username: string;
  password?: string; // stored for simulation, normally hashed
  role: 'admin' | 'user';
  createdAt: string;
}

export interface PayloadItem {
  id: string;
  userId: string;
  name: string; // Used as a title or summary
  type: 'individual' | 'daily';
  status: 'active' | 'inactive' | 'pending';
  value: number;
  date: string; // The date of the service selected by user
  createdAt: string; // When the record was created
  photoUrl?: string; // Base64 image
  details: {
    // Shared
    parcelCount?: number;
    
    // Individual specific
    collectionCount?: number;
    driverId?: string;

    // Daily specific
    isTwoIds?: boolean;
    id1?: string;
    count1?: number;
    id2?: string;
    count2?: number;
  };
}

export type PageView = 'login' | 'register' | 'admin-login' | 'user-dashboard' | 'admin-dashboard' | 'history';