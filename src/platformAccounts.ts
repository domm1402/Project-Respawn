import * as SecureStore from "expo-secure-store";

const STORAGE_KEY = "respawn_platform_accounts_v1";

export type PlatformAccount = {
  provider: string;
  accountId: string;
  displayName: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  connectedAt: number;
};

async function readVault(): Promise<Record<string, PlatformAccount>> {
  const raw = await SecureStore.getItemAsync(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, PlatformAccount>;
  } catch {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
    return {};
  }
}

async function writeVault(accounts: Record<string, PlatformAccount>) {
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(accounts));
}

export async function getStoredPlatformAccounts(): Promise<PlatformAccount[]> {
  return Object.values(await readVault());
}

export async function storePlatformAccount(
  account: Omit<PlatformAccount, "connectedAt"> & { connectedAt?: number }
): Promise<void> {
  if (!account.provider || !account.accountId || !account.accessToken) {
    throw new Error("A verified account ID and sign-in token are required.");
  }
  const accounts = await readVault();
  accounts[account.provider] = {
    ...account,
    connectedAt: account.connectedAt ?? Date.now(),
  };
  await writeVault(accounts);
}

export async function removePlatformAccount(provider: string): Promise<void> {
  const accounts = await readVault();
  delete accounts[provider];
  await writeVault(accounts);
}

export async function clearPlatformAccounts(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_KEY);
}
