import { AuthUser, UserRole, NavigationTab } from '../types';

interface DemoAccountConfig {
  username: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  allowedTabs: NavigationTab[];
  validPasswords: string[];
}

const DEMO_ACCOUNTS: DemoAccountConfig[] = [
  {
    username: 'admin',
    name: 'Sarah Jenkins',
    role: 'admin',
    roleTitle: 'Administrator',
    allowedTabs: ['dashboard', 'expeditions', 'tracking', 'cargo', 'inventory', 'emergency', 'reports'],
    validPasswords: ['polar.admin', 'polar2026', 'admin', 'admin123']
  },
  {
    username: 'expedition.manager',
    name: 'Dr. Evelyn Vance',
    role: 'expedition.manager',
    roleTitle: 'Expedition Manager',
    allowedTabs: ['dashboard', 'expeditions', 'tracking', 'reports'],
    validPasswords: ['polar.manager', 'polar2026', 'manager', 'manager123']
  },
  {
    username: 'logistics.officer',
    name: 'Alex Morgan',
    role: 'logistics.officer',
    roleTitle: 'Logistics Officer',
    allowedTabs: ['dashboard', 'tracking', 'cargo', 'inventory'],
    validPasswords: ['polar.logistics', 'polar2026', 'logistics', 'logistics123']
  },
  {
    username: 'field.operator',
    name: 'Lars Nygård',
    role: 'field.operator',
    roleTitle: 'Field Operator',
    allowedTabs: ['dashboard', 'expeditions', 'tracking', 'emergency'],
    validPasswords: ['polar.operator', 'polar2026', 'operator', 'operator123']
  },
  {
    username: 'emergency.coordinator',
    name: 'Elena Rostova',
    role: 'emergency.coordinator',
    roleTitle: 'Emergency Coordinator',
    allowedTabs: ['dashboard', 'emergency', 'tracking'],
    validPasswords: ['polar.emergency', 'polar2026', 'emergency', 'emergency123']
  }
];

const AUTH_STORAGE_KEY = 'polar_auth_user_v2';

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public getDemoAccounts(): { username: string; name: string; roleTitle: string; role: UserRole }[] {
    return DEMO_ACCOUNTS.map(a => ({
      username: a.username,
      name: a.name,
      roleTitle: a.roleTitle,
      role: a.role
    }));
  }

  public getCurrentUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  public login(username: string, password: string): { success: boolean; user?: AuthUser; error?: string } {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      return { success: false, error: 'Please enter both username and password.' };
    }

    const account = DEMO_ACCOUNTS.find(
      a => a.username.toLowerCase() === cleanUsername
    );

    if (!account) {
      return { success: false, error: 'Invalid username. Please check your credentials.' };
    }

    const isPasswordValid = account.validPasswords.some(
      p => p.toLowerCase() === cleanPassword.toLowerCase()
    );

    if (!isPasswordValid) {
      return { success: false, error: 'Invalid password. Please try again.' };
    }

    const user: AuthUser = {
      id: `usr-${account.username}`,
      username: account.username,
      name: account.name,
      role: account.role,
      roleTitle: account.roleTitle,
      allowedTabs: account.allowedTabs
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return { success: true, user };
  }

  public logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  public canAccessTab(user: AuthUser | null, tab: NavigationTab): boolean {
    if (!user) return false;
    return user.allowedTabs.includes(tab);
  }

  public getQuickFillCredentials(username: string): { username: string; password: string } | null {
    const account = DEMO_ACCOUNTS.find(a => a.username === username);
    if (!account) return null;
    return {
      username: account.username,
      password: account.validPasswords[0]
    };
  }
}

export const authService = AuthService.getInstance();
