let currentDate = new Date();
const monthYear = document.getElementById('monthYear');
const calendar = document.getElementById('calendar');
const modal = document.getElementById('eventModal');
const eventForm = document.getElementById('eventForm');

let events = {}; // Store livestream events
let leaves = {}; // Store leave requests

async function renderCalendar() {
  const res = await fetch('/api/get_calendar')
  const data = await res.json()

  if(data.length != 0){
    events = data[0].date[0][0]
  }

  calendar.innerHTML = '';
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  monthYear.innerText = currentDate.toLocaleString('default', { month: 'long' }) + " " + year;

// FOR BIRTHDAY
const birthdays = [
  { name: "Juan Dela Cruz", month: 8, day: 15 },
  { name: "Marie Vlogger", month: 8, day: 7 },
  { name: "Tech Guru", month: 9, day: 3 }
];



  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let d of dayNames) {
    const div = document.createElement('div');
    div.className = 'day';
    div.innerText = d;
    calendar.appendChild(div);
  }

  for (let i = 0; i < firstDay; i++) {
    calendar.appendChild(document.createElement('div'));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${month + 1}-${day}`;
    const div = document.createElement('div');
    div.innerText = day;

        // Show birthdays
    birthdays.forEach(bd => {
      if (bd.month === (month + 1) && bd.day === day) {
        const birthdayDiv = document.createElement('div');
        birthdayDiv.className = 'event';
        birthdayDiv.style.backgroundColor = 'red';
        birthdayDiv.innerText = `🎉 Happy Birthday, ${bd.name}!`;
        div.appendChild(birthdayDiv);
      }
    });


    // Show livestream events
    if (events[dateKey]) {
      for (let ev of events[dateKey]) {
        const evDiv = document.createElement('div');
        evDiv.className = 'event';
        evDiv.innerText = `${ev.platform}: ${ev.topic}`;
        evDiv.dataset.dateKey = dateKey;
        evDiv.dataset.eventIndex = events[dateKey].indexOf(ev);
        evDiv.addEventListener('click', (e) => {
          e.stopPropagation();
          openModal(dateKey, events[dateKey].indexOf(ev));
        });
        div.appendChild(evDiv);
      }
    }

    // Show leave requests
    if (leaves[dateKey]) {
for (let lv of leaves[dateKey]) {
const leaveDiv = document.createElement('div');
leaveDiv.className = 'event';
leaveDiv.style.backgroundColor = '#e67e22'; // Orange
leaveDiv.innerText = `Leave: ${lv.employee}`;
div.appendChild(leaveDiv);
}
}


    div.addEventListener('click', () => openModal(dateKey));
    calendar.appendChild(div);
  }
}

function prevMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
}

function openModal(dateKey, eventIndex = null) {
  modal.style.display = 'block';
  document.getElementById('eventDate').value = dateKey;
  document.getElementById('leaveDate').value = dateKey;
  modal.dataset.eventIndex = eventIndex;

  showLivestreamForm();

  if (eventIndex !== null) {
    const event = events[dateKey][eventIndex];
    document.getElementById('host').value = event.host;
    document.getElementById('topic').value = event.topic;
    document.getElementById('time').value = event.time;
    document.getElementById('platform').value = event.platform;
  } else {
    eventForm.reset();
  }
}

function closeModal() {
  modal.style.display = 'none';
  eventForm.reset();
  document.getElementById('leaveRequestForm').reset();
}

// Switch form functions
function showLeaveForm() {
  document.getElementById("livestreamForm").style.display = "none";
  document.getElementById("leaveForm").style.display = "block";
}

function showLivestreamForm() {
  document.getElementById("leaveForm").style.display = "none";
  document.getElementById("livestreamForm").style.display = "block";
}

// Handle livestream form submission
eventForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const host = document.getElementById('host').value;
  const topic = document.getElementById('topic').value;
  const time = document.getElementById('time').value;
  const platform = document.getElementById('platform').value;
  const date = document.getElementById('eventDate').value;
  const eventIndex = modal.dataset.eventIndex;

  if (!events[date]) events[date] = [];

  if (eventIndex !== "null" && eventIndex !== undefined) {
    events[date][eventIndex] = { host, topic, time, platform };
  } else {
    events[date].push({ host, topic, time, platform });
  }

  console.log(events)

  closeModal();
  renderCalendar();

  data = {
    date: events
  }

  jsonData = JSON.stringify(data)

  xhr = new XMLHttpRequest()
  xhr.open("POST", "/api/live_calendar", true)
  xhr.setRequestHeader("Content-type", "application/json")
  xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200){
          console.log('Data Sent Successfully')
      }
  }

  xhr.send(jsonData)
});



// Handle leave form submission
document.getElementById('leaveRequestForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const employeeName = document.getElementById('employeeName').value;
  const reason = document.getElementById('reason').value;
  const date = document.getElementById('leaveDate').value;

  if (!leaves[date]) leaves[date] = [];
leaves[date].push({ employee: employeeName, reason });


  closeModal();
  renderCalendar();
});

renderCalendar();
