import { ICalendar } from 'datebook';

const startDateInput = document.querySelector('#start-date');

const TITLES = ['Course', 'Title', 'AU', 'Course', 'Type', 'Course Group',	'S/U Grade option', 'Index', 'Number',	'Status', 'Choice', 'Class', 'Type', 'Group', 'Day', 'Time', 'Venue', 'Remark'];
const DAYS = {'MON': 0, 'TUE': 1, 'WED': 2, 'THU': 3, 'FRI': 4, 'SAT': 5, 'SUN': 6}

let secondClassType = false;
let courseTitle = {'Course': '', 'Title': ''};

let init_Cal = false;
let icalendar;

// date of monday of week 1
// year, month of lesson
let date, year, month, day;

// return ics styled data
function createICS(textareaData) {
    // array of courses
    let courses = textareaData.split('\n');

    // date of monday of week 1
    date = startDateInput.value;

    // year, month of lesson
    year = parseInt(date.slice(0, 4));
    month = parseInt(date.slice(6, 8)) - 1;

    // add event for each course
    addCourse(courses);

    icalendar.download();
    init_Cal = false;
}

// for each course, add event
function addCourse(courses) {
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
}

// add event
function newEvent(course) {
    // int array of teaching weeks
    let teaching_weeks = teachingWeeks(course);
    
    // day
    day = parseInt(date.slice(8, 10));

    changeDay(course, 0);
    
    // loop to add subsequent weeks
    for (let i = 0; i < 14; i++) {
        // check if this week is a teaching week
        if (!teachingWeekCheck(teaching_weeks, i)) {
            // increment day by 7 days if not teaching week
            changeDay(course, 7);
            continue;
        }

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
            icalendar.addProperty('CATEGORIES', 'CLASS');

            init_Cal = true;
        }
        else {
            const secondEvent = new ICalendar({
                title: getTitle(course),
                location: getLocation(course),
                description: getDescription(course),
                start: getDate(course, day, 'start'),
                end: getDate(course, day, 'end')
            })
            secondEvent.addProperty('CATEGORIES', 'CLASS');
            icalendar.addEvent(secondEvent);
        }

        // increment day by 7 days
        changeDay(course, 7);
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

// get day
function changeDay(course, increment) {
    // increment day by 7 days
    if (increment == 7) {
        day = parseInt(day) + 7;
        return;
    }

    // course with 2nd class type
    if (secondClassType == true) {
        // change the day
        day += DAYS[course[2]];
    }
    else {
        // course title
        courseTitle['Course'] = course[0];
        courseTitle['Title'] = course[1];

        // change the day
        day += DAYS[course[11]];
    }
}

// teaching week (return array of weeks in int)
function teachingWeeks(course) {
    // array to store all the teaching weeks
    let weeks = [];

    let remarks;
    if (secondClassType == true) {
        remarks = course[5];
    }
    else {
        remarks = course[14];
    }
    remarks = remarks.replace('Teaching Wk', '');

    // check if the sign used is - or ,
    // remarks == '1-13' or '2,4,6,...,12'
    if (remarks[1] == '-') {
        remarks = remarks.split('-');

        // remarks == ['1', '13']
        for (let i = parseInt(remarks[0]); i <= parseInt(remarks[1]); i++) {
            weeks.push(parseInt(i));
        }
    }
    else if (remarks[1] == ',') {
        remarks = remarks.split(',');
        // remarks == ['2','4',...,'12']
        for (let i = 0; i < remarks.length; i++) {
            weeks.push(parseInt(remarks[i]));
        }
    }

    return weeks;
}

// check if that week is a teaching week
function teachingWeekCheck(teaching_weeks, week) {
    // week++ because i starts from 0
    week++;
    if (week < 8) {
        for (let j = 0; j < teaching_weeks.length; j++) {
            if (teaching_weeks[j] == week) {
                return true;
            }
        }
    }
    else if (week > 8) {
        for (let k = 0; k < teaching_weeks.length; k++) {
            // note that teaching_weeks[k] + 1 because week 8 is recess week
            if (teaching_weeks[k] + 1 == week) {
                return true;
            }
        }
    }
    // skip recess week (week 8)
    else if (week == 8) {
        return false;
    }

    return false;
}

export { createICS };