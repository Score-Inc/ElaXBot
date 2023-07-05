import { createLogger, format, transports } from 'winston';
const { combine, timestamp, label, printf } = format;

export const logger = createLogger({
    format: combine(
        label({ label: 'discordBot' }),
        timestamp(),
        printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
    ),
    transports: [new transports.Console()],
});