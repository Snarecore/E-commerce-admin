import moment from "moment";

const parseDateSafely = (date?: Date | string | number | null): moment.Moment => {
    if (!date) return moment().utcOffset('+06:00');
    if (typeof date === "string") {
        const trimmed = date.trim();
        if (/^\d+$/.test(trimmed)) {
            const mNum = moment(Number(trimmed)).utcOffset('+06:00');
            if (mNum.isValid()) return mNum;
        }
        // If string does not specify timezone offset, parse as UTC and apply Bangladesh offset (+06:00)
        if (!trimmed.endsWith("Z") && !/[+-]\d{2}:?\d{2}$/.test(trimmed)) {
            const parsedUtc = moment.utc(trimmed).utcOffset('+06:00');
            if (parsedUtc.isValid()) return parsedUtc;
        }
    }
    const m = moment(date).utcOffset('+06:00');
    if (!m.isValid()) return moment().utcOffset('+06:00');
    return m;
};

export const formatDate = (date?: Date | string | number | null, format: string = "YYYY-MM-DD HH:mm"): string => {
    return parseDateSafely(date).format(format);
};

export const getCurrentDate = (format: string = "YYYY-MM-DD HH:mm"): string => {
    return moment().utcOffset('+06:00').format(format);
};

export const addTimeToDate = (date: Date | string, amount: number, unit: moment.unitOfTime.DurationConstructor = "days"): string => {
    return parseDateSafely(date).add(amount, unit).format("YYYY-MM-DD HH:mm");
};

export const subtractTimeFromDate = (date: Date | string, amount: number, unit: moment.unitOfTime.DurationConstructor = "days"): string => {
    return parseDateSafely(date).subtract(amount, unit).format("YYYY-MM-DD HH:mm");
};

export const getStartOf = (unit: moment.unitOfTime.StartOf): string => {
    return moment().startOf(unit).format("YYYY-MM-DD HH:mm");
};

export const getEndOf = (unit: moment.unitOfTime.StartOf): string => {
    return moment().endOf(unit).format("YYYY-MM-DD HH:mm");
};

export const formatPrettyDate = (date?: Date | string | number | null): string => {
    return parseDateSafely(date).format("LL");
};

export const formatPrettyDateWithTime = (date?: Date | string | number | null): string => {
    return parseDateSafely(date).format("LLL");
};


