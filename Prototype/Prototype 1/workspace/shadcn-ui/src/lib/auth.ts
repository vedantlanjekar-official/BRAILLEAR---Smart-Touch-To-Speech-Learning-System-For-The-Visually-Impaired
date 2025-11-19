// Simple authentication manager for BRAILLEAR demo
export interface User {
  id: string;
  email: string;
  name: string;
}

export class AuthManager {
  private currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  constructor() {
    // Check for existing session on initialization
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    try {
      const stored = localStorage.getItem('braillear_user');
      if (stored) {
        this.currentUser = JSON.parse(stored);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error);
      localStorage.removeItem('braillear_user');
    }
  }

  private saveUserToStorage(user: User | null) {
    try {
      if (user) {
        localStorage.setItem('braillear_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('braillear_user');
      }
    } catch (error) {
      console.error('Failed to save user to storage:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Simple validation for demo - accept any valid email format
      if (!email || !email.includes('@') || !password) {
        return { success: false, error: 'Please enter a valid email and password' };
      }

      // Create user from email
      const user: User = {
        id: Date.now().toString(),
        email: email,
        name: email.split('@')[0] // Use part before @ as name
      };

      this.currentUser = user;
      this.saveUserToStorage(user);
      this.notifyListeners();

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  logout() {
    this.currentUser = null;
    this.saveUserToStorage(null);
    this.notifyListeners();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  onAuthStateChange(listener: (user: User | null) => void) {
    this.listeners.push(listener);
    
    // Immediately call with current user
    listener(this.currentUser);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

export const authManager = new AuthManager();