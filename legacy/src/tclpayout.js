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

  filtered.forEach((item, index) => {
    const row = document.createElement("tr");

    const statusClass = mapStatusClass(item.status);
    const linkHtml = item.link ? `<a href="${item.link}" target="_blank">Open</a>` : "-";

    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.campaign}</td>
      <td>${item.date}</td>
      <td>
        <select onchange="updateStatus(${index}, this.value)">
          <option ${item.status === "Ongoing Creation" ? "selected" : ""}>Ongoing Creation</option>
          <option ${item.status === "Waiting for Finance" ? "selected" : ""}>Waiting for Finance</option>
          <option ${item.status === "SO Creation" ? "selected" : ""}>SO Creation</option>
          <option ${item.status === "For Approval" ? "selected" : ""}>For Approval</option>
          <option ${item.status === "Waiting for SI" ? "selected" : ""}>Waiting for SI</option>
          <option ${item.status === "SI Delivered" ? "selected" : ""}>SI Delivered</option>
          <option ${item.status === "Done" ? "selected" : ""}>Done</option>
        </select>
        ${item.status === "Done" ? `<button onclick="deleteCampaign(${index})" style="margin-top: 5px; background: darkred; color: white; border: none; padding: 5px 10px; cursor: pointer;">Delete</button>` : ""}
      </td>
      <td>${linkHtml}</td>
     
    `;

    body.appendChild(row);
  });
}

function updateStatus(index, newStatus) {
  data[index].status = newStatus;
  displayRows(data);
}

function deleteCampaign(index) {
  if (confirm("Are you sure you want to delete this campaign?")) {
    data.splice(index, 1);
    displayRows(data);
  }
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

function addCampaign() {
  const influencer = document.getElementById("influencerInput").value.trim();
  const campaign = document.getElementById("campaignInput").value.trim();
  const link = document.getElementById("linkInput").value.trim();

  if (!influencer || !campaign) {
    alert("Please enter both influencer name and campaign name.");
    return;
  }

  const newCampaign = {
    name: influencer,
    campaign: campaign,
    date: new Date().toISOString().split("T")[0],
    status: "Ongoing Creation",
    link: link || ""
  };

  data.push(newCampaign);
  displayRows(data);

  document.getElementById("influencerInput").value = "";
  document.getElementById("campaignInput").value = "";
  document.getElementById("linkInput").value = "";
}

