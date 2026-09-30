import { User, UserRole } from '../types';

export interface AuthSession {
  user: User;
  token: string;
  rememberMe: boolean;
}

export interface StoredCredentialUser extends User {
  passwordHash: string; // simulated password hash
}

const AUTH_STORAGE_KEY = 'roadguard_auth_session_v2';
const REGISTERED_USERS_KEY = 'roadguard_registered_users_v2';

// Standard demo users
export const DEMO_ACCOUNTS = [
  {
    role: 'citizen' as UserRole,
    name: 'Ravi Kumar',
    email: 'citizen@roadguard.ai',
    password: 'citizen123',
    department: 'Kakinada Citizen Watch',
    badge: 'Citizen Contributor',
  },
  {
    role: 'engineer' as UserRole,
    name: 'K. S. Rao, Executive Engineer',
    email: 'engineer@roadguard.ai',
    password: 'engineer123',
    department: 'Roads & Buildings Department, Kakinada Division',
    badgeNumber: 'EE-AP-7391',
    badge: 'Chief PWD Inspector',
  },
  {
    role: 'admin' as UserRole,
    name: 'Municipal Commissioner Vance',
    email: 'admin@roadguard.ai',
    password: 'admin123',
    department: 'Kakinada Municipal Corporation — Public Works',
    badge: 'Municipal Operations Director',
  },
];

export class AuthService {
  private static getStoredUsers(): StoredCredentialUser[] {
    try {
      const data = localStorage.getItem(REGISTERED_USERS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error loading stored users:', e);
    }

    // Initialize with demo accounts
    const initial: StoredCredentialUser[] = DEMO_ACCOUNTS.map((acc, idx) => ({
      id: `usr_${acc.role}_${idx + 1}`,
      name: acc.name,
      email: acc.email,
      role: acc.role,
      department: acc.department,
      badgeNumber: (acc as any).badgeNumber,
      passwordHash: acc.password, // demo prototype storage
    }));

    this.saveStoredUsers(initial);
    return initial;
  }

  private static saveStoredUsers(users: StoredCredentialUser[]): void {
    try {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users to localStorage:', e);
    }
  }

  public static getCurrentSession(): AuthSession | null {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error reading auth session:', e);
    }
    return null;
  }

  public static login(
    email: string,
    password: string,
    rememberMe: boolean = true
  ): { success: boolean; user?: User; error?: string } {
    const trimmedEmail = email.trim().toLowerCase();
    const users = this.getStoredUsers();

    const match = users.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (!match) {
      return { success: false, error: 'No account registered with this email address.' };
    }

    if (match.passwordHash !== password) {
      return { success: false, error: 'Incorrect password. Please verify and retry.' };
    }

    const { passwordHash, ...cleanUser } = match;
    const session: AuthSession = {
      user: cleanUser,
      token: `token_${Date.now()}_${cleanUser.id}`,
      rememberMe,
    };

    if (rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    return { success: true, user: cleanUser };
  }

  public static signup(
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): { success: boolean; user?: User; error?: string } {
    const trimmedEmail = email.trim().toLowerCase();
    const users = this.getStoredUsers();

    if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const newUser: StoredCredentialUser = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: trimmedEmail,
      role,
      department:
        role === 'engineer'
          ? 'Kakinada Municipal Pavement Engineering'
          : 'Citizen Road Safety Reporter',
      passwordHash: password,
    };

    const updated = [...users, newUser];
    this.saveStoredUsers(updated);

    const { passwordHash, ...cleanUser } = newUser;
    const session: AuthSession = {
      user: cleanUser,
      token: `token_${Date.now()}_${cleanUser.id}`,
      rememberMe: true,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));

    return { success: true, user: cleanUser };
  }

  public static logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  }

  public static getDemoAccounts() {
    return DEMO_ACCOUNTS;
  }
}
