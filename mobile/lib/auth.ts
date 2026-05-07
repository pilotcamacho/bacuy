import {
  getCurrentUser,
  signIn,
  signOut,
  signUp,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
  resendSignUpCode,
} from 'aws-amplify/auth';
import type { User } from '@/types';

export async function checkCurrentUser(): Promise<User | null> {
  try {
    const { userId, signInDetails } = await getCurrentUser();
    return {
      id: userId,
      email: signInDetails?.loginId ?? '',
      preferredLanguage: 'en',
      lifeAreas: [],
    };
  } catch {
    return null;
  }
}

export async function authSignIn(email: string, password: string) {
  return signIn({ username: email, password });
}

export async function authSignOut() {
  return signOut();
}

export async function authSignUp(email: string, password: string) {
  return signUp({
    username: email,
    password,
    options: { userAttributes: { email } },
  });
}

export async function authConfirmSignUp(email: string, code: string) {
  return confirmSignUp({ username: email, confirmationCode: code });
}

export async function authResendCode(email: string) {
  return resendSignUpCode({ username: email });
}

export async function authForgotPassword(email: string) {
  return resetPassword({ username: email });
}

export async function authConfirmResetPassword(
  email: string,
  code: string,
  newPassword: string
) {
  return confirmResetPassword({ username: email, confirmationCode: code, newPassword });
}
