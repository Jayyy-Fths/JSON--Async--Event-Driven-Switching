// main.js - FINAL VERSION with Button Switching, Sorting, and A-G Filter

const statusBox = document.getElementById("status-message");
const scheduleContainer = document.getElementById("schedule-container");
const scheduleButtonContainer = document.getElementById("schedule-buttons"); 
const sortMenu = document.getElementById("sort-select");
const dayMenu = document.getElementById("day-select");

const defaultFile = "JaydenSchedule.json"; 
let currentScheduleData = []; 
let currentFilterDay = 'All'; 

// A-G Period-to-Block Rotation Map (Based on user-provided schedule)
const DayBlockMap = {
    'A': [1, 2, 3, 5, 6], // Classes that meet on Day A (Periods 1, 2, 3, 5, 6)
    'B': [4, 1, 2, 7, 6],
    'C': [3, 4, 1, 5, 7],
    'D': [2, 3, 4, 5, 6],
    'E': [1, 2, 3, 7, 5],
    'F': [4, 1, 2, 6, 7],
    'G': [3, 4, 7, 5, 6]
};

// --- Initialization ---
window.addEventListener("DOMContentLoaded", () => {
    // Manually set the initial active button style
    const defaultButton = document.querySelector(`.schedule-btn[data-file="${defaultFile}"]`);
    if (defaultButton) {
        setActiveButton(defaultButton);
    }
    loadSchedule(defaultFile);
});

// --- Event Listeners ---
// Schedule Switching (Button Click)
scheduleButtonContainer.addEventListener("click", (e) => {
    const clickedButton = e.target.closest('.schedule-btn');
    if (clickedButton) {
        const fileName = clickedButton.getAttribute('data-file');
        
        setActiveButton(clickedButton);
        
        // Reset day filter to 'All' when switching students
        dayMenu.value = 'All';
        currentFilterDay = 'All'; 
        
        loadSchedule(fileName);
    }
});

// Sorting Feature
sortMenu.addEventListener("change", () => {
    filterAndDisplaySchedule(); 
});

// Day Filtering Feature
dayMenu.addEventListener("change", () => {
    currentFilterDay = dayMenu.value; 
    filterAndDisplaySchedule();
});


// --- Helper Function to manage active button styling ---
function setActiveButton(activeButton) {
    document.querySelectorAll('.schedule-btn').forEach(btn => {
        // Remove primary styling and add outline
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline-primary');
    });
    // Set the clicked button to primary styling
    activeButton.classList.add('btn-primary');
    activeButton.classList.remove('btn-outline-primary');
}


// --- Data Loading Function ---
async function loadSchedule(fileName) {
    statusBox.innerHTML = `
        <div class="alert alert-info text-center">
            Loading schedule...
        </div>
    `;
    scheduleContainer.innerHTML = ""; 

    try {
        const response = await fetch(`./json/${fileName}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch JSON data for ${fileName}. Status: ${response.status}`);
        }

        currentScheduleData = await response.json(); 
        filterAndDisplaySchedule(); // Filter and display the newly loaded data
        
    } catch (error) {
        console.error(error);
        statusBox.innerHTML = `
            <div class="alert alert-danger text-center">
                Error: Could not load the schedule.<br>
                Check the file path <code>/json/${fileName}</code>.
            </div>
        `;
        currentScheduleData = [];
        scheduleContainer.innerHTML = ""; 
    }
}


// --- Filter, Sort, and Display Master Function ---
function filterAndDisplaySchedule() {
    if (currentScheduleData.length === 0) {
        scheduleContainer.innerHTML = "";
        statusBox.innerHTML = `<div class="alert alert-warning text-center">No schedule data loaded to display.</div>`;
        return;
    }
    
    // 1. FILTER the data based on currentFilterDay
    let filteredData = [];

    if (currentFilterDay === 'All') {
        // Show all classes if not filtering by day
        filteredData = [...currentScheduleData];
    } else {
        // Get the periods that meet on the current day 
        const periodsForDay = DayBlockMap[currentFilterDay];
        
        // Filter the full dataset to include only classes whose 'period' is in the day's block list
        filteredData = currentScheduleData.filter(course => {
            // Ensure course has a period and that period is in the current day's blocks
            return periodsForDay && periodsForDay.includes(course.period);
        });
    }


    // 2. SORT the filtered data
    const criteria = sortMenu.value;
    filteredData.sort((a, b) => {
        const valA = a[criteria];
        const valB = b[criteria];
        
        // Numerical sort for 'period'
        if (criteria === 'period') {
            return valA - valB;
        }

        // String (alphabetical) sort 
        if (typeof valA === 'string' && typeof valB === 'string') {
            return valA.toLowerCase().localeCompare(valB.toLowerCase());
        }
        
        return 0;
    });

    // 3. RENDER the final result
    scheduleContainer.innerHTML = "";
    statusBox.innerHTML = "";

    if (filteredData.length === 0) {
         statusBox.innerHTML = `
            <div class="alert alert-warning text-center">
                No classes found for Day ${currentFilterDay}.
            </div>
        `;
        return;
    }

    filteredData.forEach(course => {
        const cardHTML = `
            <div class="col fade-in">
                <div class="card shadow schedule-card h-100 border-0">
                    <div class="card-body">
                        <h5 class="card-title fw-bold">${course.className}</h5>
                        <p class="card-text">
                            <strong>Period:</strong> ${course.period}<br>
                            <strong>Teacher:</strong> ${course.teacher}<br>
                            <strong>Room:</strong> ${course.roomNumber}<br>
                            <strong>Subject:</strong> ${course.subjectArea}
                        </p>
                    </div>
                </div>
            </div>
        `;
        scheduleContainer.insertAdjacentHTML("beforeend", cardHTML);
    });
}