import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock_google_client_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock_google_client_secret",
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || "mock_microsoft_client_id",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "mock_microsoft_client_secret",
      tenantId: "common",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Always allow NextAuth sign in; we'll authenticate against FastAPI
      // on the client side after this completes so we can show the role modal if needed.
      return true;
    },
    async jwt({ token, account, user }) {
      if (account && user) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose provider to session
      if (session.user) {
        (session as any).provider = token.provider;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "mock_secret_for_development_only_12345",
});

export { handler as GET, handler as POST };
