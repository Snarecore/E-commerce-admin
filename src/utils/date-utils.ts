import moment from "moment";

export const formatDate = (date?: Date | string | number | null, format: string = "YYYY-MM-DD HH:mm"): string => {
    if (!date) return moment().format(format);
    const m = moment(date);
    if (!m.isValid()) {
        if (typeof date === "string" && !isNaN(Number(date))) {
            const mNum = moment(Number(date));
            if (mNum.isValid()) return mNum.format(format);
        }
        return moment().format(format);
    }
    return m.format(format);
};

export const getCurrentDate = (format: string = "YYYY-MM-DD HH:mm"): string => {
    return moment().format(format);
};

export const addTimeToDate = (date: Date | string, amount: number, unit: moment.unitOfTime.DurationConstructor = "days"): string => {
    return moment(date).add(amount, unit).format("YYYY-MM-DD HH:mm");
};

export const subtractTimeFromDate = (date: Date | string, amount: number, unit: moment.unitOfTime.DurationConstructor = "days"): string => {
    return moment(date).subtract(amount, unit).format("YYYY-MM-DD HH:mm");
};

export const getStartOf = (unit: moment.unitOfTime.StartOf): string => {
    return moment().startOf(unit).format("YYYY-MM-DD HH:mm");
};

export const getEndOf = (unit: moment.unitOfTime.StartOf): string => {
    return moment().endOf(unit).format("YYYY-MM-DD HH:mm");
};

export const formatPrettyDate = (date?: Date | string | number | null): string => {
    if (!date) return moment().format("LL");
    const m = moment(date);
    if (!m.isValid()) {
        if (typeof date === "string" && !isNaN(Number(date))) {
            const mNum = moment(Number(date));
            if (mNum.isValid()) return mNum.format("LL");
        }
        return moment().format("LL");
    }
    return m.format("LL");
};

export const formatPrettyDateWithTime = (date?: Date | string | number | null): string => {
    if (!date) return moment().format("LLL");
    const m = moment(date);
    if (!m.isValid()) {
        if (typeof date === "string" && !isNaN(Number(date))) {
            const mNum = moment(Number(date));
            if (mNum.isValid()) return mNum.format("LLL");
        }
        return moment().format("LLL");
    }
    return m.format("LLL");
};

