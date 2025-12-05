import { User, PayloadItem } from '../types';

const USERS_KEY = 'payload_app_users';
const PAYLOADS_KEY = 'payload_app_items';

export const getStoredUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveUser = (user: User): void => {
  const users = getStoredUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const deleteUser = (userId: string): void => {
  const users = getStoredUsers();
  const filtered = users.filter(u => u.id !== userId);
  localStorage.setItem(USERS_KEY, JSON.stringify(filtered));
};

export const getAllPayloads = (): PayloadItem[] => {
  const stored = localStorage.getItem(PAYLOADS_KEY);
  if (stored) return JSON.parse(stored);
  return [];
};

export const savePayload = (item: PayloadItem): void => {
  const items = getAllPayloads();
  items.push(item);
  localStorage.setItem(PAYLOADS_KEY, JSON.stringify(items));
};

export const getPayloadsByUser = (userId: string): PayloadItem[] => {
  const all = getAllPayloads();
  return all.filter(item => item.userId === userId);
};
