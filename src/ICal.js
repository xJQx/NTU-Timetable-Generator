import { ICalendar } from 'datebook';

const HEADINGS = ['Course', 'Title', 'AU', 'Course', 'Type', 'Course Group',	'S/U Grade option', 'Index', 'Number',	'Status', 'Choice', 'Class', 'Group', 'Day', 'Time', 'Venue', 'Remark'];
const DAYS = {'MON': 0, 'TUE': 1, 'WED': 2, 'THU': 3, 'FRI': 4, 'SAT': 5, 'SUN': 6}

let courseInfo = {'Course': '', 'Title': '', 'AU': '', 'Course_Type': '', 'Course_Group': '', 'S/U_Grade_Option': '', 'Index_Number': '', 'Status': '', 'Choice': '', 'Class_Type': '', 'Group': '', 'Day': '', 'Time': '', 'Venue': '', 'Remark': ''};

let init_Cal = false;
let icalendar;

// date of monday of week 1
// year, month of lesson
let date, year, month, day;

// return ics styled data
function createICS(textareaData) {
    // array of courses
    let courses = textareaData.split('\n');

    // check if venue is split into 2 lines e.g. (S4-CL1 & [Communication Lab 1]), if yes combine them
    let n = courses.length-1;
    for (let i = 0; i < n; i++) {
        if (isVenueInTwoLines(courses[i+1])) {
            // combine line 1 and line 2
            courses[i] += ' ' + courses[i+1]; // length of courses[i] became 16 now
            i++;
        }
    }

    // date of monday of week 1
    date = document.querySelector('#start-date').value;

    // year, month of lesson
    year = parseInt(date.slice(0, 4));
    month = parseInt(date.slice(6, 8)) - 1;

    // add event for each course
    addCourse(courses);
    
    init_Cal = false;
    clearCourseInfo();

    try {
        let file_name = `ntu_${year}_`;
        if (7 <= month <= 9) file_name += 'sem_1.ics';
        else file_name += 'sem_2.ics';

        icalendar.download(file_name);
    }
    catch(err) {
        return false;
    }
    
    return true;
}

// for each course, add event
function addCourse(courses) {
    course_loop:
    for (let i = 0; i < courses.length; i++) {
        let course = courses[i].split('\t');

        if (course.length == 2) continue course_loop; // to skip the 2nd line venue if the venue has been split into 2 lines

        // remove HEADINGS if it is included
        for (let j = 0; j < HEADINGS.length; j++) {
            if (course[0] == HEADINGS[j]) {
                continue course_loop;
            }
        }
        
        // set course info
        setCourseInfo(course);

        if (courseInfo['Status'] == 'REGISTERED') {
            newEvent(course);
        }
    }
}

// add event
function newEvent(course) {
    // change day to first lesson
    day = parseInt(date.slice(8, 10));
    changeDay(0);
    
    // loop to add subsequent weeks
    for (let i = 0; i < 14; i++) {
        // check if this week is a teaching week
        if (!teachingWeekCheck(teachingWeeks(course), i)) {
            // increment day by 7 days if not teaching week
            changeDay(7);
            continue;
        }

        // initialise icalendar
        if (init_Cal == false) {
            icalendar = new ICalendar({
                // Course: Title
                title: getTitle(),
                // Venue
                location: getLocation(),
                // Class_Type [Group]
                description: getDescription(),
                start: getDate('start'),
                end: getDate('end')
            })
            icalendar.addProperty('CATEGORIES', 'CLASS');

            init_Cal = true;
        }
        else {
            const secondEvent = new ICalendar({
                title: getTitle(),
                location: getLocation(),
                description: getDescription(),
                start: getDate('start'),
                end: getDate('end')
            })
            secondEvent.addProperty('CATEGORIES', 'CLASS');
            icalendar.addEvent(secondEvent);
        }

        // increment day by 7 days
        changeDay(7);
    }
}

// set course info
function setCourseInfo(course) {
    if (course.length == 15) {
        courseInfo['Course'] = course[0];
        courseInfo['Title'] = course[1];
        courseInfo['AU'] = course[2];
        courseInfo['Course_Type'] = course[3];
        courseInfo['Course_Group'] = course[4];
        courseInfo['S/U_Grade_Option'] = course[5];
        courseInfo['Index_Number'] = course[6];
        courseInfo['Status'] = course[7];
        courseInfo['Choice'] = course[8];
        courseInfo['Class_Type'] = course[9];
        courseInfo['Group'] = course[10];
        courseInfo['Day'] = course[11];
        courseInfo['Time'] = course[12];
        courseInfo['Venue'] = course[13];
        courseInfo['Remark'] = course[14];
    }
    // course with 2nd class type
    else if (course.length == 6) {
        courseInfo['Class_Type'] = course[0];
        courseInfo['Group'] = course[1];
        courseInfo['Day'] = course[2];
        courseInfo['Time'] = course[3];
        courseInfo['Venue'] = course[4];
        courseInfo['Remark'] = course[5];
    }
}

// clear course info
function clearCourseInfo() {
    for (const [key, value] of Object.entries(courseInfo)) {
        courseInfo[key] = '';
    }
}

// Course: Title
function getTitle() {
    return `${courseInfo['Course']}: ${courseInfo['Title']}`;
}

// Venue
function isVenueInTwoLines(line2) {
    let firstText = line2.split('\t')[0];

    if (firstText[0] === '[' && firstText[firstText.length-1] === ']') return true;
    else return false;
}
function getLocation() {
    return `${courseInfo['Venue']}`;
}

// Class_Type [Group]
function getDescription() {
    let description = '';

    for (const [key, value] of Object.entries(courseInfo)) {
        description += `${key}: ${value}\n`;
    }

    return description;
}

// start / end
function getDate(s_or_e) {
    // get time duration
    let time = courseInfo['Time'].split('-');

    if (s_or_e == 'start') {
        return (new Date(year, month, day, Math.floor(time[0] / 100), time[0] % 100));
    }
    else if (s_or_e == 'end') {
        return (new Date(year, month, day, Math.floor(time[1] / 100), time[1] % 100));
    }
}

// get day
function changeDay(increment) {
    // increment day by 7 days
    if (increment == 7) {
        day = parseInt(day) + 7;
        return;
    }

    // change the day (MON-FRI)
    day += DAYS[courseInfo['Day']];
}

// teaching week (return array of weeks in int)
function teachingWeeks() {
    // array to store all the teaching weeks
    let weeks = [];

    let remarks = courseInfo['Remark'];
    remarks = remarks.replace('Teaching Wk', '');

    // check if the sign used is - or ,
    // remarks == '1-13' or '2,4,6,...,12'
    if (remarks[1] == '-') {
        // range of weeks
        remarks = remarks.split('-');

        // remarks == ['1', '13']
        for (let i = parseInt(remarks[0]); i <= parseInt(remarks[1]); i++) {
            weeks.push(parseInt(i));
        }
    }
    else if (remarks[1] == ',') {
        // specific weeks
        remarks = remarks.split(',');

        // remarks == ['2','4',...,'12']
        for (let i = 0; i < remarks.length; i++) {
            weeks.push(parseInt(remarks[i]));
        }
    }
    // for a single week
    else if (remarks.length == 1) {
        weeks.push(parseInt(remarks[0]));
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