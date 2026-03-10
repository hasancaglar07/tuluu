type UnknownRecord = Record<string, unknown>;

const ADMIN_ROLE_ALIASES = new Set([
  "admin",
  "administrator",
  "org:admin",
  "superadmin",
  "super_admin",
]);

const TRUTHY_VALUES = new Set(["1", "true", "yes", "on"]);

function isTruthy(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  return TRUTHY_VALUES.has(value.trim().toLowerCase());
}

function toRecord(value: unknown): UnknownRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as UnknownRecord;
}

function normalizeRoleValue(value: unknown): string | null {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized.length > 0 ? normalized : null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const normalized = normalizeRoleValue(item);
      if (normalized) {
        return normalized;
      }
    }
  }

  return null;
}

function getRoleFromMetadata(metadata: unknown): string | null {
  const record = toRecord(metadata);
  if (!record) {
    return null;
  }

  return (
    normalizeRoleValue(record.role) ??
    normalizeRoleValue(record.userRole) ??
    normalizeRoleValue(record.user_role) ??
    normalizeRoleValue(record.roles)
  );
}

export function getUserRole(user: unknown): string | null {
  const record = toRecord(user);
  if (!record) {
    return null;
  }

  return (
    getRoleFromMetadata(record.privateMetadata) ??
    getRoleFromMetadata(record.publicMetadata) ??
    getRoleFromMetadata(record.unsafeMetadata) ??
    normalizeRoleValue(record.role)
  );
}

export function getSessionRole(sessionClaims: unknown): string | null {
  const record = toRecord(sessionClaims);
  if (!record) {
    return null;
  }

  return (
    getRoleFromMetadata(record.metadata) ??
    getRoleFromMetadata(record.private_metadata) ??
    getRoleFromMetadata(record.public_metadata) ??
    getRoleFromMetadata(record.unsafe_metadata) ??
    normalizeRoleValue(record.role)
  );
}

export function isAdminRole(role: string | null | undefined): boolean {
  if (!role) {
    return false;
  }

  return ADMIN_ROLE_ALIASES.has(role.trim().toLowerCase());
}

export function hasAdminRole(user: unknown): boolean {
  if (isAdminBypassEnabled()) {
    return true;
  }

  return isAdminRole(getUserRole(user));
}

export function isAdminBypassEnabled(): boolean {
  if (isTruthy(process.env.ALLOW_ALL_AUTHENTICATED_ADMIN)) {
    return true;
  }

  if (process.env.ALLOW_ALL_AUTHENTICATED_ADMIN !== undefined) {
    return false;
  }

  return process.env.NODE_ENV === "development";
}

export function resolveRequestRole(options: {
  user?: unknown;
  sessionClaims?: unknown;
}): string | null {
  return getUserRole(options.user) ?? getSessionRole(options.sessionClaims);
}

export function hasRequestAdminRole(options: {
  user?: unknown;
  sessionClaims?: unknown;
}): boolean {
  if (isAdminBypassEnabled()) {
    return true;
  }

  return isAdminRole(resolveRequestRole(options));
}
