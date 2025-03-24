import 'next-auth';
import { User } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: number;
      username: string;
      isAdmin: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    token?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: number;
    username: string;
    isAdmin: boolean;
    token?: string;
  }
} 