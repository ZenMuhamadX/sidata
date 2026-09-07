type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const SENSITIVE_KEYS_REGEX = /password|token|secret|key|credential|authorization|nik|nisn|bearer/i;

function sanitizeValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEYS_REGEX.test(key)) {
    return '[REDACTED]';
  }

  if (value && typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.map((item, index) => sanitizeValue(String(index), item));
    }
    const sanitizedObj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      sanitizedObj[k] = sanitizeValue(k, v);
    }
    return sanitizedObj;
  }

  return value;
}

function sanitizeMetadata(metadata?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!metadata) return undefined;
  return sanitizeValue('root', metadata) as Record<string, unknown>;
}

function formatLogMessage(level: LogLevel, message: string): string {
  const timestamp = new Date().toISOString();
  return `[${level.toUpperCase()}] ${timestamp} - ${message}`;
}

export const logger = {
  debug(message: string, metadata?: Record<string, unknown>): void {
    if (import.meta.env.DEV) {
      const sanitized = sanitizeMetadata(metadata);
      if (sanitized) {
        console.debug(formatLogMessage('debug', message), sanitized);
      } else {
        console.debug(formatLogMessage('debug', message));
      }
    }
  },

  info(message: string, metadata?: Record<string, unknown>): void {
    const sanitized = sanitizeMetadata(metadata);
    if (sanitized) {
      console.info(formatLogMessage('info', message), sanitized);
    } else {
      console.info(formatLogMessage('info', message));
    }
  },

  warn(message: string, metadata?: Record<string, unknown>): void {
    const sanitized = sanitizeMetadata(metadata);
    if (sanitized) {
      console.warn(formatLogMessage('warn', message), sanitized);
    } else {
      console.warn(formatLogMessage('warn', message));
    }
  },

  error(message: string, metadata?: Record<string, unknown>): void {
    const sanitized = sanitizeMetadata(metadata);
    if (sanitized) {
      console.error(formatLogMessage('error', message), sanitized);
    } else {
      console.error(formatLogMessage('error', message));
    }
  },
};
