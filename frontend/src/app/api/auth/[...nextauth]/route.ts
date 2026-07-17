import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        try {
          const res = await fetch("http://localhost:8000/api/v1/auth/login", {
            method: "POST",
            body: new URLSearchParams({
              username: credentials.username,
              password: credentials.password,
            }),
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          });

          const data = await res.json();

          if (res.ok && data.access_token) {
            return {
              id: "1", // We would decode the JWT here to get the actual user ID
              email: credentials.username,
              accessToken: data.access_token,
            };
          }
          return null;
        } catch (error) {
          console.error("Auth error", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
