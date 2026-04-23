import {
  AuthenticationError,
  EmailAliasError,
  NotFoundError,
  RateLimitError,
} from "./errors";
import type {
  Alias,
  AvailableDomain,
  ClientOptions,
  CreateAliasOptions,
  DashboardStats,
  Destination,
  Domain,
  EmailLog,
  ExposureEvent,
  PaginatedResponse,
  SendEmailResponse,
  UpdateAliasOptions,
} from "./types";

const DEFAULT_BASE_URL = "https://api.emailalias.io";

export class Client {
  private apiKey: string;
  private baseUrl: string;
  private timeoutMs: number;
  private fetchImpl: typeof fetch;

  constructor(opts: ClientOptions) {
    if (!opts.apiKey) throw new Error("apiKey is required");
    this.apiKey = opts.apiKey;
    this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.timeoutMs = opts.timeoutMs ?? 30_000;
    this.fetchImpl = opts.fetchImpl ?? fetch;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    let res: Response;
    try {
      res = await this.fetchImpl(`${this.baseUrl}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (res.status === 204) {
      return undefined as T;
    }

    let payload: unknown;
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      payload = await res.json().catch(() => ({ detail: "" }));
    } else {
      payload = { detail: await res.text() };
    }

    if (!res.ok) {
      const detail =
        payload && typeof payload === "object" && "detail" in payload
          ? (payload as { detail: unknown }).detail
          : JSON.stringify(payload);
      const message =
        typeof detail === "string" ? detail : JSON.stringify(detail);
      switch (res.status) {
        case 401:
          throw new AuthenticationError(message);
        case 404:
          throw new NotFoundError(message);
        case 429:
          throw new RateLimitError(message);
        default:
          throw new EmailAliasError(message, res.status);
      }
    }

    return payload as T;
  }

  // ── Aliases ───────────────────────────────────────────────────────────
  listAliases(): Promise<Alias[]> {
    return this.request("GET", "/api/aliases");
  }

  createAlias(opts: CreateAliasOptions = {}): Promise<Alias> {
    return this.request("POST", "/api/aliases", {
      alias_type: opts.alias_type ?? "random",
      ...opts,
    });
  }

  updateAlias(aliasId: string, opts: UpdateAliasOptions): Promise<Alias> {
    return this.request("PATCH", `/api/aliases/${aliasId}`, opts);
  }

  deleteAlias(aliasId: string): Promise<void> {
    return this.request("DELETE", `/api/aliases/${aliasId}`);
  }

  listAvailableDomains(): Promise<AvailableDomain[]> {
    return this.request("GET", "/api/aliases/domains");
  }

  // ── Destinations ──────────────────────────────────────────────────────
  listDestinations(): Promise<Destination[]> {
    return this.request("GET", "/api/destinations");
  }

  addDestination(email: string): Promise<Destination> {
    return this.request("POST", "/api/destinations", { email });
  }

  resendDestinationVerification(destinationId: string): Promise<Destination> {
    return this.request(
      "POST",
      `/api/destinations/${destinationId}/resend`
    );
  }

  deleteDestination(destinationId: string): Promise<void> {
    return this.request("DELETE", `/api/destinations/${destinationId}`);
  }

  // ── Send email ────────────────────────────────────────────────────────
  sendEmail(params: {
    alias_id: string;
    to_email: string;
    subject: string;
    body: string;
    html_body?: string;
  }): Promise<SendEmailResponse> {
    return this.request("POST", "/api/send-email", params);
  }

  // ── Custom Domains ────────────────────────────────────────────────────
  listDomains(): Promise<Domain[]> {
    return this.request("GET", "/api/domains");
  }

  addDomain(domainName: string): Promise<Domain> {
    return this.request("POST", "/api/domains", { domain_name: domainName });
  }

  verifyDomain(domainId: string): Promise<Domain> {
    return this.request("POST", `/api/domains/${domainId}/verify`);
  }

  deleteDomain(domainId: string): Promise<void> {
    return this.request("DELETE", `/api/domains/${domainId}`);
  }

  // ── Analytics ─────────────────────────────────────────────────────────
  getDashboardStats(): Promise<DashboardStats> {
    return this.request("GET", "/api/analytics/dashboard");
  }

  listLogs(page = 1, perPage = 25): Promise<PaginatedResponse<EmailLog>> {
    return this.request(
      "GET",
      `/api/analytics/logs?page=${page}&per_page=${perPage}`
    );
  }

  listExposureEvents(
    page = 1,
    perPage = 25
  ): Promise<PaginatedResponse<ExposureEvent>> {
    return this.request(
      "GET",
      `/api/analytics/exposure?page=${page}&per_page=${perPage}`
    );
  }
}
