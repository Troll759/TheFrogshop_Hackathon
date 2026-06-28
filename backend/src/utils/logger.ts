type LogLevel = "debug" | "info" | "warn" | "error";

interface LogFields {
  [key: string]: unknown;
}

function writeLog(level: LogLevel, message: string, fields: LogFields = {}): void {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...fields,
  };

  const output = JSON.stringify(entry);

  if (level === "error") {
    console.error(output);
    return;
  }

  if (level === "warn") {
    console.warn(output);
    return;
  }

  console.log(output);
}

export const logger = {
  debug: (message: string, fields?: LogFields) => writeLog("debug", message, fields),
  info: (message: string, fields?: LogFields) => writeLog("info", message, fields),
  warn: (message: string, fields?: LogFields) => writeLog("warn", message, fields),
  error: (message: string, fields?: LogFields) => writeLog("error", message, fields),
};
