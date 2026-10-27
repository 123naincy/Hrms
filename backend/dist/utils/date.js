"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEndOfToday = exports.getStartOfToday = exports.getTodayDate = exports.getCurrentIST = exports.APP_TIMEZONE = void 0;
const date_fns_tz_1 = require("date-fns-tz");
exports.APP_TIMEZONE = "Asia/Kolkata";
/**
 * Current date/time in application timezone
 */
const getCurrentIST = () => {
    return (0, date_fns_tz_1.toZonedTime)(new Date(), exports.APP_TIMEZONE);
};
exports.getCurrentIST = getCurrentIST;
/**
 * Today's date as YYYY-MM-DD
 */
const getTodayDate = () => {
    return (0, date_fns_tz_1.formatInTimeZone)(new Date(), exports.APP_TIMEZONE, "yyyy-MM-dd");
};
exports.getTodayDate = getTodayDate;
/**
 * Start of today's date in application timezone
 */
const getStartOfToday = () => {
    const dateString = (0, exports.getTodayDate)();
    return (0, date_fns_tz_1.fromZonedTime)(`${dateString} 00:00:00`, exports.APP_TIMEZONE);
};
exports.getStartOfToday = getStartOfToday;
/**
 * End of today's date in application timezone
 */
const getEndOfToday = () => {
    const dateString = (0, exports.getTodayDate)();
    return (0, date_fns_tz_1.fromZonedTime)(`${dateString} 23:59:59.999`, exports.APP_TIMEZONE);
};
exports.getEndOfToday = getEndOfToday;
