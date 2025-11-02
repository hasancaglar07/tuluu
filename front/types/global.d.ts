import { UserRole } from ".";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: UserRole;
    };
  }
  interface PrivateMetadata {
    role?: UserRole;
  }
}
