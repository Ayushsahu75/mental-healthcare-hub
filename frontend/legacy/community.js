// community.js - Community support page functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Community page loaded successfully');
    
    let posts = [];
    let currentFilter = 'all';
    
    // Initialize community page
    initializeCommunityStats();
    initializeCategoryFilters();
    initializePosts();
    initializeCreatePost();
    loadSamplePosts();
    
    function initializeCommunityStats() {
        // Animate stats on load
        const statNumbers = document.querySelectorAll('.stat-card h3');
        
        statNumbers.forEach(stat => {
            const finalNumber = stat.textContent;
            const isPercentage = finalNumber.includes('/');
            const isRating = finalNumber.includes('.');
            
            let currentNumber = 0;
            const increment = isPercentage ? 1 : isRating ? 0.1 : 50;
            const maxNumber = parseFloat(finalNumber.replace(/[^\d.]/g, ''));
            
            const counter = setInterval(() => {
                currentNumber += increment;
                if (currentNumber >= maxNumber) {
                    currentNumber = maxNumber;
                    clearInterval(counter);
                }
                
                if (isPercentage) {
                    stat.textContent = Math.round(currentNumber) + '/5';
                } else if (isRating) {
                    stat.textContent = currentNumber.toFixed(1) + '/5';
                } else {
                    stat.textContent = Math.round(currentNumber).toLocaleString();
                }
            }, 50);
        });
    }
    
    function initializeCategoryFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                currentFilter = this.dataset.category;
                filterPosts();
            });
        });
    }
    
    function initializePosts() {
        const postsList = document.querySelector('.posts-list');
        if (!postsList) return;
        
        // Add event listeners for post interactions
        postsList.addEventListener('click', function(e) {
            if (e.target.classList.contains('like-btn')) {
                handleLike(e.target);
            } else if (e.target.classList.contains('comment-btn')) {
                handleComment(e.target);
            } else if (e.target.classList.contains('share-btn')) {
                handleShare(e.target);
            }
        });
    }
    
    function initializeCreatePost() {
        const createPostBtn = document.querySelector('.btn-primary');
        if (createPostBtn && createPostBtn.textContent.includes('New Post')) {
            createPostBtn.addEventListener('click', showCreatePost);
        }
        
        const createPostForm = document.getElementById('createPostForm');
        if (createPostForm) {
            createPostForm.addEventListener('submit', handleCreatePost);
        }
    }
    
    function loadSamplePosts() {
        posts = [
            {
                id: 1,
                author: 'Alex (Anonymous)',
                category: 'Academic Stress',
                title: 'Feeling overwhelmed with finals',
                content: 'I have 4 exams next week and I\'m starting to feel really anxious. Anyone have tips for managing exam stress?',
                time: '2 hours ago',
                likes: 12,
                comments: 8,
                avatar: 'A'
            },
            {
                id: 2,
                author: 'Blake (Anonymous)',
                category: 'Wellness Tips',
                title: 'Morning routine that changed my life',
                content: 'Started doing 10 minutes of meditation and 5 minutes of journaling every morning. The difference is incredible! 🧘‍♀️',
                time: '5 hours ago',
                likes: 24,
                comments: 15,
                avatar: 'B'
            },
            {
                id: 3,
                author: 'Casey (Anonymous)',
                category: 'Relationships',
                title: 'Feeling lonely in college',
                content: 'It\'s my second year and I still haven\'t found my people. How do you make meaningful friendships in college?',
                time: '1 day ago',
                likes: 18,
                comments: 22,
                avatar: 'C'
            }
        ];
        
        renderPosts();
    }
    
    function renderPosts() {
        const postsList = document.querySelector('.posts-list');
        if (!postsList) return;
        
        const filteredPosts = currentFilter === 'all' ? posts : 
            posts.filter(post => post.category.toLowerCase() === currentFilter);
        
        postsList.innerHTML = filteredPosts.map(post => `
            <div class="post-card">
                <div class="post-header">
                    <div class="post-author">
                        <img src="https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=${post.avatar}" alt="Author" class="author-avatar">
                        <div class="author-info">
                            <h4>${post.author}</h4>
                            <span class="post-time">${post.time}</span>
                        </div>
                    </div>
                    <div class="post-category">${post.category}</div>
                </div>
                <div class="post-content">
                    <h3>${post.title}</h3>
                    <p>${post.content}</p>
                </div>
                <div class="post-actions">
                    <button class="action-btn like-btn" data-post-id="${post.id}">
                        <span>👍</span>
                        <span>${post.likes}</span>
                    </button>
                    <button class="action-btn comment-btn" data-post-id="${post.id}">
                        <span>💬</span>
                        <span>${post.comments}</span>
                    </button>
                    <button class="action-btn share-btn" data-post-id="${post.id}">
                        <span>🔄</span>
                        <span>Share</span>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    function filterPosts() {
        renderPosts();
    }
    
    function handleLike(button) {
        const postId = parseInt(button.dataset.postId);
        const post = posts.find(p => p.id === postId);
        
        if (post) {
            post.likes++;
            renderPosts();
            showAlert('Post liked!', 'success');
        }
    }
    
    function handleComment(button) {
        const postId = parseInt(button.dataset.postId);
        showAlert('Comment feature coming soon!', 'info');
    }
    
    function handleShare(button) {
        const postId = parseInt(button.dataset.postId);
        showAlert('Share feature coming soon!', 'info');
    }
    
    function handleCreatePost(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const title = formData.get('postTitle');
        const category = formData.get('postCategory');
        const content = formData.get('postContent');
        const anonymous = formData.get('anonymousPost') === 'on';
        
        if (!title || !category || !content) {
            showAlert('Please fill in all fields', 'error');
            return;
        }
        
        const newPost = {
            id: posts.length + 1,
            author: anonymous ? 'Anonymous' : 'Current User',
            category: category,
            title: title,
            content: content,
            time: 'Just now',
            likes: 0,
            comments: 0,
            avatar: anonymous ? 'A' : 'U'
        };
        
        posts.unshift(newPost);
        renderPosts();
        
        // Close modal
        const modal = document.getElementById('createPostModal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Reset form
        e.target.reset();
        
        showAlert('Post created successfully!', 'success');
    }
    
    // Global functions
    window.showCreatePost = function() {
        const modal = document.getElementById('createPostModal');
        if (modal) {
            modal.style.display = 'block';
        }
    };
    
    window.closeCreatePost = function() {
        const modal = document.getElementById('createPostModal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Reset form
        const form = document.getElementById('createPostForm');
        if (form) {
            form.reset();
        }
    };
    
    function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        if (type === 'success') {
            alert.style.backgroundColor = '#10b981';
        } else if (type === 'error') {
            alert.style.backgroundColor = '#ef4444';
        } else if (type === 'info') {
            alert.style.backgroundColor = '#3b82f6';
        }
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 300);
        }, 3000);
    }
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .filter-btn.active {
            background-color: #4F46E5;
            color: white;
        }
        .post-card {
            transition: transform 0.2s ease;
        }
        .post-card:hover {
            transform: translateY(-2px);
        }
        .action-btn {
            transition: all 0.2s ease;
        }
        .action-btn:hover {
            transform: scale(1.1);
        }
        .like-btn:hover {
            color: #ef4444;
        }
        .comment-btn:hover {
            color: #3b82f6;
        }
        .share-btn:hover {
            color: #10b981;
        }
    `;
    document.head.appendChild(style);
});




