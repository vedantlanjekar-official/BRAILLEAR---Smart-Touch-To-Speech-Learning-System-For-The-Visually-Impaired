// Basic authentication for BRAILLEAR webapp
export interface User {
  id: string;
  email: string;
  name: string;
  preferences: {
    audioVolume: number;
    demoMode: boolean;
    serialPort?: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

class AuthManager {
  private currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    try {
      const userData = localStorage.getItem('braillear_user');
      if (userData) {
        this.currentUser = JSON.parse(userData);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error);
      localStorage.removeItem('braillear_user');
    }
  }

  private saveUserToStorage() {
    if (this.currentUser) {
      localStorage.setItem('braillear_user', JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem('braillear_user');
    }
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Demo authentication - accept any email/password combination
    if (!credentials.email || !credentials.password) {
      return { success: false, error: 'Email and password are required' };
    }

    if (!this.isValidEmail(credentials.email)) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    // Create demo user
    this.currentUser = {
      id: 'demo-user-' + Date.now(),
      email: credentials.email,
      name: credentials.email.split('@')[0],
      preferences: {
        audioVolume: 0.7,
        demoMode: true,
        serialPort: undefined
      }
    };

    if (credentials.rememberMe) {
      this.saveUserToStorage();
    }

    this.notifyListeners();
    return { success: true };
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem('braillear_user');
    this.notifyListeners();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  updatePreferences(preferences: Partial<User['preferences']>): void {
    if (this.currentUser) {
      this.currentUser.preferences = {
        ...this.currentUser.preferences,
        ...preferences
      };
      this.saveUserToStorage();
      this.notifyListeners();
    }
  }

  onAuthStateChange(listener: (user: User | null) => void) {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const authManager = new AuthManager();