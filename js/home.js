const profileIcon = document.getElementById('profileIcon');
const profilePopup = document.getElementById('profilePopup');
const editProfileBtn = document.getElementById('editProfileBtn');
const viewHistoryBtn = document.getElementById('viewHistoryBtn');
const editModal = document.getElementById('editProfileModal');
const bidModal = document.getElementById('bidModal');
const bookModal = document.getElementById('bookModal');

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
[profilePopup, editModal, bidModal, bookModal].forEach(setupModalAccessibility);
if (profileIcon) {
  profileIcon.addEventListener('click', () => {
    if (profilePopup.style.display === 'none' || profilePopup.style.display === '') {
      openModal(profilePopup);
    } else {
      closeModal(profilePopup);
    }
  });
}
if (editProfileBtn) {
  editProfileBtn.addEventListener('click', () => {
    openModal(editModal);
    closeModal(profilePopup);
  });
}
window.addEventListener('click', (e) => {
  [profilePopup, editModal, bidModal, bookModal].forEach((modal) => {
    if (e.target === modal) closeModal(modal);
  });
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    [profilePopup, editModal, bidModal, bookModal].forEach((modal) => {
      if (modal && modal.style.display === 'flex') closeModal(modal);
    });
  }
});

const gigs = [
  { title: 'Translate Document', desc: 'Translate legal documents from English to Kiswahili.', posted: '2 hours ago', id: 1 },
  { title: 'Transcription Task', desc: 'Transcribe 30 minutes of audio to text.', posted: '5 hours ago', id: 2 },
];

const services = [
  { title: 'Vision Therapy', desc: 'Personalized vision therapy sessions.', posted: '1 day ago', id: 3 },
  { title: 'Mobility Support', desc: 'Mobility assistance and training.', posted: '3 hours ago', id: 4 },
];

let bidHistory = [];
let bookHistory = [];

function renderGigs() {
  const gigsGrid = document.getElementById('gigsGrid');
  gigsGrid.innerHTML = '';
  gigs.forEach((gig) => {
    const card = document.createElement('div');
    card.className = 'gig-card';
    card.innerHTML = `
      <h3>${gig.title}</h3>
      <p>${gig.desc}</p>
      <p><em>${gig.posted}</em></p>
      <button class="bid-btn" data-id="${gig.id}">Bid Now</button>
    `;
    gigsGrid.appendChild(card);
  });

  document.querySelectorAll('.bid-btn').forEach((btn) =>
    btn.addEventListener('click', (e) => {
      selectedGigId = e.target.dataset.id;
      bidModal.style.display = 'flex';
    })
  );
}

function renderServices() {
  const servicesGrid = document.getElementById('servicesGrid');
  servicesGrid.innerHTML = '';
  services.forEach((service) => {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.innerHTML = `
      <h3>${service.title}</h3>
      <p>${service.desc}</p>
      <p><em>${service.posted}</em></p>
      <button class="book-btn" data-id="${service.id}">Book Service</button>
    `;
    servicesGrid.appendChild(card);
  });

  document.querySelectorAll('.book-btn').forEach((btn) =>
    btn.addEventListener('click', (e) => {
      selectedServiceId = e.target.dataset.id;
      bookModal.style.display = 'flex';
    })
  );
}

renderGigs();
renderServices();

let selectedGigId = null;
let selectedServiceId = null;

document.getElementById('submitBidBtn').addEventListener('click', () => {
  const bidAmount = bidModal.querySelector('input[type="number"]').value;
  const proposal = bidModal.querySelector('textarea').value;
  const file = bidModal.querySelector('input[type="file"]').files[0];

  if (!bidAmount || !proposal) {
    alert('Please fill all fields');
    return;
  }

  bidHistory.push({
    gigId: selectedGigId,
    bidAmount,
    proposal,
    fileName: file ? file.name : 'None',
  });

  bidModal.style.display = 'none';
  alert('Bid submitted!');
});

document.getElementById('submitBookBtn').addEventListener('click', () => {
  const proposal = bookModal.querySelector('textarea').value;
  const file = bookModal.querySelector('input[type="file"]').files[0];

  if (!proposal) {
    alert('Please fill the proposal field');
    return;
  }

  bookHistory.push({
    serviceId: selectedServiceId,
    proposal,
    fileName: file ? file.name : 'None',
  });

  bookModal.style.display = 'none';
  alert('Service booked!');
});

viewHistoryBtn.addEventListener('click', () => {
  let historyText = 'Your Submitted Bids and Bookings:\n\n';
  if (bidHistory.length === 0 && bookHistory.length === 0) {
    alert('No bid or booking history found.');
    return;
  }

  bidHistory.forEach((bid, i) => {
    const gig = gigs.find((g) => g.id == bid.gigId);
    historyText += `${i + 1}. Gig: ${gig.title}\nBid: ${bid.bidAmount} KES\nProposal: ${bid.proposal}\nAttachment: ${bid.fileName}\n\n`;
  });

  bookHistory.forEach((booking, i) => {
    const service = services.find((s) => s.id == booking.serviceId);
    historyText += `${i + 1}. Service: ${service.title}\nProposal: ${booking.proposal}\nAttachment: ${booking.fileName}\n\n`;
  });

  alert(historyText);
});

const skillsList = document.querySelector('.skills-list');
const addSkillDropdown = document.getElementById('addSkillDropdown');

addSkillDropdown.addEventListener('change', (e) => {
  const skill = e.target.value;
  if (!skill) return;

  const span = document.createElement('span');
  span.className = 'skill';
  span.innerHTML = `${skill} <button class="remove-skill">x</button>`;
  skillsList.appendChild(span);
  e.target.value = '';

  span.querySelector('.remove-skill').addEventListener('click', () => {
    skillsList.removeChild(span);
  });
});