// resources.js - Resource hub page functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Resources page loaded successfully');
    
    let resources = [];
    let currentFilter = 'all';
    let currentSort = 'recent';
    let bookmarkedResources = [];
    
    // Get the modal and modal content elements once
    const modal = document.getElementById('resourcePlayerModal');
    const modalContent = modal ? modal.querySelector('.modal-content') : null;

    // Initialize resources page
    initializeResources();
    initializeFilters();
    initializeSearch();
    loadBookmarkedResources();
    
    // ===================================
    // 🛠️ CLOSE MODAL FUNCTIONALITY
    // ===================================
    
    // Define the function to close the modal
    window.closeResourceModal = function() {
        if (modal) {
            modal.style.display = 'none';
            // Stop playing any media when the modal closes
            const video = modal.querySelector('#videoPlayer video');
            const audio = modal.querySelector('#audioPlayer audio');
            if (video) video.pause();
            if (audio) audio.pause();
            
            // Clear the resource ID from the modal content's dataset
            if (modalContent) modalContent.dataset.currentResourceId = ''; 
        }
    }
    
    // 1. Event listener for the 'X' close button (the &times; element)
    const closeBtn = document.querySelector('.modal-content .close');
    if (closeBtn) {
        closeBtn.addEventListener('click', window.closeResourceModal); 
    }
    
    // 2. Event listener for clicking outside the modal content
    if (modal) {
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                window.closeResourceModal();
            }
        });
    }
    
    // ===================================
    // CORE APP LOGIC
    // ===================================

    function initializeResources() {
        loadSampleResources();
        renderResources();
    }
    
    function initializeFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Update filter to use data-category value ('article', 'video', etc.)
                currentFilter = this.dataset.category; 
                renderResources();
            });
        });
        
        // Initialize sort dropdown
        const sortSelect = document.querySelector('.sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                currentSort = this.value;
                renderResources();
            });
        }
    }
    
    function initializeSearch() {
        const searchInput = document.getElementById('resourceSearch');
        if (searchInput) {
            // Use 'input' event to trigger filtering in real-time
            searchInput.addEventListener('input', function() {
                filterResourcesBySearch(this.value.toLowerCase());
            });
        }
    }
    
    function loadSampleResources() {
        // Sample data with updated image paths:
        resources = [
            // Resource 1: Anxiety Article -> Gemini Image (in data folder)
            { id: 1, type: 'article', category: 'Anxiety', title: 'Understanding and Managing Anxiety', description: 'An in-depth guide to anxiety symptoms and coping strategies for college students.', duration: '6 min read', rating: 4.6, views: 2300, image: '../data/Gemini_Generated_Image_ef7xlef7xlef7xle.png', link: '#', featured: false },
            // Resource 2: Stress Video -> Screenshot Image (in data folder)
            { id: 2, type: 'video', category: 'Stress', title: '5-Minute Stress Relief Techniques', description: 'Quick video exercises to calm your mind during busy study periods.', duration: '8 min', rating: 4.8, views: 1800, image: '../data/Screenshot_22-11-2025_163027_www.bing.com.jpeg', link: '#', featured: false },
            // Resource 3 (Featured): Sleep Audio -> image_b804ed.jpg (assuming placed in data folder for relative path to work)
            { id: 3, type: 'audio', category: 'Sleep', title: 'Guided Sleep Meditation', description: 'Relaxing audio to help you fall asleep faster and sleep more deeply.', duration: '15 min', rating: 4.9, views: 2100, image: '../data/Guided Sleep Meditation.png', link: '#', featured: true },
            // Resource 4 (Featured): Depression Article -> image_b7b27e.jpg (assuming placed in data folder for relative path to work)
            { id: 4, type: 'article', category: 'Depression', title: 'Coping with Depression: A Student Guide', description: 'Practical advice for students dealing with depression and low mood.', duration: '8 min read', rating: 4.7, views: 1900, image: '../data/Gemini_Generated_Image_ef7xlef7xlef7xle.png', link: '#', featured: true },
            
            // Remaining resources with new public image placeholders:
            { id: 5, type: 'video', category: 'Mindfulness', title: 'Introduction to Mindfulness', description: 'Learn the basics of mindfulness for daily well-being and stress reduction.', duration: '12 min', rating: 4.5, views: 1600, image: '../data/Gemini_Generated_Image_ef7xlef7xlef7xle.png', link: '#', featured: false },
            { id: 6, type: 'article', category: 'Burnout', title: 'Preventing Academic Burnout', description: 'Strategies to manage academic pressure and avoid burnout during college.', duration: '7 min read', rating: 4.8, views: 2200, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', link: '#', featured: false },
            { id: 7, type: 'audio', category: 'Meditation', title: 'Morning Mindfulness', description: 'Start your day with this 10-minute guided mindfulness meditation.', duration: '10 min', rating: 4.9, views: 1400, image: '../data/Morning Mindfulness.png', link: '#', featured: true },
            { id: 8, type: 'video', category: 'Relationships', title: 'Building Healthy Relationships', description: 'Tips for maintaining friendships and romantic relationships in college.', duration: '15 min', rating: 4.7, views: 1700, image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', link: '', featured: false },
            { id: 9, type: 'guide', category: 'Self-Care', title: 'Self-Care Checklist', description: 'A comprehensive guide to developing and maintaining healthy self-care habits.', duration: '10 min read', rating: 4.8, views: 1500, image: 'https://images.unsplash.com/photo-1557999882-6240d436a0c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', link: '#', featured: false },
            { id: 10, type: 'guide', category: 'Crisis', title: 'Crisis Intervention Plan', description: 'Step-by-step guide for managing mental health crises and knowing when to seek help.', duration: '5 min read', rating: 4.9, views: 1200, image: 'https://images.unsplash.com/photo-1516524386762-b9b65313936a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', link: '#', featured: false }
        ];
    }
    
    function renderResources() {
        let filteredResources = filterResources();
        filteredResources = sortResources(filteredResources);
        
        // Separate featured resources (shown in both grids for simplicity, or can be exclusive)
        const featured = filteredResources.filter(r => r.featured);
        const mainResources = filteredResources; // Keep all for main grid to show filter results clearly
        
        renderFeaturedResources(featured);
        renderResourcesGrid(mainResources);
        
        renderBookmarkedResources(); 
    }
    
    function filterResources() {
        const searchTerm = (document.getElementById('resourceSearch')?.value || '').toLowerCase();
        
        // Filter by category/type first
        let filtered = resources.filter(resource => {
            // Check if the currentFilter matches resource.type directly
            return currentFilter === 'all' || 
                   resource.type === currentFilter;
        });
        
        // Filter by search term
        if (searchTerm) {
             filtered = filtered.filter(resource =>
                resource.title.toLowerCase().includes(searchTerm) ||
                resource.description.toLowerCase().includes(searchTerm) ||
                resource.category.toLowerCase().includes(searchTerm)
            );
        }
        
        return filtered;
    }
    
    function sortResources(resources) {
        // Implementation remains the same
        switch(currentSort) {
            case 'recent':
                return resources.sort((a, b) => b.id - a.id);
            case 'popular':
                return resources.sort((a, b) => b.views - a.views);
            case 'rating':
                return resources.sort((a, b) => b.rating - a.rating);
            case 'duration':
                return resources.sort((a, b) => {
                    const aDuration = parseInt(a.duration) || 0;
                    const bDuration = parseInt(b.duration) || 0;
                    return aDuration - bDuration;
                });
            default:
                return resources;
        }
    }
    
    // Updated to render content dynamically
    function renderFeaturedResources(featuredResources) {
        const featuredGrid = document.querySelector('.featured-grid');
        if (!featuredGrid) return;
        
        featuredGrid.innerHTML = featuredResources.map(resource => `
            <div class="featured-card">
                <div class="featured-image">
                    <img src="${resource.image}" alt="${resource.title}">
                    <div class="play-overlay">
                        <button class="${resource.type}-btn play-btn" onclick="openResource(${resource.id})">${getActionIcon(resource.type)}</button>
                    </div>
                </div>
                <div class="featured-content">
                    <div class="resource-category">${resource.category}</div>
                    <h3>${resource.title}</h3>
                    <p>${resource.description}</p>
                    <div class="resource-meta">
                        <span class="duration">${resource.duration}</span>
                        <span class="views">${resource.views.toLocaleString()} views</span>
                        <span class="rating">⭐ ${resource.rating}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    function renderResourcesGrid(resources) {
        const resourcesGrid = document.querySelector('.resources-grid');
        if (!resourcesGrid) return;
        
        resourcesGrid.innerHTML = resources.map(resource => `
            <div class="resource-card" data-category="${resource.type}">
                <div class="resource-thumbnail">
                    <img src="${resource.image}" alt="${resource.title}">
                    <div class="resource-type">${getResourceIcon(resource.type)}</div>
                </div>
                <div class="resource-info">
                    <div class="resource-category">${resource.category}</div>
                    <h4>${resource.title}</h4>
                    <p>${resource.description}</p>
                    <div class="resource-meta">
                        <span class="duration">${resource.duration}</span>
                        <span class="rating">⭐ ${resource.rating}</span>
                    </div>
                    <div class="resource-actions">
                        <button class="btn btn-outline btn-small" onclick="openResource(${resource.id})">
                            ${getActionText(resource.type)}
                        </button>
                        <button class="btn btn-outline btn-small" onclick="bookmarkResource(${resource.id})">
                            🔖
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    function filterResourcesBySearch(searchTerm) {
        // Re-run the main render function after search input changes
        // This leverages the filterResources function which now checks the search input
        renderResources();
    }
    
    // Helper function to get the correct icon for the card thumbnail
    function getResourceIcon(type) {
        const icons = {
            'article': '📄',
            'video': '🎥',
            'audio': '🎵',
            'guide': '📋'
        };
        return icons[type] || '📄';
    }
    
    // Helper function to get the text for the action button
    function getActionText(type) {
        const actions = {
            'article': 'Read',
            'video': 'Watch',
            'audio': 'Listen',
            'guide': 'View'
        };
        return actions[type] || 'View';
    }
    
    // Helper function to get the icon for the featured play overlay
    function getActionIcon(type) {
        const icons = {
            'article': '📖',
            'video': '▶️',
            'audio': '🎵',
            'guide': '⬇️' // Using down arrow for view/download guide
        };
        return icons[type] || '▶️';
    }

    function loadBookmarkedResources() {
        bookmarkedResources = JSON.parse(localStorage.getItem('bookmarkedResources') || '[]');
        renderBookmarkedResources();
    }
    
    function renderBookmarkedResources() {
        const bookmarkedGrid = document.querySelector('.bookmarked-grid');
        if (!bookmarkedGrid) return;
        
        if (bookmarkedResources.length === 0) {
            bookmarkedGrid.innerHTML = '<p>No bookmarked resources yet. Start bookmarking your favorite content!</p>';
            return;
        }
        
        bookmarkedGrid.innerHTML = bookmarkedResources.map(resourceId => {
            const resource = resources.find(r => r.id === resourceId);
            if (!resource) return '';
            
            return `
                <div class="bookmarked-item" onclick="openResource(${resource.id})">
                    <div class="bookmark-icon">🔖</div>
                    <div class="bookmark-info">
                        <h4>${resource.title}</h4>
                        <p>${resource.type} • ${resource.duration}</p>
                    </div>
                    <button class="remove-bookmark" onclick="event.stopPropagation(); removeBookmark(${resource.id});">×</button>
                </div>
            `;
        }).join('');
    }
    
    // Global functions made available in the window scope
    
    window.openResource = function(resourceId) {
        const resource = resources.find(r => r.id === resourceId);
        if (!resource || !modal || !modalContent) return;
        
        // Store the ID on the modal content's dataset
        modalContent.dataset.currentResourceId = resourceId;
        
        // Populate modal content
        const playerTitle = document.getElementById('playerTitle');
        const playerCategory = document.getElementById('playerCategory');
        const playerDuration = document.getElementById('playerDuration');
        
        if (playerTitle) playerTitle.textContent = resource.title;
        if (playerCategory) playerCategory.textContent = resource.category;
        if (playerDuration) playerDuration.textContent = resource.duration;
        
        // Show appropriate player based on type
        const videoPlayer = document.getElementById('videoPlayer');
        const audioPlayer = document.getElementById('audioPlayer');
        const articleContent = document.getElementById('articleContent');
        
        // Hide all players
        if (videoPlayer) videoPlayer.style.display = 'none';
        if (audioPlayer) audioPlayer.style.display = 'none';
        if (articleContent) articleContent.style.display = 'none';
        
        // Stop any media that might be running from a previous open
        const previousVideo = videoPlayer?.querySelector('video');
        const previousAudio = audioPlayer?.querySelector('audio');
        if (previousVideo) previousVideo.pause();
        if (previousAudio) previousAudio.pause();


        // Show appropriate player and set source/content
        switch(resource.type) {
            case 'video':
                if (videoPlayer) {
                    videoPlayer.style.display = 'block';
                    const video = videoPlayer.querySelector('video');
                    if (video) {
                        video.src = resource.link; 
                        video.load(); 
                    }
                }
                break;
            case 'audio':
                if (audioPlayer) {
                    audioPlayer.style.display = 'block';
                    const audio = audioPlayer.querySelector('audio');
                    if (audio) {
                        audio.src = resource.link; 
                        audio.load(); 
                    }
                }
                break;
            case 'article':
            case 'guide': 
                if (articleContent) {
                    articleContent.style.display = 'block';
                    const articleText = articleContent.querySelector('.article-text');
                    if (articleText) {
                        articleText.innerHTML = `
                            <h3>${resource.title}</h3>
                            <p>${resource.description}</p>
                            <p>This is the full content for the **${resource.type.toUpperCase()}** titled "${resource.title}".</p>
                            <p> </p>
                        `;
                    }
                }
                break;
        }
        
        modal.style.display = 'block';
    };
    
    window.bookmarkResource = function(resourceId) {
        // resourceId is retrieved from the modal's data attribute by the HTML button
        resourceId = parseInt(resourceId);
        if (isNaN(resourceId) || !resources.some(r => r.id === resourceId)) {
             showAlert('Could not identify resource to bookmark.', 'error');
             return;
        }

        if (bookmarkedResources.includes(resourceId)) {
            showAlert('Resource already bookmarked!', 'info');
            return;
        }
        
        bookmarkedResources.push(resourceId);
        localStorage.setItem('bookmarkedResources', JSON.stringify(bookmarkedResources));
        renderBookmarkedResources();
        showAlert('Resource bookmarked successfully!', 'success');
    };
    
    window.removeBookmark = function(resourceId) {
        bookmarkedResources = bookmarkedResources.filter(id => id !== resourceId);
        localStorage.setItem('bookmarkedResources', JSON.stringify(bookmarkedResources));
        renderBookmarkedResources();
        showAlert('Bookmark removed!', 'info');
    };
    
    window.shareResource = function() {
        showAlert('Share feature coming soon!', 'info');
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
    
    // Add CSS animations (unchanged)
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
        .resource-card {
            transition: transform 0.2s ease;
        }
        .resource-card:hover {
            transform: translateY(-2px);
        }
        .featured-card {
            transition: transform 0.2s ease;
        }
        .featured-card:hover {
            transform: translateY(-5px);
        }
        .play-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .featured-image:hover .play-overlay {
            opacity: 1;
        }
        .play-btn {
            background: white;
            border: none;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            font-size: 1.5rem;
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        .play-btn:hover {
            transform: scale(1.1);
        }
    `;
    document.head.appendChild(style);
});