import { User, Recipient, Announcement, AlertCategory, SubCategory } from '../types';
import { INITIAL_USERS, INITIAL_RECIPIENTS, INITIAL_ANNOUNCEMENTS } from '../data/mockData';

const KEYS = {
  CURRENT_USER: 'abisu_current_user_v1',
  USERS: 'abisu_users_v1',
  RECIPIENTS: 'abisu_recipients_v1',
  ANNOUNCEMENTS: 'abisu_announcements_v1',
  GATEWAY_CONFIG: 'abisu_gateway_v1',
};

export const storage = {
  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(KEYS.CURRENT_USER);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return INITIAL_USERS[0]; // Default to Officer Justin Cruz for quick seamless workstation access
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
  },

  getUsers(): User[] {
    try {
      const data = localStorage.getItem(KEYS.USERS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return INITIAL_USERS;
  },

  addUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  getRecipients(): Recipient[] {
    try {
      const data = localStorage.getItem(KEYS.RECIPIENTS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return INITIAL_RECIPIENTS;
  },

  saveRecipients(recipients: Recipient[]): void {
    localStorage.setItem(KEYS.RECIPIENTS, JSON.stringify(recipients));
  },

  addRecipient(recipient: Recipient): void {
    const list = this.getRecipients();
    list.unshift(recipient);
    this.saveRecipients(list);
  },

  deleteRecipient(id: string): void {
    const list = this.getRecipients().filter((r) => r.id !== id);
    this.saveRecipients(list);
  },

  toggleRecipientStatus(id: string): void {
    const list = this.getRecipients().map((r) =>
      r.id === id ? { ...r, isActive: !r.isActive } : r
    );
    this.saveRecipients(list);
  },

  getAnnouncements(): Announcement[] {
    try {
      const data = localStorage.getItem(KEYS.ANNOUNCEMENTS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return INITIAL_ANNOUNCEMENTS;
  },

  addAnnouncement(announcement: Announcement): void {
    const list = this.getAnnouncements();
    list.unshift(announcement);
    localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(list));
  },

  clearAllData(): void {
    localStorage.removeItem(KEYS.ANNOUNCEMENTS);
    localStorage.removeItem(KEYS.RECIPIENTS);
    localStorage.removeItem(KEYS.USERS);
    localStorage.removeItem(KEYS.CURRENT_USER);
  },
};
