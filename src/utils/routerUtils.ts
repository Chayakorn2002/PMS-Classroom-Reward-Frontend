"use client";

import { useRouter } from "next/navigation";

export function checkUserId(
  userId: string | null,
  router: ReturnType<typeof useRouter>
) {
  if (!userId) {
    router.push("/login");
  }
}

export function setLocalStorageWithExpiry(
  key: string,
  value: any,
  ttl: number
) {
  const now = new Date();

  const item = {
    value,
    expiry: now.getTime() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

export function getLocalStorageWithExpiry(key: string) {
  const itemStr = localStorage.getItem(key);

  if (!itemStr) {
    return null;
  }

  const item = JSON.parse(itemStr);
  const now = new Date();

  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }

  return item.value;
}

export function removeLocalStorage(key: string) {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) {
    return null;
  }
  localStorage.removeItem(key);
  return null;
}
