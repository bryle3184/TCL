const campaigns = [];

function renderCampaigns() {
  const tbody = document.getElementById("campaignBody");
  tbody.innerHTML = "";

  campaigns.forEach((campaign, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${campaign.name}</td>
      <td>${campaign.date}</td>
      <td>₱${campaign.budget}</td>
      <td><a href="${campaign.link}" target="_blank">${campaign.link ? "View" : "-"}</a></td>
      <td>${campaign.notes}</td>
      <td>
        <button class="action-btn" onclick="deleteCampaign(${index})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function addCampaign() {
  const name = document.getElementById("campaignName").value.trim();
  const date = document.getElementById("executionDate").value;
  const budget = document.getElementById("budget").value.trim();
  const link = document.getElementById("link").value.trim();
  const notes = document.getElementById("notes").value.trim();

  if (!name || !date || !budget) {
    alert("Please fill in the campaign name, date, and budget.");
    return;
  }

  campaigns.push({ name, date, budget, link, notes });
  renderCampaigns();

  document.getElementById("campaignName").value = "";
  document.getElementById("executionDate").value = "";
  document.getElementById("budget").value = "";
  document.getElementById("link").value = "";
  document.getElementById("notes").value = "";
}

function deleteCampaign(index) {
  if (confirm("Are you sure you want to delete this campaign?")) {
    campaigns.splice(index, 1);
    renderCampaigns();
  }
}

renderCampaigns();

const contentEvents = [];


function addContentRow() {
  const tbody = document.getElementById("contentBody");
  const row = document.createElement("tr");

  const id = `content-${Date.now()}`;

  row.innerHTML = `
    <td><input type="date" id="${id}-date"></td>
    <td>
      <select id="${id}-account">
        <option>TCL</option>
        <option>iFFalcon</option>
      </select>
    </td>
    <td>
      <select id="${id}-platform">
        <option>TikTok</option>
        <option>Shopee</option>
        <option>Lazada</option>
      </select>
    </td>
    <td><input type="text" id="${id}-event" placeholder="Event"></td>
    <td><input type="text"></td>
    <td><input type="text"></td>
    <td><input type="text"></td>
    <td><textarea></textarea></td>
    <td><input type="text"></td>
    <td>
  <input type="file" accept="image/*" id="${id}-file">
</td>
<td>
  <a href="#" onclick="showImagePreview('${id}'); return false;">View</a>
</td>

    <td><input type="file"></td>
    <td><input type="text"></td>
    <td><input type="text"></td>
    <td>
      <select id="${id}-status">
        <option>Pending</option>
        <option>In Review</option>
        <option>Scheduled</option>
        <option>Posted</option>
      </select>
      <button class="action-btn" id="${id}-doneBtn" style="display:none;">Done</button>
    </td>
  `;

  tbody.appendChild(row);

  setTimeout(() => {
    const dateInput = document.getElementById(`${id}-date`);
    const eventInput = document.getElementById(`${id}-event`);
    const platformInput = document.getElementById(`${id}-platform`);
    const accountInput = document.getElementById(`${id}-account`);
    const statusSelect = document.getElementById(`${id}-status`);
    const doneBtn = document.getElementById(`${id}-doneBtn`);

    function update() {
      updateCalendarEvent({
        id,
        date: dateInput.value,
        title: eventInput.value,
        platform: platformInput.value,
        account: accountInput.value
      });

      // Toggle Done button visibility based on status
      if (statusSelect.value === "Posted") {
        doneBtn.style.display = "inline-block";
      } else {
        doneBtn.style.display = "none";
      }
    }

    // Event listeners
    dateInput.addEventListener("change", update);
    eventInput.addEventListener("input", update);
    platformInput.addEventListener("change", update);
    accountInput.addEventListener("change", update);
    statusSelect.addEventListener("change", update);

    // "Done" button handler
    doneBtn.addEventListener("click", () => {
      // Remove from contentEvents
      const index = contentEvents.findIndex(e => e.id === id);
      if (index !== -1) {
        contentEvents.splice(index, 1);
        renderCalendar();
      }
      // Remove row from table
      row.remove();
    });
  }, 0);
}


function updateCalendarEvent({ id, date, title, platform, account }) {
  if (!id || !date || !title || !platform || !account) return;

  const existingIndex = contentEvents.findIndex(e => e.id === id);
  const newEvent = { id, date, title, platform, account };

  if (existingIndex !== -1) {
    contentEvents[existingIndex] = newEvent;
  } else {
    contentEvents.push(newEvent);
  }

  renderCalendar();
}
function renderCalendar() {
  const calendar = document.getElementById("calendar");
  const monthSelect = document.getElementById("calendarMonth");
  const yearSelect = document.getElementById("calendarYear");

  const selectedMonth = parseInt(monthSelect.value);
  const selectedYear = parseInt(yearSelect.value);

  calendar.innerHTML = "";

  const firstDay = new Date(selectedYear, selectedMonth, 1);
  const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
  const daysInMonth = lastDay.getDate();

  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    cell.innerHTML = `<strong>${i}</strong>`;

    const eventsToday = contentEvents.filter(e => e.date === dateStr);
    eventsToday.forEach(e => {
      const note = document.createElement("div");
      note.className = `calendar-event ${e.platform.toLowerCase()}`;
      note.textContent = `${e.title} - ${e.account}`;
      cell.appendChild(note);
    });

    calendar.appendChild(cell);
  }
}


function populateYears(start = 2025, range = 10) {
  const yearSelect = document.getElementById("calendarYear");
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < range; i++) {
    const year = start + i;
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    if (year === currentYear) option.selected = true;
    yearSelect.appendChild(option);
  }
}

function initCalendarControls() {
  populateYears();
  document.getElementById("calendarMonth").value = new Date().getMonth();
  document.getElementById("calendarMonth").addEventListener("change", renderCalendar);
  document.getElementById("calendarYear").addEventListener("change", renderCalendar);
  renderCalendar();
}

initCalendarControls();

//hahahahaa
function showImagePreview(id) {
  const fileInput = document.getElementById(`${id}-file`);
  const file = fileInput.files[0];

  if (!file) {
    alert("No image selected.");
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e) {
    const imgWindow = window.open("", "_blank", "width=600,height=600");
    imgWindow.document.write(`
      <html>
        <head><title>Image Preview</title></head>
        <body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;">
          <img src="${e.target.result}" style="max-width:100%; max-height:100%;" />
        </body>
      </html>
    `);
  };

  reader.readAsDataURL(file);
}
