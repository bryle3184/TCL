const assetList = document.getElementById('assetList');
const platformFilter = document.getElementById('platformFilter');
const statusFilter = document.getElementById('statusFilter');
const searchInput = document.getElementById('searchInput');

let creativeTasks = [
  { id: 1, campaign: "Valentine Banner", platform: "Shopee", status: "Pending" },
  { id: 2, campaign: "Flash Sale Thumbnail", platform: "Lazada", status: "In Design" },
  { id: 3, campaign: "TikTok Promo Visual", platform: "TikTok", status: "Done" },
  { id: 4, campaign: "Summer Banner", platform: "Shopee", status: "For Approval" },
];

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
      card.dataset.id = item.id;

      const statusOptions = ['Pending', 'In Design', 'For Approval', 'Done']
        .map(option => `<option value="${option}" ${option === item.status ? 'selected' : ''}>${option}</option>`)
        .join('');

      card.innerHTML = `
        <h3>${item.campaign}</h3>
        <p><strong>Platform:</strong> ${item.platform}</p>
        <select class="status-select">
          ${statusOptions}
        </select>
        <button class="done-btn" style="display: ${item.status === 'Done' ? 'block' : 'none'};">Done</button>
        <div class="actions">
          <button>Download</button>
          <button>Edit</button>
        </div>
      `;

      const statusSelect = card.querySelector('.status-select');
      const doneBtn = card.querySelector('.done-btn');

      statusSelect.addEventListener('change', (e) => {
        item.status = e.target.value;
        doneBtn.style.display = item.status === 'Done' ? 'block' : 'none';
      });

      doneBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to remove this completed task?')) {
          creativeTasks = creativeTasks.filter(t => t.id !== item.id);
          displayAssets();
        }
      });

      assetList.appendChild(card);
    });
}

platformFilter.addEventListener('change', displayAssets);
statusFilter.addEventListener('change', displayAssets);
searchInput.addEventListener('input', displayAssets);

displayAssets();
