import {
  formatInTimeZone,
  fromZonedTime,
  toZonedTime,
} from "date-fns-tz";

export const APP_TIMEZONE = "Asia/Kolkata";

/**
 * Current date/time in application timezone
 */
export const getCurrentIST = () => {
  return toZonedTime(
    new Date(),
    APP_TIMEZONE
  );
};

/**
 * Today's date as YYYY-MM-DD
 */
export const getTodayDate = () => {
  return formatInTimeZone(
    new Date(),
    APP_TIMEZONE,
    "yyyy-MM-dd"
  );
};

/**
 * Start of today's date in application timezone
 */
export const getStartOfToday = () => {
  const dateString = getTodayDate();

  return fromZonedTime(
    `${dateString} 00:00:00`,
    APP_TIMEZONE
  );
};

/**
 * End of today's date in application timezone
 */
export const getEndOfToday = () => {
  const dateString = getTodayDate();

  return fromZonedTime(
    `${dateString} 23:59:59.999`,
    APP_TIMEZONE
  );
};