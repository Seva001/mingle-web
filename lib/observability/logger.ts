/**
 * Privacy-preserving structured application events.
 * Never pass message bodies, email addresses, DOBs, tokens, profile answers,
 * exact locations, provider payloads, or raw request objects to this logger.
 */
export type SafeLogLevel = 'info' | 'warn' | 'error';
export type SafeEventName =
  | 'route.unexpected_error'
  | 'auth.callback_failed'
  | 'storage.operation_failed'
  | 'notification.delivery_deferred'
  | 'admin.action_failed';

const SAFE_CODE = /^[a-z0-9_.-]{1,64}$/i;
const SAFE_ROUTE = /^\/[a-z0-9/_-]{1,100}$/i;

export function logSafeEvent(
  level: SafeLogLevel,
  event: SafeEventName,
  details: { code?: string; route?: string; durationMs?: number } = {},
): void {
  const record = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...(details.code && SAFE_CODE.test(details.code) ? { code: details.code } : {}),
    ...(details.route && SAFE_ROUTE.test(details.route) ? { route: details.route } : {}),
    ...(Number.isFinite(details.durationMs) && details.durationMs! >= 0
      ? { duration_ms: Math.round(details.durationMs!) }
      : {}),
  };
  const line = JSON.stringify(record);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.info(line);
}
