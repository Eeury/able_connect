// Path constants
const PATHS = {
  INDEX: '/',
  HOMEPAGE: '/homepage.html',
  CLIENT: '/client.html',
  TUBONGE: '/tubonge.html',
  STATIC: '/static'
};

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
// Load client data into dashboard
function loadClientDataIntoDashboard() {
  const defaultData = {
    name: '',
    email: 'client@example.com',
    phone: '+254712345679',
    clientType: 'gig'
  };
  const clientData = getStoredClientData() || defaultData;
  
  const profileSection = document.getElementById('profileSection');
  if (profileSection) {
    const emailP = profileSection.querySelector('p:nth-of-type(1)');
    const phoneP = profileSection.querySelector('p:nth-of-type(2)');
    const typeP = profileSection.querySelector('p:nth-of-type(3)');
    
    if (emailP) emailP.innerHTML = `<strong>Email:</strong> ${clientData.email}`;
    if (phoneP) phoneP.innerHTML = `<strong>Phone:</strong> ${clientData.phone}`;
    if (typeP) {
      const typeText = clientData.clientType === 'service' ? 'Service' : 'Gig';
      typeP.innerHTML = `<strong>Registration Type:</strong> ${typeText}`;
    }
  }
}

// Dashboard icon toggles popup
if (dashboardIcon) {
  dashboardIcon.addEventListener('click', () => {
    if (dashboardPopup.style.display === 'none' || dashboardPopup.style.display === '') {
      loadClientDataIntoDashboard();
      openModal(dashboardPopup);
    } else {
      closeModal(dashboardPopup);
    }
  });
}
// Load client data into edit profile form
function loadClientDataIntoEditForm() {
  const defaultData = {
    name: '',
    email: 'client@example.com',
    phone: '+254712345679',
    clientType: 'gig'
  };
  const clientData = getStoredClientData() || defaultData;
  
  const nameEl = document.getElementById('editName');
  const emailEl = document.getElementById('editEmail');
  const phoneEl = document.getElementById('editPhone');
  const clientTypeGig = document.getElementById('clientTypeGig');
  const clientTypeService = document.getElementById('clientTypeService');
  
  if (nameEl) nameEl.value = clientData.name || '';
  if (emailEl) emailEl.value = clientData.email || 'client@example.com';
  if (phoneEl) phoneEl.value = clientData.phone || '+254712345679';
  
  // Set radio button based on clientType
  if (clientData.clientType === 'service') {
    if (clientTypeService) clientTypeService.checked = true;
    if (clientTypeGig) clientTypeGig.checked = false;
  } else {
    if (clientTypeGig) clientTypeGig.checked = true;
    if (clientTypeService) clientTypeService.checked = false;
  }
}

if (editProfileBtn) {
  editProfileBtn.addEventListener('click', () => {
    loadClientDataIntoEditForm();
    openModal(editProfileModal);
    closeModal(dashboardPopup);
  });
}

// Logout button
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    // Clear login session
    localStorage.removeItem('isLoggedIn');
    
    // Redirect to index.html
    window.location.href = PATHS.INDEX;
  });
}

// Handle edit profile form submission
const editProfileForm = document.getElementById('editProfileForm');
if (editProfileForm) {
  editProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const clientData = {
      name: document.getElementById('editName').value,
      email: document.getElementById('editEmail').value,
      phone: document.getElementById('editPhone').value,
      clientType: document.querySelector('input[name="clientType"]:checked')?.value || 'gig',
      updatedAt: new Date().toISOString()
    };
    
    const submitBtn = editProfileForm.querySelector('button[type="submit"]');
    setFormButtonLoading(submitBtn, true);
    
    const storedUser = getStoredClientData() || {};
    const userId = storedUser.id;
    
    if (window.ableConnectAPI && window.ableConnectAPI.auth && userId) {
      try {
        await window.ableConnectAPI.auth.updateProfile(userId, {
          phone: clientData.phone,
          client_type: clientData.clientType,
        });
      } catch (error) {
        console.error('Unable to update profile via API:', error);
        if (window.showErrorAlert) {
          showErrorAlert(error.message || 'Failed to update profile. Please try again.');
        } else {
          alert(error.message || 'Failed to update profile. Please try again.');
        }
        setFormButtonLoading(submitBtn, false);
        return;
      }
    }
    
    cacheClientData({
      id: userId || Date.now(),
      username: clientData.name || storedUser.name || clientData.email,
      email: clientData.email,
      phone: clientData.phone,
      client_type: clientData.clientType,
    });
    
    // Update dashboard display
    const profileSection = document.getElementById('profileSection');
    if (profileSection) {
      const emailP = profileSection.querySelector('p:nth-of-type(1)');
      const phoneP = profileSection.querySelector('p:nth-of-type(2)');
      if (emailP) emailP.innerHTML = `<strong>Email:</strong> ${clientData.email}`;
      if (phoneP) phoneP.innerHTML = `<strong>Phone:</strong> ${clientData.phone}`;
    }
    
    if (window.showSuccessAlert) {
      showSuccessAlert('Profile updated successfully!');
    } else {
      alert('Profile updated successfully!');
    }
    closeModal(editProfileModal);
    
    // Update chat system with new user data
    const allUsers = JSON.parse(localStorage.getItem('allUsers')) || {};
    if (clientData.email) {
      allUsers[clientData.email] = {
        name: clientData.name,
        type: 'client'
      };
      localStorage.setItem('allUsers', JSON.stringify(allUsers));
    }
    
    setFormButtonLoading(submitBtn, false);
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

const samplePostedItems = [
  { id: 1, title: 'Web Design Project', desc: 'Design a responsive website.', type: 'gig', status: 'open', price: 5000, timeframe: '2 weeks', requirements: 'HTML, CSS, JS skills', views: 10, bids: 3 },
  { id: 2, title: 'Therapy Session', desc: 'Vision therapy for clients.', type: 'service', status: 'open', price: 3000, timeframe: '1 session', requirements: 'Certified therapist', views: 5, bids: 2 },
];

let postedItems = [...samplePostedItems];
let contentSyncedFromAPI = false;

function cacheClientData(user) {
  if (!user) return null;
  const clientData = {
    id: user.id,
    name: user.username || user.email,
    email: user.email,
    phone: user.phone || '+254712345679',
    clientType: user.client_type || 'gig',
  };
  localStorage.setItem('clientData', JSON.stringify(clientData));
  localStorage.setItem('userData', JSON.stringify(clientData));
  localStorage.setItem('isLoggedIn', 'true');
  return clientData;
}

function getStoredClientData() {
  return JSON.parse(localStorage.getItem('clientData') || 'null');
}

function isUserLoggedIn() {
  return localStorage.getItem('isLoggedIn') === 'true';
}

function setFormButtonLoading(button, isLoading, defaultLabel = 'Submit') {
  if (!button) return;
  if (isLoading) {
    if (!button.dataset.originalText) {
      button.dataset.originalText = button.textContent || defaultLabel;
    }
    button.disabled = true;
    button.textContent = 'Saving...';
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || defaultLabel;
    delete button.dataset.originalText;
  }
}

async function syncClientUserWithBackend() {
  if (!(window.ableConnectAPI && window.ableConnectAPI.auth)) {
    return getStoredClientData();
  }
  try {
    const user = await window.ableConnectAPI.auth.getCurrentUser();
    if (user && user.id) {
      return cacheClientData(user);
    }
  } catch (error) {
    console.debug('Unable to sync client via API', error);
  }
  return getStoredClientData();
}

async function ensureClientSession() {
  const user = await syncClientUserWithBackend();
  if (!isUserLoggedIn()) {
    if (window.showWarningAlert) {
      showWarningAlert('Please login to access the client dashboard');
    } else {
      alert('Please login to access the client dashboard');
    }
    window.location.href = PATHS.INDEX;
    return null;
  }
  return user || getStoredClientData();
}

async function fetchClientContent() {
  const currentUser = await getCurrentUser();
  if (!(window.ableConnectAPI && window.ableConnectAPI.gigs && window.ableConnectAPI.services && currentUser && currentUser.id)) {
    postedItems = [...samplePostedItems];
    contentSyncedFromAPI = false;
    return;
  }
  
  try {
    const [gigs, services] = await Promise.all([
      window.ableConnectAPI.gigs.getGigs(),
      window.ableConnectAPI.services.getServices(),
    ]);
    
    const filteredGigs = gigs
      .filter(gig => gig.client && gig.client.id === currentUser.id)
      .map(gig => ({
        id: gig.id,
        title: gig.title,
        description: gig.description,
        amount: gig.price,
        timeframe: gig.timeframe,
        requirements: gig.requirements,
        type: 'gig',
        status: gig.status || 'open',
        views: gig.views || 0,
        bids: gig.bid_count || 0,
        origin: 'api',
      }));
    
    const filteredServices = services
      .filter(service => service.client && service.client.id === currentUser.id)
      .map(service => ({
        id: service.id,
        title: service.title,
        description: service.description,
        amount: service.price,
        timeframe: service.duration,
        requirements: service.requirements,
        type: 'service',
        status: service.status || 'open',
        views: service.views || 0,
        bids: service.booking_count || 0,
        origin: 'api',
      }));
    
    postedItems = [...filteredGigs, ...filteredServices];
    contentSyncedFromAPI = true;
  } catch (error) {
    console.error('Unable to load your gigs/services from the API. Showing sample data instead.', error);
    postedItems = [...samplePostedItems];
    contentSyncedFromAPI = false;
  }
}

const bidders = [
  { gigId: 1, user: { email: 'pwd1@example.com', disability: 'Vision', skills: ['Web Design', 'UI/UX'] } },
  { gigId: 1, user: { email: 'pwd2@example.com', disability: 'Hearing', skills: ['Web Design', 'Content Writing'] } },
  { serviceId: 2, user: { email: 'pwd3@example.com', disability: 'Mobility', skills: ['Therapy Assistance'] } },
];

function getHistoryStats() {
  return postedItems.reduce((stats, item) => {
    stats.posts += 1;
    stats.views += item.views || 0;
    stats.bids += item.bids || 0;
    return stats;
  }, { posts: 0, views: 0, bids: 0 });
}

function renderHistory() {
  const history = getHistoryStats();
  const postCountEl = document.getElementById('postCount');
  const viewCountEl = document.getElementById('viewCount');
  const bidCountEl = document.getElementById('bidCount');
  if (postCountEl) postCountEl.textContent = history.posts;
  if (viewCountEl) viewCountEl.textContent = history.views;
  if (bidCountEl) bidCountEl.textContent = history.bids;
}

function renderActivity() {
  const activityList = document.getElementById('activityList');
  if (!activityList) return;
  
  activityList.innerHTML = '';
  
  if (postedItems.length === 0) {
    activityList.innerHTML = '<div class="activity-item"><p>No activity yet. Post a gig or service to get started.</p></div>';
    return;
  }
  
  if (contentSyncedFromAPI) {
    postedItems.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'activity-item';
      div.innerHTML = `
        <p><strong>${item.title}</strong> (${item.type})</p>
        <p>Status: ${item.status}</p>
        <p>Views: ${item.views || 0}</p>
        <p>${item.type === 'gig' ? 'Bids' : 'Bookings'}: ${item.bids || 0}</p>
      `;
      activityList.appendChild(div);
    });
    return;
  }
  
  // Fallback activity (sample data) when API isn't available
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
    btn.addEventListener('click', (e) => {
      const email = e.target.dataset.email;
      openChatModal(email);
    })
  );
}

function renderPostedItems() {
  if (!postedGrid) return;
  postedGrid.innerHTML = '';
  
  if (postedItems.length === 0) {
    postedGrid.innerHTML = '<div class="gig-card"><p>No posts yet. Use the form above to share a gig or service.</p></div>';
    return;
  }
  
  postedItems.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'gig-card';
    card.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.description || item.desc || ''}</p>
      <p><strong>Amount:</strong> ${item.amount || item.price || 0} KES</p>
      <p><strong>Timeframe:</strong> ${item.timeframe || 'TBD'}</p>
      <p><strong>Type:</strong> ${item.type === 'gig' ? 'Gig' : 'Service'}</p>
      <p><strong>Status:</strong> ${item.status}</p>
      <p><strong>Source:</strong> ${item.origin === 'api' ? 'Synced from backend' : 'Local draft'}</p>
      ${item.fileNames && item.fileNames.length > 0 ? `<p><strong>Files:</strong> ${item.fileNames.join(', ')}</p>` : ''}
      <button class="edit-btn" data-id="${item.id}">Edit</button>
    `;
    postedGrid.appendChild(card);
  });

  document.querySelectorAll('.edit-btn').forEach((btn) =>
    btn.addEventListener('click', (e) => {
      const item = postedItems.find((i) => i.id == e.target.dataset.id);
      if (!item) return;
      document.getElementById('editTitle').value = item.title;
      document.getElementById('editDescription').value = item.description || item.desc || '';
      document.getElementById('editPrice').value = item.amount || item.price || 0;
      document.getElementById('editTimeframe').value = item.timeframe || '';
      document.getElementById('editRequirements').value = item.requirements || '';
      document.querySelector(`input[name="status"][value="${item.status}"]`).checked = true;
      editPostForm.dataset.id = item.id;
      editPostForm.dataset.type = item.type;
      editPostForm.dataset.origin = item.origin || (contentSyncedFromAPI ? 'api' : 'local');
      editPostModal.style.display = 'flex';
    })
  );
}

if (postForm) {
  postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('postTitle').value;
    const description = document.getElementById('postDescription').value;
    const amount = parseFloat(document.getElementById('postAmount').value);
    const timeframe = document.getElementById('postTimeframe').value;
    const type = postForm.querySelector('input[name="type"]:checked').value;
    const fileInput = document.getElementById('postFile');
    const files = fileInput.files;
    const documentFile = files && files.length > 0 ? files[0] : null;
    const submitBtn = postForm.querySelector('button[type="submit"]');
    
    setFormButtonLoading(submitBtn, true, 'Post');
    
    const useApi = !!(window.ableConnectAPI && window.ableConnectAPI.gigs && window.ableConnectAPI.services);
    
    if (useApi) {
      try {
        if (type === 'gig') {
          await window.ableConnectAPI.gigs.createGig({
            title,
            description,
            price: amount,
            timeframe,
            requirements: description,
            document: documentFile || undefined,
          });
        } else {
          await window.ableConnectAPI.services.createService({
            title,
            description,
            price: amount,
            duration: timeframe,
            requirements: description,
            document: documentFile || undefined,
          });
        }
        
        await fetchClientContent();
        postForm.reset();
        renderPostedItems();
        renderHistory();
        renderActivity();
        if (window.showSuccessAlert) {
          showSuccessAlert(`${type === 'gig' ? 'Gig' : 'Service'} posted successfully!`);
        } else {
          alert(`${type === 'gig' ? 'Gig' : 'Service'} posted successfully!`);
        }
      } catch (error) {
        console.error('Unable to submit via API:', error);
        if (window.showErrorAlert) {
          showErrorAlert(error.message || 'Failed to post. Please try again.');
        } else {
          alert(error.message || 'Failed to post. Please try again.');
        }
      } finally {
        setFormButtonLoading(submitBtn, false, 'Post');
      }
      return;
    }
    
    // Fallback to local storage when API is unavailable
    const newId = Date.now();
    const newItem = {
      id: newId,
      title,
      description,
      amount,
      timeframe,
      type,
      status: 'open',
      views: 0,
      bids: 0,
      requirements: description,
      origin: 'local',
      fileNames: Array.from(files).map((f) => f.name),
      createdAt: new Date().toISOString()
    };
  
    postedItems.push(newItem);
    contentSyncedFromAPI = false;
    
    const storedItems = JSON.parse(localStorage.getItem('postedGigsServices')) || [];
    storedItems.push(newItem);
    localStorage.setItem('postedGigsServices', JSON.stringify(storedItems));
    
    postForm.reset();
    renderPostedItems();
    renderHistory();
    renderActivity();
    if (window.showInfoAlert) {
      showInfoAlert(`${type === 'gig' ? 'Gig' : 'Service'} posted locally. It will appear publicly once the backend is available.`);
    } else {
      alert(`${type === 'gig' ? 'Gig' : 'Service'} posted locally. It will appear publicly once the backend is available.`);
    }
    setFormButtonLoading(submitBtn, false, 'Post');
  });
}

if (editPostForm) {
  editPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = parseInt(editPostForm.dataset.id, 10);
    const itemType = editPostForm.dataset.type;
    const origin = editPostForm.dataset.origin || 'local';
    const title = document.getElementById('editTitle').value;
    const description = document.getElementById('editDescription').value;
    const amount = parseFloat(document.getElementById('editPrice').value);
    const timeframe = document.getElementById('editTimeframe').value;
    const requirements = document.getElementById('editRequirements').value;
    const newStatus = document.querySelector('input[name="status"]:checked').value;
    const submitBtn = editPostForm.querySelector('button[type="submit"]');
    
    setFormButtonLoading(submitBtn, true);
    
    if (origin === 'api' && window.ableConnectAPI && id) {
      try {
        if (itemType === 'gig') {
          await window.ableConnectAPI.gigs.updateGig(id, {
            title,
            description,
            price: amount,
            timeframe,
            requirements,
            status: newStatus,
          });
        } else {
          await window.ableConnectAPI.services.updateService(id, {
            title,
            description,
            price: amount,
            duration: timeframe,
            requirements,
            status: newStatus,
          });
        }
        await fetchClientContent();
        if (window.showSuccessAlert) {
          showSuccessAlert(newStatus === 'closed' ? 'Post closed successfully.' : 'Post updated successfully!');
        } else {
          alert(newStatus === 'closed' ? 'Post closed successfully.' : 'Post updated successfully!');
        }
      } catch (error) {
        console.error('Error updating post via API:', error);
        if (window.showErrorAlert) {
          showErrorAlert(error.message || 'Failed to update post. Please try again.');
        } else {
          alert(error.message || 'Failed to update post. Please try again.');
        }
        setFormButtonLoading(submitBtn, false);
        return;
      }
    } else {
      const item = postedItems.find((i) => i.id === id);
      if (item) {
        item.title = title;
        item.description = description;
        item.amount = amount;
        item.timeframe = timeframe;
        item.requirements = requirements;
        item.status = newStatus;
        
        const storedItems = JSON.parse(localStorage.getItem('postedGigsServices')) || [];
        const storedIndex = storedItems.findIndex((i) => i.id === id);
        if (storedIndex !== -1) {
          storedItems[storedIndex] = { ...item };
          localStorage.setItem('postedGigsServices', JSON.stringify(storedItems));
        }
        
        if (window.showInfoAlert) {
          showInfoAlert(newStatus === 'closed' ? 'Post has been closed and will no longer appear on the homepage.' : 'Post updated locally.');
        } else {
          alert(newStatus === 'closed' ? 'Post has been closed and will no longer appear on the homepage.' : 'Post updated locally.');
        }
      }
    }
    
    editPostModal.style.display = 'none';
    renderPostedItems();
    renderHistory();
    renderActivity();
    setFormButtonLoading(submitBtn, false);
  });
}

// Get current user data (only if logged in) - async to support API
async function getCurrentUser() {
  // First check if user has an active login session
  if (!isUserLoggedIn()) {
    return null;
  }
  
  const storedClient = getStoredClientData();
  if (storedClient && (storedClient.id || storedClient.email)) {
    return {
      id: storedClient.id || storedClient.email,
      name: storedClient.name || storedClient.email,
      type: 'client',
    };
  }
  
  const syncedUser = await syncClientUserWithBackend();
  if (syncedUser && (syncedUser.id || syncedUser.email)) {
    return {
      id: syncedUser.id || syncedUser.email,
      name: syncedUser.name || syncedUser.username || syncedUser.email,
      type: 'client',
    };
  }
  
  const fallbackUser = JSON.parse(localStorage.getItem('userData')) || {};
  if (fallbackUser.id || fallbackUser.email) {
    return {
      id: fallbackUser.id || fallbackUser.email,
      name: fallbackUser.username || fallbackUser.name || fallbackUser.email,
      type: fallbackUser.user_type || 'client',
    };
  }
  
  return null;
}

// Handle Tubonge button click with authentication check
async function handleTubongeClick() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    // User is not logged in, redirect to index.html with login prompt
    if (window.showWarningAlert) {
      showWarningAlert('Please login to access Tubonge');
    } else {
      alert('Please login to access Tubonge');
    }
    window.location.href = PATHS.INDEX;
  } else {
    // Store current page as referrer before navigating to tubonge
    localStorage.setItem('tubongeReferrer', window.location.href);
    // User is logged in, redirect to tubonge.html
    window.location.href = PATHS.TUBONGE;
  }
}

// Chat Modal Functions
let currentChatUserId = null;

async function openChatModal(pwdUserEmail) {
  if (!pwdUserEmail) {
    if (window.showWarningAlert) {
      showWarningAlert('No user selected for chat');
    } else {
      alert('No user selected for chat');
    }
    return;
  }
  
  currentChatUserId = pwdUserEmail;
  
  // Ensure both users are registered in allUsers
  const allUsers = JSON.parse(localStorage.getItem('allUsers')) || {};
  const currentUser = await getCurrentUser();
  
  // Register PWD user if not already registered
  if (!allUsers[pwdUserEmail]) {
    // Try to get user info from bidders
    const bidder = bidders.find(b => b.user.email === pwdUserEmail);
    if (bidder) {
      allUsers[pwdUserEmail] = {
        name: bidder.user.email.split('@')[0] || 'PWD User',
        type: 'pwd'
      };
    }
  }
  
  // Register current client user if not already registered
  if (currentUser && !allUsers[currentUser.id]) {
    allUsers[currentUser.id] = {
      name: currentUser.name,
      type: 'client'
    };
  }
  
  localStorage.setItem('allUsers', JSON.stringify(allUsers));
  
  const userName = allUsers[pwdUserEmail]?.name || pwdUserEmail;
  const titleEl = document.getElementById('chatModalTitle');
  if (titleEl) {
    titleEl.textContent = `Chat with ${userName}`;
  }
  
  // Load and display conversation
  await renderChatMessages();
  
  // Clear input
  const input = document.getElementById('chatModalInput');
  if (input) {
    input.value = '';
  }
  
  // Open modal
  openModal(chatModal);
  
  // Focus on input
  setTimeout(() => {
    if (input) input.focus();
  }, 100);
}

function closeChatModal() {
  currentChatUserId = null;
  closeModal(chatModal);
}

async function renderChatMessages() {
  if (!currentChatUserId) return;
  
  const chatContent = document.getElementById('chatContent');
  if (!chatContent) return;
  
  const currentUser = await getCurrentUser();
  
  // Try API first
  if (window.ableConnectAPI && window.ableConnectAPI.messages) {
    try {
      const messages = await window.ableConnectAPI.messages.getMessagesWithUser(currentChatUserId);
      
      if (!messages || messages.length === 0) {
        chatContent.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">No messages yet. Start the conversation!</div>';
        return;
      }
      
      chatContent.innerHTML = '';
      
      messages.forEach(msg => {
        const msgDiv = document.createElement('div');
        const isOutgoing = msg.sender.id === currentUser.id;
        msgDiv.style.cssText = `
          margin: 8px 0;
          padding: 8px 12px;
          border-radius: 8px;
          max-width: 70%;
          word-wrap: break-word;
          ${isOutgoing 
            ? 'background: #00450d; color: white; margin-left: auto; text-align: right;' 
            : 'background: #e0e0e0; color: #333;'}
        `;
        msgDiv.textContent = msg.text;
        chatContent.appendChild(msgDiv);
      });
      
      chatContent.scrollTop = chatContent.scrollHeight;
      return;
    } catch (error) {
      console.error('Error loading messages via API:', error);
      // Fallback to localStorage
    }
  }
  
  // Fallback to localStorage
  const conversations = getChatConversations();
  const conversation = getChatConversation(currentChatUserId);
  
  if (!conversation.messages || conversation.messages.length === 0) {
    chatContent.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">No messages yet. Start the conversation!</div>';
    return;
  }
  
  chatContent.innerHTML = '';
  
  conversation.messages.forEach(msg => {
    const msgDiv = document.createElement('div');
    const isOutgoing = msg.from === currentUser.id;
    msgDiv.style.cssText = `
      margin: 8px 0;
      padding: 8px 12px;
      border-radius: 8px;
      max-width: 70%;
      word-wrap: break-word;
      ${isOutgoing 
        ? 'background: #00450d; color: white; margin-left: auto; text-align: right;' 
        : 'background: #e0e0e0; color: #333;'}
    `;
    msgDiv.textContent = msg.text;
    chatContent.appendChild(msgDiv);
  });
  
  // Scroll to bottom
  chatContent.scrollTop = chatContent.scrollHeight;
}

async function sendChatMessage() {
  if (!currentChatUserId) {
    if (window.showWarningAlert) {
      showWarningAlert('No user selected for chat');
    } else {
      alert('No user selected for chat');
    }
    return;
  }
  
  const input = document.getElementById('chatModalInput');
  if (!input) return;
  
  const text = input.value.trim();
  if (!text) return;
  
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    if (window.showWarningAlert) {
      showWarningAlert('Please login to send messages');
    } else {
      alert('Please login to send messages');
    }
    return;
  }
  
  // Try API first
  if (window.ableConnectAPI && window.ableConnectAPI.messages) {
    try {
      // Get recipient user ID (could be email or numeric ID)
      const recipientId = currentChatUserId;
      await window.ableConnectAPI.messages.sendMessage(recipientId, text);
      
      // Clear input
      input.value = '';
      
      // Re-render messages
      await renderChatMessages();
      return;
    } catch (error) {
      console.error('Error sending message via API:', error);
      // Fallback to localStorage
    }
  }
  
  // Fallback to localStorage
  const conversations = getChatConversations();
  const conversation = getChatConversation(currentChatUserId);
  
  // Create new message
  const newMessage = {
    from: currentUser.id,
    text: text,
    timestamp: Date.now()
  };
  
  // Add message to conversation
  conversation.messages.push(newMessage);
  conversation.lastMessageTime = Date.now();
  
  // If this is a new message from client to PWD, mark as unread for PWD
  if (conversation.unread === undefined) {
    conversation.unread = 1;
  } else {
    conversation.unread += 1;
  }
  
  // Save conversation
  conversations[currentChatUserId] = conversation;
  saveChatConversations(conversations);
  
  // Clear input
  input.value = '';
  
  // Re-render messages
  renderChatMessages();
  
  // Ensure both users are registered in allUsers for chat system
  const allUsers = JSON.parse(localStorage.getItem('allUsers')) || {};
  
  // Register PWD user if not already registered
  if (!allUsers[currentChatUserId]) {
    const bidder = bidders.find(b => b.user.email === currentChatUserId);
    if (bidder) {
      allUsers[currentChatUserId] = {
        name: bidder.user.email.split('@')[0] || 'PWD User',
        type: 'pwd'
      };
    }
  }
  
  // Register current client user if not already registered
  if (!allUsers[currentUser.id]) {
    allUsers[currentUser.id] = {
      name: currentUser.name,
      type: 'client'
    };
  }
  
  localStorage.setItem('allUsers', JSON.stringify(allUsers));
}

// Helper functions for chat (using different names to avoid conflicts with chat.js)
function getChatConversations() {
  return JSON.parse(localStorage.getItem('chatConversations')) || {};
}

function saveChatConversations(conversations) {
  localStorage.setItem('chatConversations', JSON.stringify(conversations));
}

function getChatConversation(userId) {
  const conversations = getChatConversations();
  if (!conversations[userId]) {
    conversations[userId] = {
      messages: [],
      unread: 0,
      lastMessageTime: null
    };
    saveChatConversations(conversations);
  }
  return conversations[userId];
}

// Set up send message button and input handlers
document.addEventListener('DOMContentLoaded', () => {
  const sendBtn = document.getElementById('sendMessageBtn');
  const chatInput = document.getElementById('chatModalInput');
  
  if (sendBtn) {
    sendBtn.addEventListener('click', sendChatMessage);
  }
  
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }
});

// Expose functions to global scope
window.handleTubongeClick = handleTubongeClick;
window.closeChatModal = closeChatModal;

document.addEventListener('DOMContentLoaded', async () => {
  const currentUser = await ensureClientSession();
  if (!currentUser) return;
  await fetchClientContent();
  renderHistory();
  renderActivity();
  renderPostedItems();
});