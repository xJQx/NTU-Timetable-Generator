import { ICalendar } from 'datebook';

const startDateInput = document.querySelector('#start-date');

const TITLES = ['Course', 'Title', 'AU', 'Course', 'Type', 'Course Group',	'S/U Grade option', 'Index', 'Number',	'Status', 'Choice', 'Class', 'Type', 'Group', 'Day', 'Time', 'Venue', 'Remark'];
const DAYS = {'MON': 0, 'TUE': 1, 'WED': 2, 'THU': 3, 'FRI': 4, 'SAT': 5, 'SUN': 6}

let secondClassType = false;
let courseTitle = {'Course': '', 'Title': ''};

let init_Cal = false;
let icalendar;

// date of monday of week 1
let date;

// year, month of lesson
let year;
let month;

// return ics styled data
function createICS(textareaData) {
    // array of courses
    let courses = textareaData.split('\n');

        // date of monday of week 1
        date = startDateInput.value;

        // year, month of lesson
        year = parseInt(date.slice(0, 4));
        month = parseInt(date.slice(6, 8)) - 1;

    course_loop:
    for (let i = 0; i < courses.length; i++) {
        let course = courses[i].split('\t');

        // remove headings if it is included
        for (let j = 0; j < TITLES.length; j++) {
            if (course[0] == TITLES[j]) {
                continue course_loop;
            }
        }
        
        // if a course has different class types
        if (course.length == 6) {
            secondClassType = true;
            newEvent(course);
            secondClassType = false;
        }
        
        // add course to icalendar
        else {
            // check if it is a REGISTERED course
            if (course[7] == 'REGISTERED') {
                newEvent(course);
            }
        }
    }
    icalendar.download();
}

// add event
function newEvent(course) {
    console.log(course);
    
    // day
    let day = parseInt(date.slice(8, 10));

    // course with 2nd class type
    if (secondClassType == true) {
        // change the day
        day += DAYS[course[2]];
    }
    
    else {
        // course title
        TITLES['Course'] = course[0];
        TITLES['Title'] = course[1];

        // change the day
        day += DAYS[course[11]];

        // initialise icalendar
        if (init_Cal == false) {
            icalendar = new ICalendar({
                // Course: Title
                title: getTitle(course),
                // Venue
                location: getLocation(course),
                // Class_Type [Group]
                description: getDescription(course),
                start: getDate(course, day, 'start'),
                end: getDate(course, day, 'end')
            })
        }
    }
    
    // loop to add subsequent weeks
    for (let i = 0; i < 14; i++) {
        // skip 1 if the event is created when icalendar is initialised
        if (init_Cal == false) {
            init_Cal = true;

            // increment day by 7 days
            day = parseInt(day) + 7;

            continue;
        }
        
        // skip recess week (week 8) (i == 7)
        if (i == 7) {
            // increment day by 7 days
            day = parseInt(day) + 7;
            
            continue;
        }

        const secondEvent = new ICalendar({
            title: getTitle(course),
            location: getLocation(course),
            description: getDescription(course),
            start: getDate(course, day, 'start'),
            end: getDate(course, day, 'end')
        })
        icalendar.addEvent(secondEvent);

        // increment day by 7 days
        day = parseInt(day) + 7;
    }
}

// Course: Title
function getTitle(course) {
    if (secondClassType == true) {
        return `${courseTitle['Course']}: ${courseTitle['Title']}`;
    }

    return `${course[0]}: ${course[1]}`;
}

// Venue
function getLocation(course) {
    if (secondClassType == true) {
        return `${course[4]}`;
    }
    
    return `${course[13]}`;
}

// Class_Type [Group]
function getDescription(course) {
    if (secondClassType == true) {
        return `${course[0]} [${course[1]}]`;
    }

    return `${course[9]} [${course[10]}]`;
}

// start / end
function getDate(course, day, s_or_e) {
    // get time duration
    let time;
    if (secondClassType == true) {
        time = course[3].split('-');
    }
    else {
        time = course[12].split('-');
    }

    if (s_or_e == 'start') {
        return (new Date(year, month, day, Math.floor(time[0] / 100), time[0] % 100));
    }
    else if (s_or_e == 'end') {
        return (new Date(year, month, day, Math.floor(time[1] / 100), time[1] % 100));
    }
}

export { createICS };