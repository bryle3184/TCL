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

function addConcern() {
  const customer = document.getElementById("customerInput").value.trim();
  const concernSelect = document.getElementById("concernInput");
  const concernValue = concernSelect.value;
  const otherValue = document.getElementById("otherConcernInput").value.trim();
  const chatLink = document.getElementById("chatLinkInput").value.trim();

  let concern = concernValue === "others" ? otherValue : concernValue;

  if (!customer || !concern || !chatLink) {
    alert("Please complete all fields including the chat link.");
    return;
  }

  const newTicket = {
    customer: customer,
    concern: concern,
    date: new Date().toISOString().split("T")[0],
    status: "Open",
    chatLink: chatLink
  };

  tickets.push(newTicket);
  displayRows(tickets);

  // Clear inputs
  document.getElementById("customerInput").value = "";
  concernSelect.value = "";
  document.getElementById("otherConcernInput").value = "";
  document.getElementById("otherConcernInput").style.display = "none";
  document.getElementById("chatLinkInput").value = "";
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



function addConcern() {
  const customer = document.getElementById("customerInput").value.trim();
  const concernSelect = document.getElementById("concernInput");
  const concernValue = concernSelect.value;
  const otherValue = document.getElementById("otherConcernInput").value.trim();

  let concern = concernValue === "others" ? otherValue : concernValue;

  if (!customer || !concern) {
    alert("Please enter both customer name and concern.");
    return;
  }

  const newTicket = {
    customer: customer,
    concern: concern,
    date: new Date().toISOString().split("T")[0],
    status: "Open"
  };

  tickets.push(newTicket);
  displayRows(tickets);

  // Clear inputs
  document.getElementById("customerInput").value = "";
  concernSelect.value = "";
  document.getElementById("otherConcernInput").value = "";
  document.getElementById("otherConcernInput").style.display = "none";
}


function toggleOtherInput() {
  const concernSelect = document.getElementById("concernInput");
  const otherInput = document.getElementById("otherConcernInput");
  
  if (concernSelect.value === "others") {
    otherInput.style.display = "inline-block";
  } else {
    otherInput.style.display = "none";
  }
}


function updateStatus(index, newStatus) {
  tickets[index].status = newStatus;
  displayRows(tickets); // Refresh UI
}

function removeTicket(index) {
  tickets.splice(index, 1);
  displayRows(tickets);
}
