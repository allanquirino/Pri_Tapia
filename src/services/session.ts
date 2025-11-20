// Session Management Service
// Comprehensive session handling for offline capabilities and data persistence

import { db } from './database';
import { logger } from '@/lib/logger';

export interface SessionData {
  userId: string;
  username: string;
  role: 'admin' | 'user';
  loginTime: string;
  lastActivity: string;
  sessionId: string;
  rememberMe: boolean;
}

export interface SessionConfig {
  timeout: number; // Session timeout in minutes
  rememberDuration: number; // Remember me duration in days
  checkInterval: number; // Check interval in seconds
}

class SessionService {
  private config: SessionConfig = {
    timeout: 30, // 30 minutes
    rememberDuration: 30, // 30 days
    checkInterval: 60 // Check every minute
  };
  
  private checkIntervalId: NodeJS.Timeout | null = null;
  private currentSession: SessionData | null = null;

  constructor() {
    this.initializeSession();
    this.startSessionMonitoring();
  }

  // Initialize session from server
  private async initializeSession(): Promise<void> {
    try {
      const apiBase = (import.meta.env.VITE_API_BASE as string) || '/backend/api/';
      const response = await fetch(`${apiBase}session.php`);
      if (response.ok) {
        const user = await response.json();
        // Create session data from user
        this.currentSession = {
          userId: user.id,
          username: user.username,
          role: user.role,
          loginTime: new Date().toISOString(), // Approximate
          lastActivity: new Date().toISOString(),
          sessionId: this.generateSessionId(),
          rememberMe: false
        };
      } else {
        this.clearSession();
      }
    } catch (error) {
      console.error('Failed to initialize session:', error);
      this.clearSession();
    }
  }

  // Check if session is still valid
  private isSessionValid(session: SessionData): boolean {
    const now = new Date();
    const lastActivity = new Date(session.lastActivity);
    const timeoutMs = this.config.timeout * 60 * 1000;
    
    return (now.getTime() - lastActivity.getTime()) < timeoutMs;
  }


  // Create a new session
  async createSession(user: { id: string; username: string; role: 'admin' | 'user'; token?: string }, rememberMe: boolean = false): Promise<void> {
    const session: SessionData = {
      userId: user.id,
      username: user.username,
      role: user.role,
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      sessionId: this.generateSessionId(),
      rememberMe,
      token: user.token
    };

    this.currentSession = session;

    try {
      if (user.token) {
        localStorage.setItem('session_api_token', user.token);
      }
    } catch { void 0; }

    // Log session creation
    await db.addAuditLog({
      action: 'Session Created',
      user: user.username,
      details: `User logged in${rememberMe ? ' (remember me)' : ''}`,
      module: 'Authentication'
    });
  }

  // Update last activity timestamp
  async updateLastActivity(): Promise<void> {
    if (this.currentSession) {
      this.currentSession.lastActivity = new Date().toISOString();
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentSession !== null && this.isSessionValid(this.currentSession);
  }

  // Get current session data
  getSession(): SessionData | null {
    return this.currentSession;
  }

  // Get current user info
  getCurrentUser(): { username: string; role: string } | null {
    if (!this.currentSession) return null;
    
    return {
      username: this.currentSession.username,
      role: this.currentSession.role
    };
  }

  // Check if current user has admin role
  isAdmin(): boolean {
    return this.currentSession?.role === 'admin';
  }

  getToken(): string | undefined {
    try {
      return this.currentSession?.token || localStorage.getItem('session_api_token') || undefined;
    } catch {
      return this.currentSession?.token;
    }
  }

  // End current session
  async endSession(): Promise<void> {
    if (this.currentSession) {
      await db.addAuditLog({
        action: 'Session Ended',
        user: this.currentSession.username,
        details: 'User logged out',
        module: 'Authentication'
      });
    }

    // Call API to destroy session
    try {
      const apiBase = (import.meta.env.VITE_API_BASE as string) || '/backend/api/';
      await fetch(`${apiBase}session.php`, { method: 'DELETE' });
    } catch (error) {
      console.error('Failed to end server session:', error);
    }

    this.clearSession();
  }

  // Clear session data
  private clearSession(): void {
    this.currentSession = null;
    try { localStorage.removeItem('session_api_token'); } catch { void 0; }
  }

  // Start session monitoring
  private startSessionMonitoring(): void {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
    }
    
    this.checkIntervalId = setInterval(async () => {
      await this.checkSessionValidity();
    }, this.config.checkInterval * 1000);
  }

  // Check session validity periodically
  private async checkSessionValidity(): Promise<void> {
    if (this.currentSession && !this.isSessionValid(this.currentSession)) {
      await this.endSession();
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  // Stop session monitoring
  stopSessionMonitoring(): void {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }
  }

  // Activity tracking - call this on user interactions
  async trackActivity(): Promise<void> {
    await this.updateLastActivity();
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Update session configuration
  updateConfig(newConfig: Partial<SessionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.startSessionMonitoring(); // Restart with new config
  }

  // Get session statistics
  getSessionStats(): {
    isAuthenticated: boolean;
    username: string | null;
    role: string | null;
    loginTime: string | null;
    lastActivity: string | null;
    timeRemaining: number | null;
  } {
    if (!this.currentSession) {
      return {
        isAuthenticated: false,
        username: null,
        role: null,
        loginTime: null,
        lastActivity: null,
        timeRemaining: null
      };
    }

    const now = new Date();
    const lastActivity = new Date(this.currentSession.lastActivity);
    const timeoutMs = this.config.timeout * 60 * 1000;
    const timeElapsed = now.getTime() - lastActivity.getTime();
    const timeRemaining = Math.max(0, timeoutMs - timeElapsed);

    return {
      isAuthenticated: true,
      username: this.currentSession.username,
      role: this.currentSession.role,
      loginTime: this.currentSession.loginTime,
      lastActivity: this.currentSession.lastActivity,
      timeRemaining: Math.floor(timeRemaining / 1000) // Return in seconds
    };
  }

  // Force extend session (for critical operations)
  async extendSession(): Promise<void> {
    if (this.currentSession) {
      this.currentSession.lastActivity = new Date().toISOString();

      await db.addAuditLog({
        action: 'Session Extended',
        user: this.currentSession.username,
        details: 'Session extended due to critical operation',
        module: 'Authentication'
      });
    }
  }

  // Get session duration
  getSessionDuration(): number {
    if (!this.currentSession) return 0;
    
    const now = new Date();
    const loginTime = new Date(this.currentSession.loginTime);
    return Math.floor((now.getTime() - loginTime.getTime()) / 1000);
  }

  // Clear all session-related data (for logout/reset)
  async clearAllSessionData(): Promise<void> {
    await this.endSession();
    db.clearAllSessions();
  }


  // Check if session is about to expire (for UI warnings)
  isSessionExpiringSoon(thresholdMinutes: number = 5): boolean {
    if (!this.currentSession) return false;
    
    const stats = this.getSessionStats();
    if (!stats.timeRemaining) return false;
    
    const thresholdSeconds = thresholdMinutes * 60;
    return stats.timeRemaining <= thresholdSeconds;
  }

  // Initialize on app start
  async initialize(): Promise<void> {
    await this.initializeSession();
    this.startSessionMonitoring();
  }

  // Cleanup on app unload
  async cleanup(): Promise<void> {
    this.stopSessionMonitoring();
  }
}

// Export singleton instance
export const sessionService = new SessionService();

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  sessionService.initialize().catch(err => logger.error('Session initialize failed', { error: err }));
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    sessionService.cleanup().catch(err => logger.error('Session cleanup failed', { error: err }));
  });
}

export default sessionService;
