export type ActivePage = 'landing' | 'login' | 'dashboard' | 'subject' | 'test' | 'result';

export type UserInfo = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STUDENT';
};
