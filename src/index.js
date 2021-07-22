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
    let data = generateData(textareaData);

    // create ics file for download
    // filename = "schedule.ics";
    // type = "application/calendar+xml"
    // download(data, filename, type)
}


// return ics styled data
function generateData(textareaData) {
    // array of courses
    let courses = textareaData.split('\n');

    // 1st course
    let course = courses[0].split('\t');

    // calculate date of lesson
    let date = startDateInput.value;
    // change the day
    let day = parseInt(date.slice(8, 10));
    day += DAYS[course[11]];
    day = ("0" + day).slice(-2);
    let actualDate = date.slice(0, 8).concat(day);

    // get time duration
    let time = course[12].split('-');

    const icalendar = new ICalendar({
        // Course: Title
        title: `${course[0]}: ${course[1]}`,
        // Venue
        location: `${course[13]}`,
        // Class_Type [Group]
        description: `${course[9]} [${course[10]}]`,
        start: new Date(`${actualDate}T${Math.floor(time[0] / 100)}:${time[0] % 100}:00`),
        end: new Date(`${actualDate}T${Math.floor(time[1] / 100)}:${time[1] % 100}:00`),
        recurrence: {
            frequency: 'WEEKLY',
            interval: 1,
            count: 13
        }
    })
    console.log(icalendar.render());
    icalendar.download();
}

// Course	Title	AU 	Course Type 	Course Group	S/U Grade option	Index Number	Status  	Choice 	Class Type 	Group	 Day	  Time	  Venue	 Remark
//AB1202	STATISTICS & ANALYSIS	3	CORE	 	 	00561	REGISTERED	 	SEM	13	THU	1030-1220	S4-SR17	Teaching Wk1-13