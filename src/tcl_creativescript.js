const assetList = document.getElementById('assetList');
const platformFilter = document.getElementById('platformFilter');
const statusFilter = document.getElementById('statusFilter');
const searchInput = document.getElementById('searchInput');

// Sample data (can be replaced with backend data later)
const creativeTasks = [
  { campaign: "Valentine Banner", platform: "Shopee", status: "Pending" },
  { campaign: "Flash Sale Thumbnail", platform: "Lazada", status: "In Design" },
  { campaign: "TikTok Promo Visual", platform: "TikTok", status: "Done" },
  { campaign: "Summer Banner", platform: "Shopee", status: "For Approval" },
];

// Display cards
function displayAssets() {
  assetList.innerHTML = '';

  const platformVal = platformFilter.value;
  const statusVal = statusFilter.value;
  const searchVal = searchInput.value.toLowerCase();

  creativeTasks
    .filter(item => 
      (platformVal === "all" || item.platform === platformVal) &&
      (statusVal === "all" || item.status === statusVal) &&
      (item.campaign.toLowerCase().includes(searchVal))
    )
    .forEach(item => {
      const card = document.createElement('div');
      card.className = 'asset-card';
      card.innerHTML = `
        <h3>${item.campaign}</h3>
        <p><strong>Platform:</strong> ${item.platform}</p>
        <p class="status ${item.status.replace(' ', '')}">${item.status}</p>
        <div class="actions">
          <button>Download</button>
          <button>Edit</button>
        </div>
      `;
      assetList.appendChild(card);
    });
}

// Event Listeners
platformFilter.addEventListener('change', displayAssets);
statusFilter.addEventListener('change', displayAssets);
searchInput.addEventListener('input', displayAssets);

// Initial display
displayAssets();
