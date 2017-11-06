const makeKeys = time => {
    return Object.keys(time).reduce((obj, key) => {
        if (time[key] === "1") obj[key.slice(0, key.length - 1)] = time[key];
        else obj[key] = time[key];
        return obj;
    }, {});
};

export default ms => {
    if (isNaN(ms) || ms < 0)
        return { days: "00", hours: "00", minutes: "00", seconds: "00" };

    const msInDay = 86400000;
    const days = `${Math.floor(ms / msInDay)}`;
    const hours = `${Math.floor((ms % msInDay) / (60 * 60 * 1000))}`;
    const minutes = `${Math.floor(
        ((ms % msInDay) % (60 * 60 * 1000)) / (60 * 1000),
    )}`;
    const seconds = `${Math.floor(
        (((ms % msInDay) % (60 * 60 * 1000)) % (60 * 1000)) / 1000,
    )}`;
    const obj = makeKeys({ days, hours, minutes, seconds });

    Object.keys(obj).forEach(key => {
        if (obj[key].length === 1) obj[key] = "0" + obj[key];
    });

    return obj;
};

export function formatDate(date) {
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    if (date.toLocaleDateString) {
        return date.toLocaleDateString();
    }
    return `${monthIndex + 1}-${day}-${year}`;
}
