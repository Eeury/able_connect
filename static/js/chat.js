// Chat functionality for Able Connect

// Get current user data (only if logged in)
function getCurrentUser() {
  // First check if user has an active login session
  if (localStorage.getItem('isLoggedIn') !== 'true') {
    return null;
  }
  
  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const clientData = JSON.parse(localStorage.getItem('clientData')) || {};
  
  // Determine if user is PWD or Client
  if (userData.name && userData.email) {
    return {
      id: userData.email,
      name: userData.name,
      type: 'pwd'
    };
  } else if (clientData.email) {
    return {
      id: clientData.email,
      name: clientData.name || 'Client User',
      type: 'client'
    };
  }
  
  return null;
}

// Get all conversations from localStorage
function getConversations() {
  const conversations = JSON.parse(localStorage.getItem('chatConversations')) || {};
  return conversations;
}

// Save conversations to localStorage
function saveConversations(conversations) {
  localStorage.setItem('chatConversations', JSON.stringify(conversations));
}

// Get or create conversation with a user
function getConversation(userId) {
  const conversations = getConversations();
  if (!conversations[userId]) {
    conversations[userId] = {
      messages: [],
      unread: 0,
      lastMessageTime: null
    };
    saveConversations(conversations);
  }
  return conversations[userId];
}

// Get all users (from userData and clientData)
function getAllUsers() {
  const users = {};
  const currentUser = getCurrentUser();
  
  if (!currentUser) return users;
  
  // Get all stored user data
  const storedUsers = JSON.parse(localStorage.getItem('allUsers')) || {};
  
  // Also check for users in userData and clientData (for backward compatibility)
  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const clientData = JSON.parse(localStorage.getItem('clientData')) || {};
  
  // Add userData if exists and not current user
  if (userData.email && userData.email !== currentUser.id) {
    storedUsers[userData.email] = {
      name: userData.name || 'PWD User',
      type: 'pwd'
    };
  }
  
  // Add clientData if exists and not current user
  if (clientData.email && clientData.email !== currentUser.id) {
    storedUsers[clientData.email] = {
      name: clientData.name || 'Client User',
      type: 'client'
    };
  }
  
  // Add current user's contacts
  Object.keys(storedUsers).forEach(userId => {
    if (userId !== currentUser.id) {
      const user = storedUsers[userId];
      users[userId] = {
        id: userId,
        name: user.name || 'Unknown User',
        type: user.type || 'user'
      };
    }
  });
  
  return users;
}

// Register current user in allUsers
function registerCurrentUser() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  const allUsers = JSON.parse(localStorage.getItem('allUsers')) || {};
  allUsers[currentUser.id] = {
    name: currentUser.name,
    type: currentUser.type
  };
  localStorage.setItem('allUsers', JSON.stringify(allUsers));
}

// Initialize chat
function initChat() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    console.log('No user logged in');
    return;
  }
  
  registerCurrentUser();
  
  const chatToggle = document.getElementById('chatToggle');
  const chatPopup = document.getElementById('chatPopup');
  const userList = document.getElementById('userList');
  const chatView = document.getElementById('chatView');
  const messagesEl = document.getElementById('messages');
  const inputArea = document.getElementById('inputArea');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const backBtn = document.getElementById('backBtn');
  const headerTitle = document.getElementById('headerTitle');
  const chatCloseBtn = document.getElementById('chatCloseBtn');
  
  if (!chatToggle || !chatPopup) return;
  
  let open = false;
  let currentUserId = null;
  
  // Update badge UI for a given user id
  function updateBadge(userId) {
    const badge = document.querySelector(`.badge[data-badge-for="${userId}"]`);
    const conversations = getConversations();
    const count = conversations[userId]?.unread || 0;
    
    if (!badge) return;
    
    badge.textContent = count;
    badge.setAttribute('data-count', count);
    badge.style.display = count > 0 ? 'inline-flex' : 'inline-flex';
    badge.style.opacity = count > 0 ? '1' : '0.45';
  }
  
  // Render user list
  function renderUserList() {
    const users = getAllUsers();
    const conversations = getConversations();
    
    userList.innerHTML = '';
    
    if (Object.keys(users).length === 0) {
      userList.innerHTML = '<div style="padding: 20px; text-align: center; color: #4b6b60;">No contacts yet. Start chatting with other users!</div>';
      return;
    }
    
    // Sort users by last message time
    const sortedUsers = Object.keys(users).sort((a, b) => {
      const timeA = conversations[a]?.lastMessageTime || 0;
      const timeB = conversations[b]?.lastMessageTime || 0;
      return timeB - timeA;
    });
    
    sortedUsers.forEach(userId => {
      const user = users[userId];
      const conversation = conversations[userId] || { messages: [], unread: 0 };
      const lastMessage = conversation.messages && conversation.messages.length > 0
        ? conversation.messages[conversation.messages.length - 1]
        : null;
      
      const preview = lastMessage ? lastMessage.text : 'No messages yet';
      const unreadCount = conversation.unread || 0;
      
      const userEl = document.createElement('div');
      userEl.className = 'user';
      userEl.setAttribute('data-user', user.name);
      userEl.setAttribute('data-id', userId);
      userEl.setAttribute('tabindex', '0');
      
      const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
      
      userEl.innerHTML = `
        <div class="avatar">${initials}</div>
        <div class="meta">
          <span class="name">${user.name}</span>
          <span class="preview">${preview}</span>
        </div>
        <div style="margin-left: 10px">
          <span class="badge" data-badge-for="${userId}" data-count="${unreadCount}">${unreadCount}</span>
        </div>
      `;
      
      userEl.addEventListener('click', () => {
        openConversation(userId);
      });
      
      userEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          userEl.click();
        }
      });
      
      userList.appendChild(userEl);
      updateBadge(userId);
    });
  }
  
  // Toggle popup
  chatToggle.addEventListener('click', () => {
    open = !open;
    chatPopup.style.display = open ? 'flex' : 'none';
    chatPopup.setAttribute('aria-hidden', !open);
    
    if (open) {
      renderUserList();
    } else {
      showListView();
    }
  });

  // Close button
  if (chatCloseBtn) {
    chatCloseBtn.addEventListener('click', () => {
      open = false;
      chatPopup.style.display = 'none';
      chatPopup.setAttribute('aria-hidden', 'true');
      showListView();
    });
  }

  // Close popup when clicking outside
  document.addEventListener('click', (e) => {
    // Only handle if popup is open
    if (!open) return;
    
    // Don't close if clicking inside the popup
    if (chatPopup.contains(e.target)) return;
    
    // Don't close if clicking the chat toggle button
    if (chatToggle.contains(e.target)) return;
    
    // Close the popup
    open = false;
    chatPopup.style.display = 'none';
    chatPopup.setAttribute('aria-hidden', 'true');
    showListView();
  });
  
  // Show inbox list
  function showListView() {
    headerTitle.textContent = 'Messages';
    backBtn.style.display = 'none';
    chatView.style.display = 'none';
    userList.style.display = 'block';
    inputArea.style.display = 'none';
    currentUserId = null;
  }
  
  // Open a conversation
  function openConversation(userId) {
    currentUserId = userId;
    const users = getAllUsers();
    const user = users[userId];
    
    if (!user) {
      console.error('User not found:', userId);
      if (window.showErrorAlert) {
        showErrorAlert('User not found. They may need to sign up first.');
      } else {
        alert('User not found. They may need to sign up first.');
      }
      return;
    }
    
    const conversation = getConversation(userId);
    
    headerTitle.textContent = user.name;
    backBtn.style.display = 'block';
    userList.style.display = 'none';
    chatView.style.display = 'flex';
    inputArea.style.display = 'flex';
    
    renderMessages(conversation.messages);
    
    // Clear unread
    conversation.unread = 0;
    const conversations = getConversations();
    conversations[userId] = conversation;
    saveConversations(conversations);
    updateBadge(userId);
    
    setTimeout(() => chatInput.focus(), 80);
  }
  
  // Expose openConversation for external use
  window.openChatConversation = function(userId) {
    open = true;
    chatPopup.style.display = 'flex';
    chatPopup.setAttribute('aria-hidden', 'false');
    renderUserList();
    // Small delay to ensure user list is rendered
    setTimeout(() => {
      openConversation(userId);
    }, 100);
  };
  
  // Render messages
  function renderMessages(msgs) {
    messagesEl.innerHTML = '';
    
    if (!msgs || msgs.length === 0) {
      messagesEl.innerHTML = '<div style="text-align: center; color: #4b6b60; padding: 20px;">No messages yet. Start the conversation!</div>';
      return;
    }
    
    const currentUser = getCurrentUser();
    
    msgs.forEach(msg => {
      const d = document.createElement('div');
      const isOutgoing = msg.from === currentUser.id;
      d.className = 'msg ' + (isOutgoing ? 'outgoing' : 'incoming');
      d.textContent = msg.text;
      messagesEl.appendChild(d);
    });
    
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  
  // Back button
  backBtn.addEventListener('click', () => {
    showListView();
    renderUserList();
  });
  
  // Send message
  function sendMessage() {
    if (!currentUserId) return;
    
    const text = chatInput.value.trim();
    if (!text) return;
    
    const currentUser = getCurrentUser();
    const conversations = getConversations();
    const conversation = getConversation(currentUserId);
    
    const newMessage = {
      from: currentUser.id,
      text: text,
      timestamp: Date.now()
    };
    
    conversation.messages.push(newMessage);
    conversation.lastMessageTime = Date.now();
    conversations[currentUserId] = conversation;
    saveConversations(conversations);
    
    renderMessages(conversation.messages);
    chatInput.value = '';
    
    // Update user list preview
    renderUserList();
  }
  
  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
  
  // Initialize
  chatPopup.style.display = 'none';
  chatPopup.setAttribute('aria-hidden', 'true');
  showListView();
}

// Initialize chat when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initChat();
});

