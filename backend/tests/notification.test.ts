import { describe, expect, it } from "vitest";
import { NotificationRouter } from "../src/services/notification.service";

class FakeProvider {
  name: string;
  available: boolean;
  constructor(name: string, available: boolean) {
    this.name = name;
    this.available = available;
  }
  async send(): Promise<{ ok: boolean; error?: string }> {
    if (!this.available) return { ok: false, error: "provider_unavailable" };
    return { ok: true, providerId: `${this.name}-1` };
  }
}

describe("NotificationRouter", () => {
  it("reports unavailable channels truthfully", () => {
    const router = new NotificationRouter({
      whatsapp: new FakeProvider("whatsapp", true),
      sms: new FakeProvider("sms", false),
      push: new FakeProvider("push", false),
    });
    expect(router.availability()).toEqual({
      whatsapp: "available",
      sms: "unavailable",
      push: "unavailable",
    });
  });

  it("never fakes a send when the provider is unavailable", async () => {
    const router = new NotificationRouter({ sms: new FakeProvider("sms", false) });
    const result = await router.send("sms", { to: "+91...", body: "test" });
    expect(result.ok).toBe(false);
    expect(result.providerId).toBeUndefined();
  });

  it("rejects unknown channels", async () => {
    const router = new NotificationRouter({});
    const result = await router.send("fax", { to: "x", body: "y" });
    expect(result).toEqual({ ok: false, error: "unknown_channel" });
  });
});
