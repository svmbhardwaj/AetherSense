import { env } from "../config/env";
import { logger } from "../utils/logger";

export interface SendResult {
  ok: boolean;
  providerId?: string;
  error?: string;
}

export interface NotificationProvider {
  name: string;
  available: boolean;
  send(payload: { to: string; body: string; channel: string }): Promise<SendResult>;
}

/**
 * Base provider talks to a generic HTTP dispatch endpoint. Credentials come
 * from env; a provider without both URL and token reports unavailable and
 * never pretends a message was sent.
 */
abstract class HttpNotificationProvider implements NotificationProvider {
  abstract name: string;
  protected url?: string;
  protected token?: string;
  constructor(url?: string, token?: string) {
    this.url = url;
    this.token = token;
  }
  get available() {
    return Boolean(this.url && this.token);
  }
  async send(payload: { to: string; body: string; channel: string }): Promise<SendResult> {
    if (!this.available) return { ok: false, error: "provider_unavailable" };
    if (!this.url || !this.token) return { ok: false, error: "provider_unavailable" };
    try {
      const res = await fetch(this.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        return { ok: false, error: `provider_response_${res.status}` };
      }
      const data = (await res.json().catch(() => ({}))) as { providerId?: string; id?: string };
      return { ok: true, providerId: data.providerId ?? data.id };
    } catch (e) {
      logger.warn({ e, provider: this.name }, "provider request failed");
      return { ok: false, error: "provider_request_failed" };
    }
  }
}

export class WhatsAppProvider extends HttpNotificationProvider {
  name = "whatsapp";
  constructor() {
    super(env.WHATSAPP_API_URL, env.WHATSAPP_API_TOKEN);
  }
}

export class SmsProvider extends HttpNotificationProvider {
  name = "sms";
  constructor() {
    super(env.SMS_API_URL, env.SMS_API_TOKEN);
  }
}

export class PushProvider extends HttpNotificationProvider {
  name = "push";
  constructor() {
    super(env.PUSH_API_URL, env.PUSH_API_TOKEN);
  }
}

export class NotificationRouter {
  private providers: Record<string, NotificationProvider>;

  constructor(providers?: Record<string, NotificationProvider>) {
    this.providers = providers ?? {
      whatsapp: new WhatsAppProvider(),
      sms: new SmsProvider(),
      push: new PushProvider(),
    };
  }

  async send(channel: string, payload: { to: string; body: string }): Promise<SendResult> {
    const p = this.providers[channel];
    if (!p) return { ok: false, error: "unknown_channel" };
    if (!p.available) return { ok: false, error: "provider_unavailable" };
    return p.send({ ...payload, channel });
  }

  availability(): Record<string, "available" | "unavailable"> {
    return Object.fromEntries(
      Object.entries(this.providers).map(([k, v]) => [k, v.available ? "available" : "unavailable"]),
    );
  }
}

export const notificationRouter = new NotificationRouter();
