import "./index.css";
import { ICalendar } from 'datebook';
import './ICal.js';
const startdate = document.querySelector('#start-date');
const generateButton = document.querySelector('#generate');
const textarea = document.querySelector('#textarea');

// when generate timetable button is clicked
generateButton.onclick = () => {
    console.log(textarea.value);
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
    const icalendar = new ICalendar({
        title: 'Happy Hour',
        location: 'The Bar, New York, NY',
        description: 'Let\'s blow off some steam from our weekly deployments to enjoy a tall cold one!',
        start: new Date('2020-07-04T19:00:00'),
        end: new Date('2020-07-04T23:30:00'),
        recurrence: {
            frequency: 'WEEKLY',
            interval: 2
        }
    })
    console.log(icalendar.render())
}

