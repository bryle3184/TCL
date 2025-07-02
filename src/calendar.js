let currentDate = new Date();
const monthYear = document.getElementById('monthYear');
const calendar = document.getElementById('calendar');
const modal = document.getElementById('eventModal');
const eventForm = document.getElementById('eventForm');

let events = {}; // Store events by date key: yyyy-mm-dd

function renderCalendar() {
  calendar.innerHTML = '';
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  monthYear.innerText = currentDate.toLocaleString('default', { month: 'long' }) + " " + year;

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

    if (events[dateKey]) {
      for (let ev of events[dateKey]) {
        const evDiv = document.createElement('div');
        evDiv.className = 'event';
        evDiv.innerText = `${ev.platform}: ${ev.topic}`;
        div.appendChild(evDiv);
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

function openModal(dateKey) {
  modal.style.display = 'block';
  document.getElementById('eventDate').value = dateKey;
}

function closeModal() {
  modal.style.display = 'none';
  eventForm.reset();
}

eventForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const host = document.getElementById('host').value;
  const topic = document.getElementById('topic').value;
  const time = document.getElementById('time').value;
  const platform = document.getElementById('platform').value;
  const date = document.getElementById('eventDate').value;

  if (!events[date]) events[date] = [];
  events[date].push({ host, topic, time, platform });

  closeModal();
  renderCalendar();
});

renderCalendar();
