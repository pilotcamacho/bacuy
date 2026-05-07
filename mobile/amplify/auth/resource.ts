import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
    // Google and Apple OAuth are added here after setting up
    // credentials in the AWS Console and respective developer portals.
    // externalProviders: {
    //   google: { clientId: '...', clientSecret: secret('GOOGLE_CLIENT_SECRET') },
    //   apple: { clientId: '...', teamId: '...', keyId: '...', privateKey: secret('APPLE_PRIVATE_KEY') },
    //   callbackUrls: ['bacuy://auth/callback'],
    //   logoutUrls: ['bacuy://auth/logout'],
    // },
  },
});
