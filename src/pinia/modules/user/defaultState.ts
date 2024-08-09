export interface UserStateInterface {
  loginSuccess: boolean;
  loginError: boolean;
  failedAccess: boolean;
  avatarKey: string;
  authProvider: string | null;
  createdDate: number | null;
  familyName: string | null;
  firstName: string | null;
  email: string | null;
  notShareEmail: boolean;
  id: string;
  lastSeen: number | null;
  pictureUrl: string | null;
  superAdmin: boolean;
  username: string;
  reservedUserIds: string[];
}

// default user state
export default function defaultState(): UserStateInterface {
  return {
    loginSuccess: false,
    loginError: false,
    failedAccess: false,
    avatarKey: '',
    authProvider: null,
    createdDate: null,
    familyName: '',
    firstName: '',
    email: '',
    notShareEmail: false,
    id: '',
    lastSeen: null,
    pictureUrl: '',
    superAdmin: false,
    username: '',
    reservedUserIds: ['base_tree', 'validated'],
  };
}
