export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";
export const SELECTED_ORG_KEY = "selected_organization_id";

export function setAuthTokens(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearAuthTokens() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getSelectedOrganizationId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(SELECTED_ORG_KEY);
}

export function setSelectedOrganizationId(orgId: string) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(SELECTED_ORG_KEY, orgId);
}

export function clearSelectedOrganizationId() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(SELECTED_ORG_KEY);
}
