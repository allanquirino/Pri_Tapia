
import { logger } from "@/lib/logger";

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: string;
  lastLogin?: string;
  email?: string;
  fullName?: string;
  isActive?: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  dateOfBirth?: string;
  lastVisit: string;
  totalVisits: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  service: string;
  date: string;
  time: string;
  duration: string;
  status: 'confirmado' | 'pendente' | 'cancelado' | 'concluido';
  price?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  price: string;
  supplier?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: 'receita' | 'despesa';
  description: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod?: string;
  clientId?: string;
  appointmentId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
  module: string;
  ipAddress?: string;
}

export interface SystemLog {
  id: string;
  type: string;
  action: string;
  details?: string;
  status?: string;
  durationMs?: number;
  createdAt: string;
}

export interface AppSettings {
  id: string;
  businessName: string;
  address: string;
  phone: string;
  email: string;
  businessHours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  currency: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
}

class DatabaseService {
  private apiBase = (import.meta.env.VITE_API_BASE as string) || '/backend/api/';

  private toNumber(value: unknown): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const n = parseFloat(value);
      return isNaN(n) ? 0 : n;
    }
    return 0;
  }

  async getPets(ownerId?: string): Promise<any[]> {
    const url = ownerId ? `${this.apiBase}pets.php?ownerId=${encodeURIComponent(ownerId)}` : `${this.apiBase}pets.php`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch pets');
    return res.json();
  }

  async getPet(id: string): Promise<any> {
    const res = await fetch(`${this.apiBase}pets.php?id=${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Failed to fetch pet');
    return res.json();
  }

  async addPet(data: Record<string, unknown>): Promise<{ id: string }> {
    const res = await fetch(`${this.apiBase}pets.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add pet');
    return res.json();
  }

  async updatePet(id: string, updates: Record<string, unknown>): Promise<boolean> {
    const res = await fetch(`${this.apiBase}pets.php?id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) return false;
    const r = await res.json();
    return !!r.success;
  }

  async deletePet(id: string): Promise<boolean> {
    const res = await fetch(`${this.apiBase}pets.php?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok) return false;
    const r = await res.json();
    return !!r.success;
  }

  async getArticles(filters?: { category?: string; q?: string }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.q) params.set('q', filters.q);
    const res = await fetch(`${this.apiBase}articles.php${params.toString() ? `?${params}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch articles');
    return res.json();
  }

  async addArticle(data: Record<string, unknown>): Promise<{ id: string }> {
    const res = await fetch(`${this.apiBase}articles.php`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create article');
    return res.json();
  }

  async updateArticle(id: string, updates: Record<string, unknown>): Promise<boolean> {
    const res = await fetch(`${this.apiBase}articles.php?id=${encodeURIComponent(id)}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates)
    });
    if (!res.ok) return false;
    const r = await res.json();
    return !!r.success;
  }

  async deleteArticle(id: string): Promise<boolean> {
    const res = await fetch(`${this.apiBase}articles.php?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok) return false;
    const r = await res.json();
    return !!r.success;
  }

  async getClinics(filters?: { city?: string; specialty?: string }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.city) params.set('city', filters.city);
    if (filters?.specialty) params.set('specialty', filters.specialty);
    const res = await fetch(`${this.apiBase}clinics.php${params.toString() ? `?${params}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch clinics');
    return res.json();
  }

  async addClinic(data: Record<string, unknown>): Promise<{ id: string }> {
    const res = await fetch(`${this.apiBase}clinics.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to create clinic');
    return res.json();
  }

  async updateClinic(id: string, updates: Record<string, unknown>): Promise<boolean> {
    const res = await fetch(`${this.apiBase}clinics.php?id=${encodeURIComponent(id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
    if (!res.ok) return false;
    const r = await res.json();
    return !!r.success;
  }

  async deleteClinic(id: string): Promise<boolean> {
    const res = await fetch(`${this.apiBase}clinics.php?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok) return false;
    const r = await res.json();
    return !!r.success;
  }

  async forumCategories(): Promise<any[]> {
    const res = await fetch(`${this.apiBase}forum.php?action=categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  }

  async forumTopics(categoryId: string): Promise<any[]> {
    const res = await fetch(`${this.apiBase}forum.php?action=topics&categoryId=${encodeURIComponent(categoryId)}`);
    if (!res.ok) throw new Error('Failed to fetch topics');
    return res.json();
  }

  async forumPosts(topicId: string): Promise<any[]> {
    const res = await fetch(`${this.apiBase}forum.php?action=posts&topicId=${encodeURIComponent(topicId)}`);
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
  }

  async forumCreateCategory(data: Record<string, unknown>): Promise<{ id: string }> {
    const res = await fetch(`${this.apiBase}forum.php?action=category`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to create category');
    return res.json();
  }

  async forumCreateTopic(data: Record<string, unknown>): Promise<{ id: string }> {
    const res = await fetch(`${this.apiBase}forum.php?action=topic`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to create topic');
    return res.json();
  }

  async forumCreatePost(data: Record<string, unknown>): Promise<{ id: string }> {
    const res = await fetch(`${this.apiBase}forum.php?action=post`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to create post');
    return res.json();
  }

  async forumModerate(postId: string, isHidden: boolean): Promise<boolean> {
    const res = await fetch(`${this.apiBase}forum.php?action=moderate`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId, isHidden }) });
    if (!res.ok) return false;
    const r = await res.json();
    return !!r.success;
  }

  async calendarEvents(): Promise<any[]> {
    const res = await fetch(`${this.apiBase}calendar.php`);
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  }

  async calendarAddEvent(data: Record<string, unknown>): Promise<{ id: string }> {
    const res = await fetch(`${this.apiBase}calendar.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to add event');
    return res.json();
  }

  async calendarUpdateEvent(id: string, updates: Record<string, unknown>): Promise<boolean> {
    const res = await fetch(`${this.apiBase}calendar.php?id=${encodeURIComponent(id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
    if (!res.ok) return false;
    const r = await res.json();
    return !!r.success;
  }

  async calendarDeleteEvent(id: string): Promise<boolean> {
    const res = await fetch(`${this.apiBase}calendar.php?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok) return false;
    const r = await res.json();
    return !!r.success;
  }

  async runBackup(): Promise<{ success: boolean; path?: string }> {
    const res = await fetch('/backend/cron_backup.php');
    if (!res.ok) throw new Error('Failed to run backup');
    return res.json();
  }

  private normalizeTransaction(t: unknown): Transaction {
    const o = (t ?? {}) as Record<string, unknown>;
    const rawType = String(o.type ?? 'receita');
    const type: 'receita' | 'despesa' = rawType === 'despesa' ? 'despesa' : 'receita';
    return {
      id: String(o.id ?? ''),
      type,
      description: String(o.description ?? ''),
      category: String(o.category ?? ''),
      amount: this.toNumber(o.amount),
      date: String(o.date ?? ''),
      paymentMethod: (o.paymentMethod as string) ?? undefined,
      clientId: (o.clientId as string) ?? undefined,
      appointmentId: (o.appointmentId as string) ?? undefined,
      notes: (o.notes as string) ?? undefined,
      createdAt: String(o.createdAt ?? ''),
      updatedAt: String(o.updatedAt ?? ''),
    };
  }

  private normalizeAppointment(a: unknown): Appointment {
    const o = (a ?? {}) as Record<string, unknown>;
    const rawStatus = String(o.status ?? 'pendente');
    const status: Appointment['status'] =
      rawStatus === 'confirmado' || rawStatus === 'pendente' || rawStatus === 'cancelado' || rawStatus === 'concluido'
        ? (rawStatus as Appointment['status'])
        : 'pendente';
    return {
      id: String(o.id ?? ''),
      clientId: String(o.clientId ?? ''),
      clientName: String(o.clientName ?? ''),
      service: String(o.service ?? ''),
      date: String(o.date ?? ''),
      time: String(o.time ?? ''),
      duration: String(o.duration ?? ''),
      status,
      price: o.price !== undefined && o.price !== null ? this.toNumber(o.price) : undefined,
      notes: (o.notes as string) ?? undefined,
      createdAt: String(o.createdAt ?? ''),
      updatedAt: String(o.updatedAt ?? ''),
    };
  }

  // User Management
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${this.apiBase}users.php`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  }

  async addUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const response = await fetch(`${this.apiBase}users.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (!response.ok) throw new Error('Failed to add user');
    return response.json();
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const response = await fetch(`${this.apiBase}users.php?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) return null;
    return response.json();
  }

  async deleteUser(id: string): Promise<boolean> {
    const response = await fetch(`${this.apiBase}users.php?id=${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) return false;
    const result = await response.json();
    return result.success || false;
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    // Try JSON first
    try {
      const resJson = await fetch(`${this.apiBase}login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (resJson.ok) {
        return await resJson.json();
      }
    } catch { /* ignore and fallback */ }

    // Fallback: URL-encoded for legacy PHP expecting $_POST
    try {
      const body = new URLSearchParams({ username, password, login: username, senha: password }).toString();
      const resForm = await fetch(`${this.apiBase}login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
        body
      });
      if (!resForm.ok) return null;
      return await resForm.json();
    } catch (error) {
      logger.error('authenticateUser failed', { error });
      return null;
    }
  }

  // Client Management
  async getClients(): Promise<Client[]> {
    const response = await fetch(`${this.apiBase}clients.php`);
    if (!response.ok) throw new Error('Failed to fetch clients');
    return response.json();
  }

  async addClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const response = await fetch(`${this.apiBase}clients.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client)
    });
    if (!response.ok) throw new Error('Failed to add client');
    return response.json();
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
    const response = await fetch(`${this.apiBase}clients.php?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) return null;
    return response.json();
  }

  async deleteClient(id: string): Promise<boolean> {
    const response = await fetch(`${this.apiBase}clients.php?id=${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) return false;
    const result = await response.json();
    return result.success || false;
  }

  // Appointment Management
  async getAppointments(): Promise<Appointment[]> {
    const response = await fetch(`${this.apiBase}appointments.php`);
    if (!response.ok) throw new Error('Failed to fetch appointments');
    const data = await response.json();
    return Array.isArray(data) ? data.map((a: unknown) => this.normalizeAppointment(a)) : [];
  }

  async addAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    const response = await fetch(`${this.apiBase}appointments.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment)
    });
    if (!response.ok) throw new Error('Failed to add appointment');
    const a = await response.json();
    return this.normalizeAppointment(a);
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | null> {
    const response = await fetch(`${this.apiBase}appointments.php?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) return null;
    const a = await response.json();
    return this.normalizeAppointment(a);
  }

  async deleteAppointment(id: string): Promise<boolean> {
    const response = await fetch(`${this.apiBase}appointments.php?id=${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) return false;
    const result = await response.json();
    return result.success || false;
  }

  // Product/Inventory Management
  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${this.apiBase}products.php`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  }

  async addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const response = await fetch(`${this.apiBase}products.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!response.ok) throw new Error('Failed to add product');
    return response.json();
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const response = await fetch(`${this.apiBase}products.php?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) return null;
    return response.json();
  }

  async deleteProduct(id: string): Promise<boolean> {
    const response = await fetch(`${this.apiBase}products.php?id=${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) return false;
    const result = await response.json();
    return result.success || false;
  }

  // Transaction/Financial Management
  async getTransactions(): Promise<Transaction[]> {
    const response = await fetch(`${this.apiBase}transactions.php`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    const data = await response.json();
    return Array.isArray(data) ? data.map((t: unknown) => this.normalizeTransaction(t)) : [];
  }

  async addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const response = await fetch(`${this.apiBase}transactions.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    });
    if (!response.ok) throw new Error('Failed to add transaction');
    const t = await response.json();
    return this.normalizeTransaction(t);
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | null> {
    const response = await fetch(`${this.apiBase}transactions.php?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) return null;
    const t = await response.json();
    return this.normalizeTransaction(t);
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const response = await fetch(`${this.apiBase}transactions.php?id=${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) return false;
    const result = await response.json();
    return result.success || false;
  }

  // Audit Log Management
  async getAuditLogs(): Promise<AuditLog[]> {
    const response = await fetch(`${this.apiBase}audit_logs.php`);
    if (!response.ok) throw new Error('Failed to fetch audit logs');
    return response.json();
  }

  async addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    try {
      const response = await fetch(`${this.apiBase}audit_logs.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
      });
      if (!response.ok) {
        return {
          id: `local-${Date.now()}`,
          action: log.action,
          user: log.user,
          timestamp: new Date().toISOString(),
          details: `${log.details} (not persisted)`,
          module: log.module,
        };
      }
      return response.json();
    } catch (error) {
      logger.error('addAuditLog failed', { error });
      return {
        id: `local-${Date.now()}`,
        action: log.action,
        user: log.user,
        timestamp: new Date().toISOString(),
        details: `${log.details} (not persisted)`,
        module: log.module,
      };
    }
  }

  async addSystemLog(log: Omit<SystemLog, 'id' | 'createdAt'>): Promise<SystemLog> {
    try {
      const response = await fetch(`${this.apiBase}system_logs.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
      });
      if (!response.ok) {
        return {
          id: `local-${Date.now()}`,
          type: log.type,
          action: log.action,
          details: log.details,
          status: log.status,
          durationMs: log.durationMs,
          createdAt: new Date().toISOString(),
        };
      }
      const res = await response.json();
      return {
        id: res.id,
        type: log.type,
        action: log.action,
        details: log.details,
        status: log.status,
        durationMs: log.durationMs,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('addSystemLog failed', { error });
      return {
        id: `local-${Date.now()}`,
        type: log.type,
        action: log.action,
        details: log.details,
        status: log.status,
        durationMs: log.durationMs,
        createdAt: new Date().toISOString(),
      };
    }
  }

  async getSystemLogs(): Promise<SystemLog[]> {
    const response = await fetch(`${this.apiBase}system_logs.php`);
    if (!response.ok) return [];
    return response.json();
  }

  // Settings Management
  async getSettings(): Promise<AppSettings | null> {
    const response = await fetch(`${this.apiBase}settings.php`);
    if (!response.ok) return null;
    return response.json();
  }

  async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings | null> {
    const response = await fetch(`${this.apiBase}settings.php`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) return null;
    return response.json();
  }

  // Data Export/Import
  async exportData(): Promise<string> {
    const response = await fetch(`${this.apiBase}data_export.php`);
    if (!response.ok) throw new Error('Failed to export data');
    return response.text();
  }

  async importData(jsonData: string): Promise<boolean> {
    const response = await fetch(`${this.apiBase}data_import.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: jsonData
    });
    if (!response.ok) return false;
    const res = await response.json();
    return !!res.success;
  }

  // Data Statistics
  async getStatistics() {
    const response = await fetch(`${this.apiBase}statistics.php`);
    if (!response.ok) throw new Error('Failed to fetch statistics');
    const s = await response.json();
    if (!s) return {
      totalClients: 0,
      todayAppointments: 0,
      totalProducts: 0,
      lowStockProducts: 0,
      monthlyRevenue: 0,
      totalRevenue: 0,
    };
    return {
      ...s,
      monthlyRevenue: this.toNumber(s.monthlyRevenue),
      totalRevenue: this.toNumber(s.totalRevenue),
    };
  }

  // Utility functions
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Session Management (localStorage for frontend)
  setSession(key: string, value: unknown): void {
    localStorage.setItem(`session_${key}`, JSON.stringify(value));
  }

  getSession<T = unknown>(key: string): T | null {
    const item = localStorage.getItem(`session_${key}`);
    return item ? (JSON.parse(item) as T) : null;
  }

  removeSession(key: string): void {
    localStorage.removeItem(`session_${key}`);
  }

  async clearAllData(): Promise<boolean> {
    let response = await fetch(`${this.apiBase}clear_all.php`, { method: 'DELETE' });
    if (!response.ok) {
      response = await fetch(`${this.apiBase}clear_all.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: '_method=DELETE'
      });
      if (!response.ok) return false;
    }
    const res = await response.json();
    return !!res.success;
  }


  clearAllSessions(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('session_'));
    keys.forEach(key => localStorage.removeItem(key));
  }
}

// Export singleton instance
export const db = new DatabaseService();
export default db;
