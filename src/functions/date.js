const weekStartOn = 1
const msInDay = 86400000

/**
 * Renvoie la date du début de semaine
 * @param {Date} date
 * @return {Date}
 */
export function startOfWeek(date) {
    const d = new Date(date)

    // 0	Dimanche
    // 1	Lundi
    // 2	Mardi
    // 3	Mercredi
    // 4	Jeudi
    // 5	Vendredi
    // 6	Samedi
    // Le premier jour du mois de février est un samedi (6)
    const day = d.getDay()
    // Il manque donc 5 jours pour arriver au premier jour de la semaine, c'est-à dire lundi (1)

    // si le premier jour du mois est un samedi
    // 0 + 6 - 1
    // 5 (il manque 5 jours pour aller à lundi)

    // si le premier jour du mois était un dimanche
    // 7 + 0 - 1
    // 6 (il manque 6 jours pour aller à lundi)

    // Get diff between the given date and the start of the week
    const diff = (day < weekStartOn ? 7 : 0) + day - weekStartOn
    d.setDate(d.getDate() - diff)
    d.setHours(0, 0, 0, 0)

    return d
}

/**
 * Renvoie la date en fin de semaine
 * @param {Date} date
 * @return {Date}
 */
export function endOfWeek(date) {
    const d = new Date(date)

    // 0	Dimanche
    // 1	Lundi
    // 2	Mardi
    // 3	Mercredi
    // 4	Jeudi
    // 5	Vendredi
    // 6	Samedi
    // Le premier jour du mois de février est un samedi (6)
    const day = d.getDay()
    // Il manque donc 1 jour pour arriver au dernier jour de la semaine (0 - dimanche)

    // Get diff between the given date and the end of the week
    // 0 + 6 - (6 - 1)
    // 0 + 6 - 5
    // 1 (il faut ajouter 5 jours pour aller jusqu'à dimanche)

    // si le premier jour du mois était un dimanche
    // -7 + 6 - (0 - 1)
    // -1 - (-1)
    // -1 + 1
    // 0 (il faut ajouter 0 jour pour aller jusqu'à dimanche)

    const diff = (day < weekStartOn ? -7 : 0) + 6 - (day - weekStartOn)
    d.setDate(d.getDate() + diff)
    d.setHours(23, 59, 59, 999)

    return d
}

/**
 * Renvoie la date de fin de mois
 * @param {Date} date
 * @return {Date}
 */
export function endOfMonth(date) {
    const d = new Date(date)

    // ajoute un mois
    d.setMonth(d.getMonth() + 1)

    // positionne la date au dernier jour du mois précédent.
    d.setDate(0)
    d.setHours(23, 59, 59, 999)

    return d
}

/**
 * Ajoute n jour(s) à une date
 * @param {Date} date
 * @param {number} n
 * @return {Date}
 */
export function addDays(date, n) {
    const d = new Date(date)
    d.setDate(d.getDate() + n)

    return d
}

/**
 * Renvoie les jours entre les deux dates
 * @param {Date} start
 * @param {Date} end
 * @return {Date[]}
 */
export function getDaysBetween(start, end) {
    if (start > end) {
        throw new Error('La date de debut ne peux pas être supérieur a la date de fin')
    }

    const days = [];
    let cursor = new Date(start)
    cursor.setHours(0, 0 , 0, 0)

    while (cursor < end) {
        days.push(cursor)
        cursor = addDays(cursor, 1)
    }

    return days
}

/**
 * Renvoie un identifiant pour un jour
 * @param {Date} date
 * @return {string}
 */
export function getDayId(date) {
    return `${date.getFullYear()}-${date.getMonth().toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

/**
 * Trouve le nombre de jours en calendrier entre 2 dates
 * @param {Date} start
 * @param {Date} end
 * @return {number}
 */
export function diffInDay(start, end) {
    const a = new Date(start)
    a.setHours(0, 0, 0, 0)
    const b = new Date(end)
    b.setHours(23, 59, 59, 999)

    return Math.round((b.getTime() - a.getTime()) / msInDay)
}

/**
 * Trouve la date la plus loin dans le temps
 * @param {Date[]} dates
 */
export function minDates(dates) {
    if (dates.length === 0) {
        throw new Error("Impossible de trouver le minimum sans dates");
    }

    let min = dates[0];
    for (const date of dates) {
        if (date < min) {
            min = date;
        }
    }

    return min;
}