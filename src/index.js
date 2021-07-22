import "./index.css";
import { ICalendar } from 'datebook';
import './ICal.js';

const startDateInput = document.querySelector('#start-date');
const generateButton = document.querySelector('#generate');
const textarea = document.querySelector('#textarea');

const DAYS = {'MON': 0, 'TUE': 1, 'WED': 2, 'THU': 3, 'FRI': 4, 'SAT': 5, 'SUN': 6}

// when generate timetable button is clicked
generateButton.onclick = () => {
    let textareaData = textarea.value;
    
    // return ics styled data
    createICS(textareaData);
}


// return ics styled data
function createICS(textareaData) {
    // array of courses
    let courses = textareaData.split('\n');

    // 1st course
    let course = courses[0].split('\t');

    // date of 1st lesson
    let date = startDateInput.value;
    
    // year and month of lesson
    let year = parseInt(date.slice(0, 4));
    let month = parseInt(date.slice(6, 8)) - 1;

    // change the day
    let day = parseInt(date.slice(8, 10));
    day += DAYS[course[11]];

    // get time duration
    let time = course[12].split('-');

    const icalendar = new ICalendar({
        // Course: Title
        title: `${course[0]}: ${course[1]}`,
        // Venue
        location: `${course[13]}`,
        // Class_Type [Group]
        description: `${course[9]} [${course[10]}]`,
        start: new Date(year, month, day, Math.floor(time[0] / 100), time[0] % 100),
        end: new Date(year, month, day, Math.floor(time[1] / 100), time[1] % 100)
    })

    for (let i = 0; i < 13; i++) {
        // increment day by 7 days
        day = parseInt(day) + 7;
        
        // skip recess week (week 8) (i == 6)
        if (i == 6) {
            continue;
        }

        const secondEvent = new ICalendar({
            // Course: Title
            title: `${course[0]}: ${course[1]}`,
            // Venue
            location: `${course[13]}`,
            // Class_Type [Group]
            description: `${course[9]} [${course[10]}]`,
            start: new Date(year, month, day, Math.floor(time[0] / 100), time[0] % 100),
            end: new Date(year, month, day, Math.floor(time[1] / 100), time[1] % 100)
        })
        icalendar.addEvent(secondEvent);
    }

    icalendar.download();
}

// Course	Title	AU 	Course Type 	Course Group	S/U Grade option	Index Number	Status  	Choice 	Class Type 	Group	 Day	  Time	  Venue	 Remark
//AB1202	STATISTICS & ANALYSIS	3	CORE	 	 	00561	REGISTERED	 	SEM	13	THU	1030-1220	S4-SR17	Teaching Wk1-13