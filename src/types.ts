export interface Alias {
  id: string;
  alias_code: string;
  alias_email: string;
  destination_email: string;
  active: boolean;
  label: string | null;
  display_name: string | null;
  display_name_pending: string | null;
  display_name_pending_since: string | null;
  created_at: string;
}

export interface AvailableDomain {
  domain: string;
  type: "system" | "custom";
  is_default: boolean;
}

export interface Destination {
  id: string | null;
  email: string;
  verified: boolean;
  is_primary: boolean;
  created_at: string | null;
}

export interface SendEmailResponse {
  success: boolean;
  message_id?: string;
  message: string;
}

export interface Domain {
  id: string;
  domain_name: string;
  verified: boolean;
  verification_token: string;
  txt_verified: boolean;
  mx_verified: boolean;
  spf_verified: boolean;
  dkim_verified: boolean;
  dmarc_verified: boolean;
  mail_from_verified: boolean;
  /** Whether catch-all is enabled: any address at this domain auto-creates an
   * alias on first inbound email. Premium + verified domains only. */
  catch_all: boolean;
  /** The inbox catch-all aliases forward to (null when catch-all is off). */
  catch_all_destination: string | null;
  alias_count: number;
  /** Of alias_count, how many were auto-created by catch-all. */
  auto_created_alias_count: number;
  created_at: string;
  required_dns_records: DnsRecord[];
}

export interface CatchAllDisableResult {
  /** Number of active, auto-created aliases that were disabled. */
  disabled: number;
}

export interface DnsRecord {
  type: string;
  name: string;
  value: string;
  priority?: number;
}

export interface DashboardStats {
  total_aliases: number;
  active_aliases: number;
  emails_forwarded: number;
  emails_blocked: number;
  exposure_alerts: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface EmailLog {
  id: string;
  alias_id: string;
  alias_email?: string;
  sender_email: string;
  recipient_email?: string;
  subject: string | null;
  received_at: string;
  direction: "inbound" | "outbound";
  status: string;
  block_reason: string | null;
}

export interface ExposureEvent {
  id: string;
  alias_id: string;
  alias_email?: string;
  sender_domain: string;
  risk_score: number;
  detected_at: string;
}

export interface CreateAliasOptions {
  alias_type?: "random" | "custom" | "tagged";
  label?: string;
  domain?: string;
  destination_email?: string;
  custom_code?: string;
  tag?: string;
  /** Premium-only. Sender label on outbound mail ("Name <addr>"). Set on
   * creation activates immediately; subsequent edits go through the
   * dedicated /display-name endpoint with a 24h cooldown. */
  display_name?: string;
}

export interface UpdateAliasOptions {
  active?: boolean;
  label?: string;
}

export interface ClientOptions {
  apiKey: string;
  baseUrl?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}
