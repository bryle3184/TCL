const tickets = [
  {
    customer: "Ana Cruz",
    concern: "Late delivery complaint",
    date: "2025-06-28",
    status: "Open"
  },
  {
    customer: "Mark Santos",
    concern: "Wrong item received",
    date: "2025-06-27",
    status: "In Progress"
  },
  {
    customer: "Luis Tan",
    concern: "Warranty request",
    date: "2025-06-25",
    status: "Resolved"
  },
  {
    customer: "Jenny Lee",
    concern: "Product not working",
    date: "2025-06-26",
    status: "In Progress"
  },
  {
    customer: "Marco Reyes",
    concern: "Missing accessory",
    date: "2025-06-29",
    status: "Open"
  }
];

function mapStatusClass(status) {
  return {
    "Open": "Open",
    "In Progress": "InProgress",
    "Resolved": "Resolved"
  }[status] || "";
}

function updateSummary(filtered) {
  const total = filtered.length;
  const open = filtered.filter(t => t.status === "Open").length;
  const inProgress = filtered.filter(t => t.status === "In Progress").length;
  const resolved = filtered.filter(t => t.status === "Resolved").length;

  document.getElementById("totalCount").innerText = total;
  document.getElementById("openCount").innerText = open;
  document.getElementById("progressCount").innerText = inProgress;
  document.getElementById("resolvedCount").innerText = resolved;
}

function displayRows(filtered = tickets) {
  const body = document.getElementById("csrBody");
  body.innerHTML = "";

  filtered.forEach(ticket => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${ticket.customer}</td>
      <td>${ticket.concern}</td>
      <td>${ticket.date}</td>
      <td><span class="status ${mapStatusClass(ticket.status)}">${ticket.status}</span></td>
      <td><a href="#">Detail</a></td>
    `;
    body.appendChild(row);
  });

  updateSummary(filtered);
}

function applyFilters() {
  const status = document.getElementById("statusFilter").value;
  const search = document.getElementById("searchInput").value.toLowerCase();

  const filtered = tickets.filter(t => {
    const matchStatus = (status === "all") || (t.status === status);
    const matchSearch = t.customer.toLowerCase().includes(search) || t.concern.toLowerCase().includes(search);
    return matchStatus && matchSearch;
  });

  displayRows(filtered);
}

// Initial load
displayRows();
