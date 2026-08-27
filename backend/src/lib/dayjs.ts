import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const DEFAULT_TIMEZONE = "America/Sao_Paulo";
dayjs.tz.setDefault(DEFAULT_TIMEZONE);

export { dayjs, DEFAULT_TIMEZONE };
