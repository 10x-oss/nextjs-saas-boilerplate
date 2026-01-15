// next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      uuid: string;
      [key: string]: any;
    };
  }

  interface JWT {
    id?: string;
    uuid?: string;
  }
}
