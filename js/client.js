const dashboardIcon = document.getElementById('dashboardIcon');
const dashboardPopup = document.getElementById('dashboardPopup');
const editProfileBtn = document.getElementById('editProfileBtn');
const editProfileModal = document.getElementById('editProfileModal');
const userProfileModal = document.getElementById('userProfileModal');
const chatModal = document.getElementById('chatModal');
const postForm = document.getElementById('postForm');
const postedGrid = document.getElementById('postedGrid');
const editPostModal = document.getElementById('editPostModal');
const editPostForm = document.getElementById('editPostForm');

// Modal Utility Functions
function openModal(modal) {
  if (!modal) return;
  modal.style.display = 'flex';
  modal.setAttribute('tabindex', '-1');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('role', 'dialog');
  modal.focus();
}
function closeModal(modal) {
  if (!modal) return;
  modal.style.display = 'none';
}
function setupModalAccessibility(modal) {
  if (!modal) return;
  modal.setAttribute('tabindex', '-1');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('role', 'dialog');
}
// Setup accessibility for all modals on load
[dashboardPopup, editProfileModal, userProfileModal, chatModal, editPostModal].forEach(setupModalAccessibility);
// Dashboard icon toggles popup
if (dashboardIcon) {
  dashboardIcon.addEventListener('click', () => {
    if (dashboardPopup.style.display === 'none' || dashboardPopup.style.display === '') {
      openModal(dashboardPopup);
    } else {
      closeModal(dashboardPopup);
    }
  });
}
if (editProfileBtn) {
  editProfileBtn.addEventListener('click', () => {
    openModal(editProfileModal);
    closeModal(dashboardPopup);
  });
}
window.addEventListener('click', (e) => {
  [dashboardPopup, editProfileModal, userProfileModal, chatModal, editPostModal].forEach((modal) => {
    if (e.target === modal) closeModal(modal);
  });
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    [dashboardPopup, editProfileModal, userProfileModal, chatModal, editPostModal].forEach((modal) => {
      if (modal && modal.style.display === 'flex') closeModal(modal);
    });
  }
});

const postedItems = [
  { id: 1, title: 'Web Design Project', desc: 'Design a responsive website.', type: 'gig', status: 'open', price: 5000, timeframe: '2 weeks', requirements: 'HTML, CSS, JS skills', views: 10, bids: 3 },
  { id: 2, title: 'Therapy Session', desc: 'Vision therapy for clients.', type: 'service', status: 'open', price: 3000, timeframe: '1 session', requirements: 'Certified therapist', views: 5, bids: 2 },
];

const bidders = [
  { gigId: 1, user: { email: 'pwd1@example.com', disability: 'Vision', skills: ['Web Design', 'UI/UX'] } },
  { gigId: 1, user: { email: 'pwd2@example.com', disability: 'Hearing', skills: ['Web Design', 'Content Writing'] } },
  { serviceId: 2, user: { email: 'pwd3@example.com', disability: 'Mobility', skills: ['Therapy Assistance'] } },
];

let postCount = postedItems.length;
let viewCount = postedItems.reduce((sum, item) => sum + item.views, 0);
let bidCount = postedItems.reduce((sum, item) => sum + item.bids, 0);

function renderHistory() {
  document.getElementById('postCount').textContent = postCount;
  document.getElementById('viewCount').textContent = viewCount;
  document.getElementById('bidCount').textContent = bidCount;
}

function renderActivity() {
  const activityList = document.getElementById('activityList');
  activityList.innerHTML = '';
  postedItems.forEach((item) => {
    const relevantBidders = bidders.filter((b) => b.gigId === item.id || b.serviceId === item.id);
    if (relevantBidders.length > 0) {
      const div = document.createElement('div');
      div.className = 'activity-item';
      div.innerHTML = `
        <p><strong>${item.title}</strong> (${item.type})</p>
        <ul>
          ${relevantBidders.map((b) => `
            <li>
              ${b.user.email}
              <button class="view-profile-btn" data-email="${b.user.email}">View Profile</button>
              <button class="chat-btn" data-email="${b.user.email}">Chat</button>
            </li>
          `).join('')}
        </ul>
      `;
      activityList.appendChild(div);
    }
  });

  document.querySelectorAll('.view-profile-btn').forEach((btn) =>
    btn.addEventListener('click', (e) => {
      const email = e.target.dataset.email;
      const bidder = bidders.find((b) => b.user.email === email);
      document.getElementById('userProfileContent').innerHTML = `
        <p><strong>Email:</strong> ${bidder.user.email}</p>
        <p><strong>Disability:</strong> ${bidder.user.disability}</p>
        <p><strong>Skills:</strong> ${bidder.user.skills.join(', ')}</p>
      `;
      userProfileModal.style.display = 'flex';
    })
  );

  document.querySelectorAll('.chat-btn').forEach((btn) =>
    btn.addEventListener('click', () => {
      chatModal.style.display = 'flex';
    })
  );
}

function renderPostedItems() {
  postedGrid.innerHTML = '';
  postedItems.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'gig-card';
    card.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.desc}</p>
      <p><strong>Price:</strong> ${item.price} KES</p>
      <p><strong>Timeframe:</strong> ${item.timeframe}</p>
      <p><strong>Requirements:</strong> ${item.requirements}</p>
      <p><strong>Status:</strong> ${item.status}</p>
      <button class="edit-btn" data-id="${item.id}">Edit</button>
    `;
    postedGrid.appendChild(card);
  });

  document.querySelectorAll('.edit-btn').forEach((btn) =>
    btn.addEventListener('click', (e) => {
      const item = postedItems.find((i) => i.id == e.target.dataset.id);
      document.getElementById('editTitle').value = item.title;
      document.getElementById('editDescription').value = item.desc;
      document.getElementById('editPrice').value = item.price;
      document.getElementById('editTimeframe').value = item.timeframe;
      document.getElementById('editRequirements').value = item.requirements;
      document.querySelector(`input[name="status"][value="${item.status}"]`).checked = true;
      editPostForm.dataset.id = item.id;
      editPostModal.style.display = 'flex';
    })
  );
}

postForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = postForm.querySelector('input[type="text"]').value;
  const desc = postForm.querySelector('textarea').value;
  const type = postForm.querySelector('input[name="type"]:checked').value;
  const files = postForm.querySelector('input[type="file"]').files;

  const newItem = {
    id: postedItems.length + 1,
    title,
    desc,
    type,
    status: 'open',
    price: 0,
    timeframe: 'TBD',
    requirements: 'TBD',
    views: 0,
    bids: 0,
    fileNames: Array.from(files).map((f) => f.name),
  };

  postedItems.push(newItem);
  postCount++;
  postForm.reset();
  renderPostedItems();
  renderHistory();
});

editPostForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = parseInt(editPostForm.dataset.id);
  const item = postedItems.find((i) => i.id === id);
  item.title = document.getElementById('editTitle').value;
  item.desc = document.getElementById('editDescription').value;
  item.price = parseInt(document.getElementById('editPrice').value);
  item.timeframe = document.getElementById('editTimeframe').value;
  item.requirements = document.getElementById('editRequirements').value;
  item.status = document.querySelector('input[name="status"]:checked').value;
  editPostModal.style.display = 'none';
  renderPostedItems();
});

renderHistory();
renderActivity();
renderPostedItems();