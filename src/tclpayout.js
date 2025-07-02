const data = [
  {
    name: "Juan Influencer",
    campaign: "Summer Launch",
    date: "2025-06-15",
    status: "Ongoing Creation"
  },
  {
    name: "Marie Vlogger",
    campaign: "Back to School",
    date: "2025-06-10",
    status: "Waiting for Finance"
  },
  {
    name: "Tech Guru",
    campaign: "Product Demo",
    date: "2025-06-01",
    status: "SI Delivered"
  },
  {
    name: "Lyka Star",
    campaign: "Shopee Mega Sale",
    date: "2025-06-20",
    status: "SO Creation"
  },
  {
    name: "Juan Influencer",
    campaign: "Father's Day Feature",
    date: "2025-06-19",
    status: "For Approval"
  },
  {
    name: "Marie Vlogger",
    campaign: "TikTok Trend",
    date: "2025-06-22",
    status: "Waiting for SI"
  }
];

function mapStatusClass(status) {
  return {
    "Ongoing Creation": "Ongoing",
    "Waiting for Finance": "WaitingFinance",
    "For Approval": "ForApproval",
    "SO Creation": "SOCreation",
    "Waiting for SI": "WaitingSI",
    "SI Delivered": "SIDelivered"
  }[status] || "";
}

function displayRows(filtered = data) {
  const body = document.getElementById("payoutBody");
  body.innerHTML = "";

  filtered.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.campaign}</td>
      <td>${item.date}</td>
      <td><span class="status ${mapStatusClass(item.status)}">${item.status}</span></td>
      <td><a href="#">Detail</a></td>
    `;
    body.appendChild(row);
  });
}

function applyFilters() {
  const name = document.getElementById("nameFilter").value.toLowerCase();
  const campaign = document.getElementById("campaignFilter").value.toLowerCase();
  const date = document.getElementById("dateFilter").value;

  const filtered = data.filter(item => {
    return (
      item.name.toLowerCase().includes(name) &&
      item.campaign.toLowerCase().includes(campaign) &&
      (date === "" || item.date === date)
    );
  });

  displayRows(filtered);
}

// Initial render
displayRows();
