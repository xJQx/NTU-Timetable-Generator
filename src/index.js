import "./index.css";
import { createICS } from './ICal.js';

const startDateInput = document.querySelector('#start-date');
const generateButton = document.querySelector('#generate');
const textarea = document.querySelector('#textarea');

// when generate timetable button is clicked
generateButton.onclick = () => {
    let textareaData = textarea.value;
    
    // return ics styled data
    createICS(textareaData);
}