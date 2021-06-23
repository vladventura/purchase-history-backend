const winston = require("winston");

const loggerFactory = (level, label) =>
  winston.createLogger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.label({ label }),
      loggerFormat
    ),
    level,
  });

const loggerFormat = winston.format.printf(
  ({ level, message, label, timestamp }) => {
    return `[${level.toUpperCase()} | ${timestamp}]: ${message} (${label})`;
  }
);

module.exports = { loggerFactory };

// for cli and npm levels
// error: LeveledLogMethod;
// warn: LeveledLogMethod;
// help: LeveledLogMethod;
// data: LeveledLogMethod;
// info: LeveledLogMethod;
// debug: LeveledLogMethod;
// prompt: LeveledLogMethod;
// http: LeveledLogMethod;
// verbose: LeveledLogMethod;
// input: LeveledLogMethod;
// silly: LeveledLogMethod;

// for syslog levels only
// emerg: LeveledLogMethod;
// alert: LeveledLogMethod;
// crit: LeveledLogMethod;
// warning: LeveledLogMethod;
// notice: LeveledLogMethod;
