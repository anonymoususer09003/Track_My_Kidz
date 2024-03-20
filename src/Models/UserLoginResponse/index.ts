interface UserLoginResponse {
  token: string;
  userType: string;
  id: number;
  mainId?: number | undefined;
  isSubscribed?: boolean | undefined;
}
