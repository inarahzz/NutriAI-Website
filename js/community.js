/* ============================
   Community Hub - JavaScript
   ============================ */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('community-form');
    const postsContainer = document.getElementById('community-posts');
    const emptyState = document.getElementById('community-empty');
    const filterBtns = document.querySelectorAll('.community-filter-btn');

    let currentFilter = 'all';

    // Load and render posts
    renderPosts();

    // Form submission
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('post-name').value.trim();
            const message = document.getElementById('post-message').value.trim();
            const category = document.getElementById('post-category').value;

            if (!name || !message) return;

            const newPost = {
                id: Date.now(),
                author: name,
                message: message,
                category: category,
                timestamp: new Date().toISOString(),
                likes: 0,
                likedByUser: false
            };

            const posts = getPosts();
            posts.unshift(newPost);
            savePosts(posts);

            form.reset();
            renderPosts();
            showToast('Post shared successfully!');
        });
    }

    // Category filter
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.category;
            renderPosts();
        });
    });

    function renderPosts() {
        let posts = getPosts();

        // Seed default posts if empty
        if (posts.length === 0) {
            posts = getDefaultPosts();
            savePosts(posts);
        }

        // Filter
        const filtered = currentFilter === 'all'
            ? posts
            : posts.filter(p => p.category === currentFilter);

        if (filtered.length === 0) {
            postsContainer.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        postsContainer.innerHTML = filtered.map(post => createPostCard(post)).join('');

        // Attach like button listeners
        postsContainer.querySelectorAll('.post-like-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const postId = parseInt(btn.dataset.id);
                toggleLike(postId);
            });
        });
    }

    function createPostCard(post) {
        const initials = post.author.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        const timeAgo = getTimeAgo(post.timestamp);
        const categoryLabels = {
            recipes: '🍳 Recipes',
            tips: '💡 Tips',
            motivation: '💪 Motivation',
            questions: '❓ Questions'
        };

        return `
            <div class="community-post-card" data-category="${post.category}">
                <div class="post-header">
                    <div class="post-author">
                        <div class="post-avatar">${initials}</div>
                        <div class="post-author-info">
                            <span class="post-author-name">${escapeHTML(post.author)}</span>
                            <span class="post-timestamp">${timeAgo}</span>
                        </div>
                    </div>
                    <span class="post-category-tag ${post.category}">${categoryLabels[post.category] || post.category}</span>
                </div>
                <div class="post-content">${escapeHTML(post.message)}</div>
                <div class="post-actions">
                    <button class="post-like-btn ${post.likedByUser ? 'liked' : ''}" data-id="${post.id}">
                        <span>${post.likedByUser ? '❤️' : '🤍'}</span>
                        <span>${post.likes} ${post.likes === 1 ? 'like' : 'likes'}</span>
                    </button>
                </div>
            </div>
        `;
    }

    function toggleLike(postId) {
        const posts = getPosts();
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        if (post.likedByUser) {
            post.likes = Math.max(0, post.likes - 1);
            post.likedByUser = false;
        } else {
            post.likes += 1;
            post.likedByUser = true;
        }

        savePosts(posts);
        renderPosts();
    }

    function getPosts() {
        const saved = localStorage.getItem('nutriai_community_posts');
        return saved ? JSON.parse(saved) : [];
    }

    function savePosts(posts) {
        localStorage.setItem('nutriai_community_posts', JSON.stringify(posts));
    }

    function getTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function getDefaultPosts() {
        const now = Date.now();
        return [
            {
                id: now - 100000,
                author: 'Sarah Tan',
                message: 'Just tried swapping my regular bubble tea for green tea with 0% sugar and aloe vera. Honestly, it tastes refreshing and I don\'t miss the sugar! Saved like 400 calories 🍵',
                category: 'tips',
                timestamp: new Date(now - 3600000).toISOString(),
                likes: 12,
                likedByUser: false
            },
            {
                id: now - 200000,
                author: 'Ahmad R',
                message: 'My go-to healthy hawker meal: fish soup with extra vegetables and brown rice. Around 400 calories and super filling! What\'s your favourite healthy hawker order?',
                category: 'recipes',
                timestamp: new Date(now - 7200000).toISOString(),
                likes: 8,
                likedByUser: false
            },
            {
                id: now - 300000,
                author: 'Mei Lin',
                message: 'Week 3 of meal prepping and I\'ve already saved $40 and lost 1.5kg! Planning ahead really works. Don\'t give up if week 1 is tough — it gets easier! 💪',
                category: 'motivation',
                timestamp: new Date(now - 14400000).toISOString(),
                likes: 24,
                likedByUser: false
            },
            {
                id: now - 400000,
                author: 'Raj Kumar',
                message: 'Does anyone know a good way to make overnight oats that actually tastes good? Mine always end up too mushy and bland. Help appreciated!',
                category: 'questions',
                timestamp: new Date(now - 28800000).toISOString(),
                likes: 5,
                likedByUser: false
            },
            {
                id: now - 500000,
                author: 'Ying Xuan',
                message: 'Quick tip: Ask for "less oil" and "more vegetables" at any cai fan stall. Most will do it happily and it can save you 150-200 calories without changing what you eat!',
                category: 'tips',
                timestamp: new Date(now - 43200000).toISOString(),
                likes: 16,
                likedByUser: false
            }
        ];
    }

    // Toast function (uses main.js showToast if available)
    function showToast(message) {
        if (window.showToast) {
            window.showToast(message);
            return;
        }
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:var(--primary-green);color:white;padding:12px 20px;border-radius:8px;font-size:0.85rem;z-index:9999;animation:fadeIn 0.3s ease;';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
});
