import NextAuth, {NextAuthOptions} from 'next-auth';
import CognitoProvider from 'next-auth/providers/cognito';

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  secret: process.env.AUTH_SECRET,
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID,
      clientSecret: process.env.COGNITO_CLIENT_SECRET,
      issuer: process.env.COGNITO_ISSUER,
      checks: ['nonce']
    })
  ],
  callbacks: {
    async jwt({token, account}) {
      if (account?.accessToken) {
        token.accessToken = account.accessToken;
      }
      return token;
    },
    async session({session, token}) {
      const accessToken = token.accessToken;
      return session;
    }
  }
};

export default NextAuth(authOptions);
