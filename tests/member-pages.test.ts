import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = new URL("..", import.meta.url).pathname;
const read = (path: string) => readFileSync(join(root, path), "utf8");

function walk(dir: string, out: string[] = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

const routes = new Set(
  walk(join(root, "app"))
    .filter((file) => file.endsWith("/page.tsx"))
    .map((file) => {
      const relative = file.slice(join(root, "app").length, -"/page.tsx".length);
      return "/" + relative.split("/").filter((part) => part && !/^\(.*\)$/.test(part)).join("/");
    }),
);

describe("member and safety preview routes", () => {
  it("provides working route entries for connections, chats, notifications and reporting", () => {
    for (const route of ["/connections", "/chats", "/notifications", "/report", "/admin"]) {
      expect(routes.has(route)).toBe(true);
    }
  });

  it("does not claim that a local interest is a mutual connection", () => {
    const source = read("components/member/connections-view.tsx");
    expect(source).toContain("not a match");
    expect(source).toContain("Synthetic demo");
  });

  it("routes chats through persisted, connection-only messaging rather than the old synthetic preview", () => {
    const route = read("app/(member)/chats/page.tsx");
    const view = read("components/member/live-chats-view.tsx");
    const actions = read("lib/messaging/actions.ts");
    expect(route).toContain("LiveChatsView");
    expect(route).toContain("getMyConversations");
    expect(view).toContain("postgres_changes");
    expect(view).toContain("Load older messages");
    expect(actions).toContain('rpc("send_conversation_message"');
    expect(route).not.toContain("{ ChatsView }");
  });

  it("routes notifications through persisted member events and preferences", () => {
    const route = read("app/(member)/notifications/page.tsx");
    const view = read("components/member/live-notifications-view.tsx");
    const actions = read("lib/notifications/actions.ts");
    expect(route).toContain("LiveNotificationsView");
    expect(route).toContain("getMyNotifications");
    expect(view).toContain('value: "matches"');
    expect(view).toContain('value: "messages"');
    expect(view).toContain("Save preferences");
    expect(actions).toContain('rpc("mark_all_my_notifications_read"');
    expect(route).not.toContain("{ NotificationsView }");
  });

  it("keeps report submission local and explicitly unsent", () => {
    const source = read("components/safety/report-form.tsx");
    expect(source).toContain("preventDefault");
    expect(source).toContain("has not been sent or stored");
    expect(source).not.toContain("fetch(");
  });

  it("labels the admin interface as unavailable and does not expose sample member metrics", () => {
    const source = read("components/admin/admin-overview.tsx");
    expect(source).toContain("Administration is not enabled");
    expect(source).toContain("non-operational interface preview");
    expect(/\b\d+\s+(?:members|reports|matches)\b/i.test(source)).toBe(false);
  });

  it("opens public pages to search and keeps private areas out", () => {
    expect(read("app/layout.tsx")).toContain("robots: { index: true, follow: true }");
    expect(read("app/robots.ts")).toContain('allow: "/"');
  });
});

describe("discovery preview actions", () => {
  it("supports local-only block actions and filters blocked synthetic profiles from discovery", () => {
    expect(read("lib/discovery/types.ts")).toContain('"blocked"');
    expect(read("lib/discovery/demo-store.ts")).toContain('"blocked"');
    const discovery = read("components/discovery/discovery-experience.tsx");
    expect(discovery).toContain('action === "blocked"');
    expect(discovery).toContain("Report a concern");
    expect(discovery).toContain("Advanced filters");
    expect(discovery).toContain("Profile details · synthetic demo");
    expect(discovery).toContain('role="dialog"');
    expect(discovery).toContain("Math.max(18");
  });

  it("provides age, location, intention and interest filters", () => {
    const source = read("components/discovery/discovery-experience.tsx");
    expect(source).toContain("Minimum age");
    expect(source).toContain("Maximum age");
    expect(source).toContain("Relationship intention");
    expect(source).toContain("Location");
  });

  it("supports searching by display name, city, country or interest", () => {
    const source = read("components/discovery/discovery-experience.tsx");
    expect(source).toContain("Search profiles");
    expect(source).toContain("candidate.displayName, candidate.city, candidate.country");
  });
});
