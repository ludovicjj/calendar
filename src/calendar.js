import {Events} from "./data.js";
import {
    addDays,
    diffInDay,
    endOfMonth,
    endOfWeek,
    getDayId,
    getDaysBetween,
    minDates,
    startOfWeek
} from "./functions/date.js";

const dayFormatter = new Intl.DateTimeFormat(undefined, {weekday: 'short'}) // long
const timeFormatter = new Intl.DateTimeFormat(undefined, {hour: '2-digit', minute: '2-digit'})
const monthFormatter = new Intl.DateTimeFormat(undefined, {month: 'long'})

/** @typedef {{name: string, start: Date, end: Date, fullDay?: boolean}} CalendarEvent */
class Calendar {

    /** @type {Map<string, CalendarEvent[]>} */
    #eventsMap = new Map()

    /**
     *
     * @param {HTMLElement} root Element HTML sur lequel on monte le calendar
     * @param {CalendarEvent[]} events Array d'objet CalendarEvent (voir typedef)
     * @param {number} month mois du calendrier (0 pour janvier)
     * @param {number} year Année du calendrier
     */
    constructor(root, events, month, year) {
        this.root = root
        this.month = month
        this.year = year

        this.#fillEventMap(events)
        this.#render()

        const previousButton = root.querySelector('.previous');
        const nextButton = root.querySelector('.next');

        previousButton.addEventListener('click', () => this.#navigate(-1));
        nextButton.addEventListener('click', () => this.#navigate(1));
    }

    #render() {
        const curentDate = new Date(this.year, this.month, 1)
        const firstDayOfMonth = new Date(this.year, this.month, 1, 0, 0, 0, 0);
        const start = startOfWeek(firstDayOfMonth);
        const end = endOfWeek(endOfMonth(firstDayOfMonth));
        const daysOfMonth = getDaysBetween(start, end);

        const days = Array.from(
            {length: 7},
            (_, i) => dayFormatter.format(addDays(start, i))
        );


        this.root.innerHTML = `
            <div class="nav_date-info">
                <div class="nav_control">
                    <div class="nav_arrows">
                        <button type="button" class="previous">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="button__icon">
                                <path d="m15 18-6-6 6-6"></path>
                            </svg>
                        </button>
                        <button type="button" class="next">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="button__icon">
                                <path d="m9 18 6-6-6-6"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="nav_date">${monthFormatter.format(curentDate)} ${curentDate.getFullYear()}</div>
            </div>
            <table class="calendar">
            <thead>
                <tr>
                    ${days.map(day => `<th>${day}</th>`).join('')}
                </tr>
            </thead>
                <tbody>
                </tbody>
            </table>`

        /** @type {Map<CalendarEvent, position>} */
        const positionMap = new Map()
        const tbody = this.root.querySelector('tbody')
        let tr = document.createElement('tr')

        for (const dayOfMonth of daysOfMonth) {
            const td = this.#buildCell(dayOfMonth, this.month, positionMap)
            tr.append(td)
            if (dayOfMonth.getDay() === 0) {
                tbody.append(tr)
                tr = document.createElement('tr')
                positionMap.clear()
            }
        }
    }

    #navigate(direction) {
        // direction = -1 pour previous, 1 pour next
        this.month += direction;

        if (this.month < 0) {
            this.month = 11;
            this.year -= 1;
        } else if (this.month > 11) {
            this.month = 0;
            this.year += 1;
        }

        // Reconstruire le calendrier avec le nouveau mois et année
        this.#render();
        const previousButton = this.root.querySelector('.previous');
        const nextButton = this.root.querySelector('.next');

        previousButton.addEventListener('click', () => this.#navigate(-1));
        nextButton.addEventListener('click', () => this.#navigate(1));
    }

    /**
     * Construit les element <td> du <tbody>
     * @param {Date} date
     * @param {number} month
     * @param {Map<CalendarEvent, position>} positionMap
     * @return {HTMLTableCellElement}
     */
    #buildCell(date, month, positionMap) {
        const getAvailablePosition = () => {
            if (positionMap.size === 0) {
                return 0;
            }
            const positions = Array.from(positionMap.values());
            const max = Math.max(...positions);
            for (let i = 0; i < max; i++) {
                if (!positions.includes(i)) {
                    return i;
                }
            }
            return max + 1;
        }
        const td = document.createElement('td')
        const isCurrentMonth = date.getMonth() === month

        td.innerHTML = `<div class="calendar_cell">
            <div class="calendar_date ${isCurrentMonth ? '' : 'calendar_date-diff'}">${date.getDate()}</div>
            <div class="calendar_events"></div>
        </div>`

        const eventContainer = td.querySelector('.calendar_events')
        const dayId = getDayId(date)
        const events = this.#eventsMap.get(dayId) || []
        const finishedEvents = [];

        for (const event of events) {
            const classes = ['calendar_event']
            if (event.type) {
                classes.push('calendar_event-' + event.type)
            }


            // Début d'un évènement sur plusieurs jours
            if (
                event.fullDay &&
                (dayId === getDayId(event.start) || date.getDay() === 1)
            ) {
                const position = getAvailablePosition()
                positionMap.set(event, position);
                const endDate =  minDates([event.end, endOfWeek(date)])

                const days = diffInDay(date, endDate)

                if (dayId !== getDayId(event.start)) {
                    classes.push('calendar_event-overflow-left')
                }
                if (endDate !== event.end) {
                    classes.push('calendar_event-overflow-right')
                }
                classes.push('calendar_event-fullday')

                eventContainer.insertAdjacentHTML(
                    'beforeend',
                    `<div 
                        class="${classes.join(' ')}"
                        style="--days:${days}; --offset:${position}"
                    >
                        ${event.name}
                    </div>`
                )
            }

            if (event.fullDay && dayId === getDayId(event.end)) {
                finishedEvents.push(event)
            }

            if (!event.fullDay) {
                classes.push('calendar_event-hour')
                eventContainer.insertAdjacentHTML('beforeend', `<div class="${classes.join(' ')}">
                    <span>${timeFormatter.format(event.start)} - ${event.name}</span>
                </div>`)
            }
        }

        eventContainer.style.setProperty('--offset', (Math.max(...positionMap.values()) + 1).toString())

        for (const event of finishedEvents) {
            positionMap.delete(event)
        }

        return td
    }

    /**
     * @param {CalendarEvent[]} events
     */
    #fillEventMap(events) {
        const sortEvents = [...events].sort((a, b) => a.start < b.start ? -1 : 1)

        for (const event of sortEvents) {
            const days = getDaysBetween(event.start, event.end)
            for (const day of days) {
                const id = getDayId(day)
                this.#eventsMap.set(
                    id,
                    [
                        ...(this.#eventsMap.get(id) || []),
                        event
                    ]
                )
            }
        }
    }
}

const c = new Calendar(
    document.getElementById('app'),
    Events,
    new Date().getMonth(),
    new Date().getFullYear()
)

console.log(c)