export interface UserStateInterface {
  loginSuccess: boolean;
  loginError: boolean;
  failedAccess: boolean;
  avatarKey: number;

  as_json: string | null;
  auth_provider: number | null;
  created_date: string | null;
  family_name: string | null;
  first_name: string | null;
  get_id: string | null;
  get_or_create: string | null;
  id: string;
  is_active: boolean;
  is_anonymous: true;
  is_authenticated: boolean;
  last_seen: string | null;
  make_unique_nickname: string | null;
  make_valid_nickname: string | null;
  picture_url: string | null;
  query: string | null;
  query_class: string | null;
  super_admin: boolean;
  username: string | null;
}

// default user state
export default function defaultState(): UserStateInterface {
  return {
    loginSuccess: false,
    loginError: false,
    failedAccess: false,
    avatarKey: 0,

    as_json: null,
    auth_provider: null,
    created_date: null,
    family_name: null,
    first_name: null,
    get_id: null,
    get_or_create: null,
    id: '',
    is_active: false,
    is_anonymous: true,
    is_authenticated: false,
    last_seen: null,
    make_unique_nickname: null,
    make_valid_nickname: null,
    picture_url: null,
    query: null,
    query_class: null,
    super_admin: false,
    username: null,
  };
}
