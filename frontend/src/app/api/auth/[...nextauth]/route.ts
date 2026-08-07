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
      tenantId: process.env.AZURE_AD_TENANT_ID || "common",
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Always allow NextAuth sign in; we'll authenticate against FastAPI
      // on the client side after this completes so we can show the role modal if needed.
      return true;
    },
    async jwt({ token, account, user }) {
      if (account) {
        token.provider = account.provider;
        // Capture the id_token if provided by the OAuth provider (e.g. Microsoft/Google)
        if (account.id_token) {
          token.id_token = account.id_token;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Expose provider and id_token to session so frontend can pass it to FastAPI
      if (session.user) {
        (session as any).provider = token.provider;
        (session as any).id_token = token.id_token;
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
