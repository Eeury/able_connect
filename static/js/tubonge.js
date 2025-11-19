// Tubonge - Social Media Feed for Able Connect

// Path constants
const PATHS = {
  INDEX: '/',
  HOMEPAGE: '/homepage.html',
  CLIENT: '/client.html',
  TUBONGE: '/tubonge.html',
  STATIC: '/static'
};

// Check if user is logged in (has active session)
function isUserLoggedIn() {
  return localStorage.getItem('isLoggedIn') === 'true';
}

// Get current user (only if logged in) - async to support API
async function getCurrentUser() {
  // First check if user has an active login session
  if (!isUserLoggedIn()) {
    return null;
  }
  
  // Try to get from API first
  try {
    if (window.ableConnectAPI && window.ableConnectAPI.auth) {
      const user = await window.ableConnectAPI.auth.getCurrentUser();
      if (user && user.id) {
        localStorage.setItem('userData', JSON.stringify(user));
        return {
          id: user.id,
          name: user.username || user.email,
          type: user.user_type || 'pwd'
        };
      }
    }
  } catch (error) {
    console.log('API not available, using localStorage');
  }
  
  // Fallback to localStorage
  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const clientData = JSON.parse(localStorage.getItem('clientData')) || {};
  
  if (userData.id || userData.email) {
    return {
      id: userData.id || userData.email,
      name: userData.username || userData.name || userData.email,
      type: userData.user_type || 'pwd'
    };
  } else if (clientData.id || clientData.email) {
    return {
      id: clientData.id || clientData.email,
      name: clientData.name || 'Client User',
      type: 'client'
    };
  }
  
  return null;
}

// Get all posts from API or localStorage fallback
async function getPosts() {
  if (window.ableConnectAPI && window.ableConnectAPI.tubonge) {
    try {
      const posts = await window.ableConnectAPI.tubonge.getPosts();
      if (!posts || !Array.isArray(posts)) {
        throw new Error('Invalid posts data');
      }
      
      // Store author information in allUsers
      const allUsers = JSON.parse(localStorage.getItem('allUsers')) || {};
      posts.forEach(post => {
        if (post.author && post.author.id) {
          allUsers[post.author.id] = {
            name: post.author.username || post.author.email,
            type: post.author.user_type || 'pwd',
            id: post.author.id
          };
        }
        // Store users who liked the post
        if (post.likes && Array.isArray(post.likes)) {
          post.likes.forEach(user => {
            if (user && user.id) {
              allUsers[user.id] = {
                name: user.username || user.email,
                type: user.user_type || 'pwd',
                id: user.id
              };
            }
          });
        }
        // Store comment authors
        if (post.comments && Array.isArray(post.comments)) {
          post.comments.forEach(comment => {
            if (comment.author && comment.author.id) {
              allUsers[comment.author.id] = {
                name: comment.author.username || comment.author.email,
                type: comment.author.user_type || 'pwd',
                id: comment.author.id
              };
            }
          });
        }
      });
      localStorage.setItem('allUsers', JSON.stringify(allUsers));
      
      // Transform API response to match expected format
      return posts.map(post => ({
        id: post.id,
        authorId: post.author.id,
        author: post.author, // Keep full author object
        text: post.text || '',
        mediaUrl: post.media_file ? post.media_file : null,
        mediaType: post.media_type,
        link: post.link,
        timestamp: post.created_at,
        likes: post.likes ? post.likes.map(u => u.id || u) : [],
        like_count: post.like_count, // Keep API like_count
        comments: post.comments ? post.comments.map(c => ({
          id: c.id,
          authorId: c.author.id,
          author: c.author, // Keep full author object
          text: c.text,
          timestamp: c.created_at
        })) : [],
        comments_count: post.comments_count // Keep API comments_count
      }));
    } catch (error) {
      // Only log if it's not a connection error (which is expected when server is down)
      if (error.message !== 'API_UNAVAILABLE') {
        console.error('Error fetching posts:', error);
      }
      // Fallback to localStorage
    }
  }
  
  // Fallback to localStorage
  const posts = JSON.parse(localStorage.getItem('tubongePosts')) || [];
  return posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// Save posts to localStorage (for fallback only)
function savePosts(posts) {
  localStorage.setItem('tubongePosts', JSON.stringify(posts));
}

// Initialize page
async function initTubonge() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    // Store the referrer if available, otherwise default to index
    const referrer = document.referrer || PATHS.INDEX;
    localStorage.setItem('tubongeReferrer', referrer);
    
    // Redirect to index.html with login requirement
    if (window.showWarningAlert) {
      showWarningAlert('Please login to access Tubonge');
    } else {
      alert('Please login to access Tubonge');
    }
    window.location.href = PATHS.INDEX;
    return;
  }
  
  // Ensure current user is registered in allUsers
  const allUsers = JSON.parse(localStorage.getItem('allUsers')) || {};
  if (!allUsers[currentUser.id]) {
    allUsers[currentUser.id] = {
      name: currentUser.name,
      type: currentUser.type
    };
    localStorage.setItem('allUsers', JSON.stringify(allUsers));
  }
  
  // Set profile bubble
  const profileBubble = document.getElementById('profileBubble');
  if (profileBubble) {
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    profileBubble.textContent = initials;
  }
  
  await renderPosts();
}

// Get exit URL (last page before tubonge)
function getExitUrl() {
  // Get stored referrer
  const storedReferrer = localStorage.getItem('tubongeReferrer');
  
  if (storedReferrer && storedReferrer !== window.location.href && !storedReferrer.includes('tubonge.html')) {
    // Clean up the stored referrer
    localStorage.removeItem('tubongeReferrer');
    return storedReferrer;
  }
  
  // Default to user's dashboard based on their type
  const currentUser = getCurrentUser();
  if (currentUser) {
    if (currentUser.type === 'pwd') {
      return PATHS.HOMEPAGE;
    } else {
      return PATHS.CLIENT;
    }
  }
  
  return PATHS.INDEX;
}

// Exit Tubonge and return to previous page
function exitTubonge() {
  const exitUrl = getExitUrl();
  window.location.href = exitUrl;
}

// Render all posts
async function renderPosts() {
  const container = document.getElementById('postsContainer');
  if (!container) return;
  
  try {
    const posts = await getPosts();
    
    if (posts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No posts yet. Be the first to share something!</p>
          <p>Click "What's on your mind?" to create your first post.</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = '';
    
    posts.forEach((post, index) => {
      const postEl = createPostElement(post, index);
      container.appendChild(postEl);
    });
  } catch (error) {
    console.error('Error rendering posts:', error);
    container.innerHTML = `
      <div class="empty-state">
        <p>Error loading posts. Please refresh the page.</p>
      </div>
    `;
  }
}

// Create post element
function createPostElement(post, index) {
  const postDiv = document.createElement('div');
  postDiv.className = 'post-card';
  postDiv.id = `post-${index}`;
  
  const currentUser = getCurrentUser();
  const allUsers = getAllUsers();
  
  // Get author name - try multiple sources
  let authorName = 'Unknown User';
  
  // First try to get from post.author object (from API)
  if (post.author && post.author.username) {
    authorName = post.author.username;
  } else if (post.author && post.author.email) {
    authorName = post.author.email;
  } else if (post.authorId) {
    // Try from allUsers by ID
    if (allUsers[post.authorId] && allUsers[post.authorId].name) {
      authorName = allUsers[post.authorId].name;
    } else {
      // Try to get from userData or clientData directly
      const userData = JSON.parse(localStorage.getItem('userData')) || {};
      const clientData = JSON.parse(localStorage.getItem('clientData')) || {};
      const pwdSignupData = JSON.parse(localStorage.getItem('pwdSignupData')) || {};
      
      if (userData.id === post.authorId && userData.username) {
        authorName = userData.username;
      } else if (userData.email === post.authorId && userData.name) {
        authorName = userData.name;
      } else if (pwdSignupData.email === post.authorId && pwdSignupData.name) {
        authorName = pwdSignupData.name;
      } else if (clientData.email === post.authorId && clientData.name) {
        authorName = clientData.name;
      }
    }
  }
  
  const postAuthor = { name: authorName };
  // Check if current user liked the post - handle both array of IDs and array of user objects
  const isLiked = currentUser && post.likes && (
    post.likes.includes(currentUser.id) || 
    (Array.isArray(post.likes) && post.likes.some(u => (typeof u === 'object' ? u.id : u) === currentUser.id))
  );
  // Get like count - handle both array length and like_count property from API
  const likeCount = post.like_count !== undefined ? post.like_count : (post.likes ? post.likes.length : 0);
  // Get comment count - handle both array length and comments_count property from API
  const commentCount = post.comments_count !== undefined ? post.comments_count : (post.comments ? post.comments.length : 0);
  
  const timeAgo = getTimeAgo(new Date(post.timestamp));
  
  let mediaContent = '';
  if (post.mediaType === 'image' && post.mediaUrl) {
    mediaContent = `<img src="${post.mediaUrl}" alt="Post image">`;
  } else if (post.mediaType === 'video' && post.mediaUrl) {
    mediaContent = `<video controls><source src="${post.mediaUrl}" type="video/mp4">Your browser does not support the video tag.</video>`;
  }
  
  let linkContent = '';
  if (post.link) {
    linkContent = `<a href="${post.link}" target="_blank" class="post-link">${post.link}</a>`;
  }
  
  postDiv.innerHTML = `
    <div class="post-header">
      <div class="post-author">${postAuthor.name}</div>
      <div class="post-time">${timeAgo}</div>
    </div>
    <div class="post-content">${escapeHtml(post.text)}</div>
    ${mediaContent}
    ${linkContent}
    <div class="actions-wrapper">
      <div class="actions">
        <button class="action-btn ${isLiked ? 'liked' : ''}" id="like-btn-${index}" data-liked="${isLiked}" onclick="toggleLike(${index})">
          Like <span id="like-count-${index}" class="badge">${likeCount}</span>
        </button>
        <button class="action-btn" onclick="toggleCommentBox(${index})">
          Comment <span id="comment-count-${index}" class="badge">${commentCount}</span>
        </button>
        <button class="action-btn" onclick="openChatWithUser('${post.authorId}')">Chat</button>
      </div>
    </div>
    <div id="comment-box-${index}" class="comment-box">
      <div class="comments-list" id="comments-list-${index}"></div>
      <input id="comment-input-${index}" placeholder="Write a comment...">
      <button onclick="addComment(${index})" class="comment-post">Post</button>
    </div>
  `;
  
  // Render existing comments
  if (post.comments && post.comments.length > 0) {
    renderComments(index, post.comments);
  }
  
  return postDiv;
}

// Render comments
function renderComments(postIndex, comments) {
  const commentsList = document.getElementById(`comments-list-${postIndex}`);
  if (!commentsList) return;
  
  commentsList.innerHTML = '';
  
  const allUsers = getAllUsers();
  
  comments.forEach(comment => {
    // Get author name - try multiple sources
    let authorName = 'Unknown User';
    
    // First try to get from comment.author object (from API)
    if (comment.author && comment.author.username) {
      authorName = comment.author.username;
    } else if (comment.author && comment.author.email) {
      authorName = comment.author.email;
    } else if (comment.authorId) {
      // Try from allUsers by ID
      if (allUsers[comment.authorId] && allUsers[comment.authorId].name) {
        authorName = allUsers[comment.authorId].name;
      } else {
        // Try to get from userData or clientData directly
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        const clientData = JSON.parse(localStorage.getItem('clientData')) || {};
        const pwdSignupData = JSON.parse(localStorage.getItem('pwdSignupData')) || {};
        
        if (userData.id === comment.authorId && userData.username) {
          authorName = userData.username;
        } else if (userData.email === comment.authorId && userData.name) {
          authorName = userData.name;
        } else if (pwdSignupData.email === comment.authorId && pwdSignupData.name) {
          authorName = pwdSignupData.name;
        } else if (clientData.email === comment.authorId && clientData.name) {
          authorName = clientData.name;
        }
      }
    }
    
    const commentEl = document.createElement('div');
    commentEl.className = 'comment-item';
    commentEl.innerHTML = `<span class="comment-author">${authorName}:</span>${escapeHtml(comment.text)}`;
    commentsList.appendChild(commentEl);
  });
}

// Get all users with their names
function getAllUsers() {
  const users = {};
  const allUsers = JSON.parse(localStorage.getItem('allUsers')) || {};
  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const clientData = JSON.parse(localStorage.getItem('clientData')) || {};
  const pwdSignupData = JSON.parse(localStorage.getItem('pwdSignupData')) || {};
  
  // Add from allUsers (most reliable source)
  Object.keys(allUsers).forEach(userId => {
    if (allUsers[userId] && allUsers[userId].name) {
      users[userId] = allUsers[userId];
    }
  });
  
  // Add from userData (PWD users)
  if (userData.email && userData.name) {
    users[userData.email] = {
      name: userData.name,
      type: 'pwd'
    };
  }
  
  // Add from pwdSignupData as fallback
  if (pwdSignupData.email && pwdSignupData.name && !users[pwdSignupData.email]) {
    users[pwdSignupData.email] = {
      name: pwdSignupData.name,
      type: 'pwd'
    };
  }
  
  // Add from clientData
  if (clientData.email && clientData.name) {
    users[clientData.email] = {
      name: clientData.name,
      type: 'client'
    };
  }
  
  return users;
}

// Open popup
function openPopup() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    if (window.showWarningAlert) {
      showWarningAlert('Please login to create a post');
    } else {
      alert('Please login to create a post');
    }
    return;
  }
  
  document.getElementById('popup').style.display = 'flex';
  document.getElementById('popup-text').value = '';
  document.getElementById('popup-file').value = '';
  document.getElementById('popup-link').value = '';
}

// Close popup
function closePopup() {
  document.getElementById('popup').style.display = 'none';
}

// Create post
async function createPost() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    if (window.showWarningAlert) {
      showWarningAlert('Please login to create a post');
    } else {
      alert('Please login to create a post');
    }
    return;
  }
  
  const text = document.getElementById('popup-text').value.trim();
  const fileInput = document.getElementById('popup-file');
  const linkInput = document.getElementById('popup-link').value.trim();
  
  if (!text && !fileInput.files[0] && !linkInput) {
    if (window.showWarningAlert) {
      showWarningAlert('Please add some content to your post');
    } else {
      alert('Please add some content to your post');
    }
    return;
  }
  
  const file = fileInput.files[0];
  let mediaFile = null;
  let mediaType = null;
  
  if (file) {
    // Check file size (10MB max for videos)
    if (file.type.startsWith('video/') && file.size > 10 * 1024 * 1024) {
      if (window.showErrorAlert) {
        showErrorAlert('Video file size must be less than 10MB');
      } else {
        alert('Video file size must be less than 10MB');
      }
      return;
    }
    
    mediaFile = file;
    mediaType = file.type.startsWith('video/') ? 'video' : 'image';
  }
  
  // Use API if available, otherwise use localStorage with data URL
  if (window.ableConnectAPI && window.ableConnectAPI.tubonge && mediaFile) {
    // Use API with file upload
    await savePostToStorage(text, mediaFile, mediaType, linkInput);
  } else if (file) {
    // Fallback: convert to data URL for localStorage
    const reader = new FileReader();
    reader.onload = async function(e) {
      const mediaUrl = e.target.result;
      await savePostToStorage(text, mediaUrl, mediaType, linkInput);
    };
    reader.readAsDataURL(file);
  } else {
    await savePostToStorage(text, null, null, linkInput);
  }
}

// Save post to storage (API or localStorage fallback)
async function savePostToStorage(text, mediaUrl, mediaType, link) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert('Please login to create a post');
    return;
  }
  
  // Try API first (only if mediaUrl is a File object, not a data URL)
  if (window.ableConnectAPI && window.ableConnectAPI.tubonge && (mediaUrl instanceof File || !mediaUrl)) {
    try {
      const postData = {
        text: text || '',
        mediaFile: mediaUrl instanceof File ? mediaUrl : null,
        mediaType: mediaType,
        link: link || null
      };
      
      await window.ableConnectAPI.tubonge.createPost(postData);
      closePopup();
      await renderPosts();
      return;
    } catch (error) {
      console.error('Error creating post via API:', error);
      if (window.showErrorAlert) {
        showErrorAlert('Failed to create post. Please try again.');
      } else {
        alert('Failed to create post. Please try again.');
      }
      return;
    }
  }
  
  // Fallback to localStorage
  const allUsers = JSON.parse(localStorage.getItem('allUsers')) || {};
  if (!allUsers[currentUser.id]) {
    allUsers[currentUser.id] = {
      name: currentUser.name,
      type: currentUser.type
    };
    localStorage.setItem('allUsers', JSON.stringify(allUsers));
  }
  
  const posts = await getPosts();
  
  const newPost = {
    id: Date.now().toString(),
    authorId: currentUser.id,
    text: text || '',
    mediaUrl: mediaUrl,
    mediaType: mediaType,
    link: link || null,
    timestamp: new Date().toISOString(),
    likes: [],
    comments: []
  };
  
  posts.unshift(newPost);
  savePosts(posts);
  
  closePopup();
  await renderPosts();
}

// Toggle like
async function toggleLike(postIndex) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    if (window.showWarningAlert) {
      showWarningAlert('Please login to like posts');
    } else {
      alert('Please login to like posts');
    }
    return;
  }
  
  const posts = await getPosts();
  const post = posts[postIndex];
  
  // Use API if available
  if (window.ableConnectAPI && window.ableConnectAPI.tubonge && post.id) {
    try {
      const response = await window.ableConnectAPI.tubonge.likePost(post.id);
      // Refresh posts to get updated like count and list
      await renderPosts();
      return;
    } catch (error) {
      // If API is unavailable, fall through to localStorage
      if (error.message === 'API_UNAVAILABLE') {
        console.log('API unavailable, using localStorage fallback for like');
      } else {
        console.error('Error liking post:', error);
        if (window.showErrorAlert) {
          showErrorAlert('Failed to like post. Please try again.');
        }
        return; // Don't fall through if it's a real error
      }
    }
  }
  
  // Fallback to localStorage
  if (!post.likes) {
    post.likes = [];
  }
  
  const likeIndex = post.likes.indexOf(currentUser.id);
  
  if (likeIndex > -1) {
    post.likes.splice(likeIndex, 1);
  } else {
    post.likes.push(currentUser.id);
  }
  
  savePosts(posts);
  await renderPosts();
}

// Toggle comment box
function toggleCommentBox(postIndex) {
  const box = document.getElementById(`comment-box-${postIndex}`);
  if (box) {
    box.style.display = box.style.display === 'block' ? 'none' : 'block';
  }
}

// Add comment
async function addComment(postIndex) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    if (window.showWarningAlert) {
      showWarningAlert('Please login to comment');
    } else {
      alert('Please login to comment');
    }
    return;
  }
  
  const input = document.getElementById(`comment-input-${postIndex}`);
  const text = input.value.trim();
  
  if (!text) return;
  
  const posts = await getPosts();
  const post = posts[postIndex];
  
  // Use API if available
  if (window.ableConnectAPI && window.ableConnectAPI.tubonge && post.id) {
    try {
      await window.ableConnectAPI.tubonge.addComment(post.id, text);
      input.value = '';
      // Reload comments from API
      const comments = await window.ableConnectAPI.tubonge.getComments(post.id);
      
      // Store comment authors in allUsers
      const allUsers = JSON.parse(localStorage.getItem('allUsers')) || {};
      comments.forEach(c => {
        if (c.author && c.author.id) {
          allUsers[c.author.id] = {
            name: c.author.username || c.author.email,
            type: c.author.user_type || 'pwd',
            id: c.author.id
          };
        }
      });
      localStorage.setItem('allUsers', JSON.stringify(allUsers));
      
      // Render comments with full author objects
      renderComments(postIndex, comments.map(c => ({
        id: c.id,
        authorId: c.author.id,
        author: c.author, // Keep full author object
        text: c.text,
        timestamp: c.created_at
      })));
      
      // Update comment count in post
      const posts = await getPosts();
      await renderPosts();
      return;
    } catch (error) {
      // If API is unavailable, fall through to localStorage
      if (error.message === 'API_UNAVAILABLE') {
        console.log('API unavailable, using localStorage fallback for comment');
        input.value = ''; // Clear input even on fallback
      } else {
        console.error('Error adding comment:', error);
        if (window.showErrorAlert) {
          showErrorAlert('Failed to add comment. Please try again.');
        }
        return; // Don't fall through if it's a real error
      }
    }
  }
  
  // Fallback to localStorage
  if (!post.comments) {
    post.comments = [];
  }
  
  post.comments.push({
    authorId: currentUser.id,
    text: text,
    timestamp: new Date().toISOString()
  });
  
  savePosts(posts);
  renderComments(postIndex, post.comments);
  input.value = '';
  await renderPosts();
  
  // Keep comment box open
  const box = document.getElementById(`comment-box-${postIndex}`);
  if (box) {
    box.style.display = 'block';
  }
}

// Open chat with user
function openChatWithUser(userId) {
  // Check if chat system is initialized
  if (typeof window.openChatConversation === 'function') {
    window.openChatConversation(userId);
  } else {
    // Fallback: wait for chat to initialize
    setTimeout(() => {
      if (typeof window.openChatConversation === 'function') {
        window.openChatConversation(userId);
      } else {
        // If user not in list, add them to allUsers first
        const allUsers = JSON.parse(localStorage.getItem('allUsers')) || {};
        const posts = getPosts();
        const post = posts.find(p => p.authorId === userId);
        
        if (post) {
          const postAuthor = getAllUsers()[userId];
          if (postAuthor && !allUsers[userId]) {
            allUsers[userId] = postAuthor;
            localStorage.setItem('allUsers', JSON.stringify(allUsers));
          }
        }
        
        // Try again after a short delay
        setTimeout(() => {
          if (typeof window.openChatConversation === 'function') {
            window.openChatConversation(userId);
          } else {
            if (window.showInfoAlert) {
              showInfoAlert('Chat system is loading. Please try again in a moment.');
            } else {
              alert('Chat system is loading. Please try again in a moment.');
            }
          }
        }, 500);
      }
    }, 200);
  }
}

// Get time ago
function getTimeAgo(date) {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Expose functions to global scope
window.exitTubonge = exitTubonge;
window.openPopup = openPopup;
window.closePopup = closePopup;
window.createPost = createPost;
window.toggleLike = toggleLike;
window.toggleCommentBox = toggleCommentBox;
window.addComment = addComment;
window.openChatWithUser = openChatWithUser;

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  initTubonge();
});

