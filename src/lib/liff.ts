"use client";

import liff from "@line/liff";

let isInitialized = false;

export async function initializeLiff(): Promise<void> {
  if (isInitialized) return;

  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
  if (!liffId) {
    throw new Error("LIFF ID is not configured");
  }

  await liff.init({ liffId });
  isInitialized = true;
}

export function isInClient(): boolean {
  return liff.isInClient();
}

export function isLoggedIn(): boolean {
  return liff.isLoggedIn();
}

export function login(): void {
  liff.login();
}

export function getIdToken(): string | null {
  return liff.getIDToken();
}

export async function getProfile(): Promise<{
  userId: string;
  displayName: string;
  pictureUrl?: string;
} | null> {
  try {
    const profile = await liff.getProfile();
    return {
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
    };
  } catch {
    return null;
  }
}

export function closeWindow(): void {
  if (liff.isInClient()) {
    liff.closeWindow();
  }
}

export { liff };
