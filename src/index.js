import "./index.css";
import { createICS } from './ICal.js';

const startDateInput = document.querySelector('#start-date');
const generateButton = document.querySelector('#generate');
const textarea = document.querySelector('#textarea');

// when generate timetable button is clicked
generateButton.onclick = () => {
    let textareaData = textarea.value;
    
    // error checking
    if (!checkDateInput()) {;}

    // return ics styled data
    else if (!createICS(textareaData)) {
        alert('Course Info Pasted is not appropriate!');
    }
}

// check date input
function checkDateInput() {
    // if no input
    if (startDateInput.value == "") {
        alert('Please Input a Date!');
        return false;
    }

    // check if it is a monday
    else 
    {
        let day_type = new Date(startDateInput.value);
        if (day_type.getDay() != 1) {
            alert('Date must be a Monday!');
            return false;
        }
    }
    return true;
}