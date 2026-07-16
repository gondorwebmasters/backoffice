import { NextResponse } from "next/server";

import {
  clearAuthCookies,
  getAccessToken,
  getActiveCompanyId,
  getRefreshToken,
  gqlRequest,
  graphqlUrl,
  setActiveCompanyCookie,
  setAuthCookies,
} from "@/lib/auth";

const REFRESH_MUTATION = /* GraphQL */ `
  mutation RefreshAccessToken($inputToken: String!) {
    refreshAccessToken(inputToken: $inputToken) {
      success
      tokens {
        token
        refreshToken
      }
    }
  }
`;

type GraphQLPayload = {
  data?: unknown;
  errors?: { message: string; extensions?: { code?: string } }[];
};

type RefreshData = {
  refreshAccessToken: {
    success: boolean;
    tokens: { token: string | null; refreshToken: string | null } | null;
  };
};

function isTokenExpired(payload: GraphQLPayload): boolean {
  return Boolean(
    payload.errors?.some(
      (err) =>
        err.extensions?.code === "UNAUTHENTICATED" &&
        (err.message.includes("token expired") || err.message.includes("jwt expired")),
    ),
  );
}

async function forward(body: string, token?: string, companyId?: string): Promise<GraphQLPayload> {
  const res = await fetch(graphqlUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(companyId ? { "x-company-id": companyId } : {}),
    },
    body,
    cache: "no-store",
  });
  return res.json();
}

/** Si la operación cambió la empresa activa, sincroniza la cookie fc_company. */
async function syncActiveCompanyCookie(payload: GraphQLPayload) {
  const data = payload.data as
    | { setActiveCompany?: { success?: boolean; user?: { activeCompanyId?: string | null } | null } }
    | undefined;
  const newCompanyId = data?.setActiveCompany?.success
    ? data.setActiveCompany.user?.activeCompanyId
    : null;
  if (newCompanyId) {
    await setActiveCompanyCookie(newCompanyId);
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const token = await getAccessToken();
  const companyId = request.headers.get("x-company-id") ?? (await getActiveCompanyId());

  let payload = await forward(body, token, companyId ?? undefined);

  if (isTokenExpired(payload)) {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      await clearAuthCookies();
      return NextResponse.json(payload);
    }

    const { data } = await gqlRequest<RefreshData>(REFRESH_MUTATION, { inputToken: refreshToken });
    const tokens = data?.refreshAccessToken?.tokens;

    if (!tokens?.token || !tokens.refreshToken) {
      await clearAuthCookies();
      return NextResponse.json(payload);
    }

    await setAuthCookies(tokens.token, tokens.refreshToken);
    payload = await forward(body, tokens.token, companyId ?? undefined);
  }

  await syncActiveCompanyCookie(payload);

  return NextResponse.json(payload);
}
