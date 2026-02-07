// Initialize Lucide icons
lucide.createIcons();

// Default admin password (CHANGE THIS!)
const DEFAULT_ADMIN_PASSWORD = 'admin123';

// Data Storage
let newsData = [];
let affiliateProducts = [];
let settings = {
    adminPassword: DEFAULT_ADMIN_PASSWORD,
    siteTitle: 'Global Pulse',
    siteDescription: 'Breaking news from around the world',
    adminEmail: '',
    analyticsId: '',
    adsenseCode: '',
    headerAdCode: '',
    sidebarAdCode: '',
    articleAdCode: ''
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    initializeApp();
    loadSampleData();
    renderContent();
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute
});

// Initialize App
function initializeApp() {
    // Admin button
    document.getElementById('adminBtn').addEventListener('click', () => {
        document.getElementById('adminModal').style.display = 'block';
    });

    // Close modal
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('adminModal').style.display = 'none';
    });

    // Search functionality
    document.getElementById('searchBtn').addEventListener('click', () => {
        document.getElementById('searchBar').classList.toggle('hidden');
        if (!document.getElementById('searchBar').classList.contains('hidden')) {
            document.getElementById('searchInput').focus();
        }
    });

    document.getElementById('closeSearch').addEventListener('click', () => {
        document.getElementById('searchBar').classList.add('hidden');
    });

    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchNews(e.target.value);
    });

    // Mobile navigation
    document.getElementById('navToggle').addEventListener('click', () => {
        document.getElementById('navMenu').parentElement.classList.toggle('active');
    });

    // Category filtering
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.main-nav a').forEach(a => a.classList.remove('active'));
            e.target.classList.add('active');
            const category = e.target.dataset.category;
            filterByCategory(category);
        });
    });

    // Newsletter form
    document.getElementById('newsletterForm').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you for subscribing! You will receive daily news updates.');
        e.target.reset();
    });

    // News form
    document.getElementById('newsForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addNews();
    });

    // Affiliate form
    document.getElementById('affiliateForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addAffiliateProduct();
    });

    // Ad settings form
    document.getElementById('adForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveAdSettings();
    });

    // Settings form
    document.getElementById('settingsForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveSettings();
    });

    // Load More button
    document.getElementById('loadMoreBtn').addEventListener('click', () => {
        renderNewsGrid(newsData);
    });
}

// Admin Login
function adminLogin() {
    const password = document.getElementById('adminPassword').value;
    if (password === settings.adminPassword) {
        document.getElementById('adminModal').style.display = 'none';
        document.getElementById('adminPanel').classList.remove('hidden');
        document.getElementById('adminPanel').classList.add('active');
        loadAdminData();
    } else {
        alert('Incorrect password!');
    }
}

function closeAdmin() {
    document.getElementById('adminPanel').classList.remove('active');
    setTimeout(() => {
        document.getElementById('adminPanel').classList.add('hidden');
    }, 400);
}

// Tab Switching
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
    
    event.target.classList.add('active');
    document.getElementById(tabName + 'Tab').classList.remove('hidden');
}

// Load Admin Data
function loadAdminData() {
    renderAdminNewsList();
    renderAdminProductList();
    loadAdSettings();
    loadGeneralSettings();
}

// News Management
function addNews() {
    const news = {
        id: Date.now(),
        title: document.getElementById('newsTitle').value,
        category: document.getElementById('newsCategory').value,
        image: document.getElementById('newsImage').value || 'https://via.placeholder.com/800x500?text=News+Image',
        content: document.getElementById('newsContent').value,
        source: document.getElementById('newsSource').value || 'Global Pulse',
        date: new Date().toISOString(),
        excerpt: document.getElementById('newsContent').value.substring(0, 150) + '...'
    };
    
    newsData.unshift(news);
    saveToLocalStorage();
    renderContent();
    renderAdminNewsList();
    document.getElementById('newsForm').reset();
    alert('News article added successfully!');
}

function deleteNews(id) {
    if (confirm('Are you sure you want to delete this article?')) {
        newsData = newsData.filter(news => news.id !== id);
        saveToLocalStorage();
        renderContent();
        renderAdminNewsList();
    }
}

function renderAdminNewsList() {
    const container = document.getElementById('newsList');
    container.innerHTML = '<h3 style="margin-top: 2rem;">Recent Articles</h3>';
    
    newsData.slice(0, 10).forEach(news => {
        const item = document.createElement('div');
        item.className = 'admin-item';
        item.innerHTML = `
            <div>
                <strong>${news.title}</strong><br>
                <small>${news.category} - ${formatDate(news.date)}</small>
            </div>
            <button onclick="deleteNews(${news.id})">Delete</button>
        `;
        container.appendChild(item);
    });
}

// Affiliate Products Management
function addAffiliateProduct() {
    const product = {
        id: Date.now(),
        name: document.getElementById('productName').value,
        image: document.getElementById('productImage').value || 'https://via.placeholder.com/300x300?text=Product',
        price: document.getElementById('productPrice').value,
        link: document.getElementById('affiliateLink').value,
        description: document.getElementById('productDescription').value,
        category: document.getElementById('productCategory').value
    };
    
    affiliateProducts.unshift(product);
    saveToLocalStorage();
    renderAffiliateProducts();
    renderAdminProductList();
    document.getElementById('affiliateForm').reset();
    alert('Product added successfully!');
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        affiliateProducts = affiliateProducts.filter(product => product.id !== id);
        saveToLocalStorage();
        renderAffiliateProducts();
        renderAdminProductList();
    }
}

function renderAdminProductList() {
    const container = document.getElementById('productList');
    container.innerHTML = '<h3 style="margin-top: 2rem;">Active Products</h3>';
    
    affiliateProducts.forEach(product => {
        const item = document.createElement('div');
        item.className = 'admin-item';
        item.innerHTML = `
            <div>
                <strong>${product.name}</strong><br>
                <small>${product.price} - ${product.category}</small>
            </div>
            <button onclick="deleteProduct(${product.id})">Delete</button>
        `;
        container.appendChild(item);
    });
}

// Ad Settings
function saveAdSettings() {
    settings.adsenseCode = document.getElementById('adsenseCode').value;
    settings.headerAdCode = document.getElementById('headerAdCode').value;
    settings.sidebarAdCode = document.getElementById('sidebarAdCode').value;
    settings.articleAdCode = document.getElementById('articleAdCode').value;
    
    saveToLocalStorage();
    renderAds();
    alert('Ad settings saved successfully!');
}

function loadAdSettings() {
    document.getElementById('adsenseCode').value = settings.adsenseCode || '';
    document.getElementById('headerAdCode').value = settings.headerAdCode || '';
    document.getElementById('sidebarAdCode').value = settings.sidebarAdCode || '';
    document.getElementById('articleAdCode').value = settings.articleAdCode || '';
}

function renderAds() {
    if (settings.headerAdCode) {
        document.getElementById('headerAd').innerHTML = settings.headerAdCode;
    }
    if (settings.sidebarAdCode) {
        document.getElementById('sidebarAd').innerHTML = settings.sidebarAdCode;
    }
}

// General Settings
function saveSettings() {
    settings.siteTitle = document.getElementById('siteTitle').value;
    settings.siteDescription = document.getElementById('siteDescription').value;
    settings.adminEmail = document.getElementById('adminEmail').value;
    settings.analyticsId = document.getElementById('analyticsId').value;
    
    const newPassword = document.getElementById('newAdminPassword').value;
    if (newPassword) {
        settings.adminPassword = newPassword;
        document.getElementById('newAdminPassword').value = '';
    }
    
    saveToLocalStorage();
    document.querySelector('.logo h1').textContent = settings.siteTitle;
    alert('Settings saved successfully!');
}

function loadGeneralSettings() {
    document.getElementById('siteTitle').value = settings.siteTitle;
    document.getElementById('siteDescription').value = settings.siteDescription;
    document.getElementById('adminEmail').value = settings.adminEmail || '';
    document.getElementById('analyticsId').value = settings.analyticsId || '';
}

// Render Content
function renderContent() {
    renderFeaturedStory();
    renderNewsGrid(newsData.slice(1, 7));
    renderTrendingTopics();
    renderAffiliateProducts();
    renderCategories();
    renderBreakingNews();
    renderAds();
}

function renderFeaturedStory() {
    const container = document.getElementById('featuredStory');
    if (newsData.length === 0) return;
    
    const featured = newsData[0];
    container.innerHTML = `
        <img src="${featured.image}" alt="${featured.title}">
        <div class="story-content">
            <span class="category-badge">${featured.category.toUpperCase()}</span>
            <h2>${featured.title}</h2>
            <div class="meta">
                <span><i data-lucide="calendar"></i> ${formatDate(featured.date)}</span>
                <span><i data-lucide="user"></i> ${featured.source}</span>
            </div>
            <p class="excerpt">${featured.excerpt}</p>
        </div>
    `;
    lucide.createIcons();
}

function renderNewsGrid(articles) {
    const container = document.getElementById('newsGrid');
    container.innerHTML = '';
    
    articles.forEach(news => {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.innerHTML = `
            <img src="${news.image}" alt="${news.title}">
            <div class="card-content">
                <span class="category-badge">${news.category.toUpperCase()}</span>
                <h3>${news.title}</h3>
                <p class="excerpt">${news.excerpt}</p>
                <div class="meta">
                    <span>${formatDate(news.date)}</span>
                    <span>${news.source}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderTrendingTopics() {
    const container = document.getElementById('trendingTopics');
    const trending = newsData.slice(0, 5);
    
    container.innerHTML = '';
    trending.forEach((news, index) => {
        const item = document.createElement('div');
        item.className = 'trending-item';
        item.innerHTML = `
            <div class="number">${index + 1}</div>
            <div class="title">${news.title}</div>
        `;
        container.appendChild(item);
    });
}

function renderAffiliateProducts() {
    const container = document.getElementById('affiliateProducts');
    container.innerHTML = '';
    
    affiliateProducts.slice(0, 4).forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h4>${product.name}</h4>
            <div class="price">${product.price}</div>
            <p class="description">${product.description}</p>
            <a href="${product.link}" target="_blank" rel="nofollow noopener" class="buy-btn">
                View Product
            </a>
        `;
        container.appendChild(card);
    });
}

function renderCategories() {
    const container = document.getElementById('categoryList');
    const categories = {
        'usa': 0, 'india': 0, 'china': 0, 'russia': 0,
        'europe': 0, 'asia': 0, 'world': 0, 'tech': 0, 'business': 0
    };
    
    newsData.forEach(news => {
        if (categories[news.category] !== undefined) {
            categories[news.category]++;
        }
    });
    
    container.innerHTML = '';
    Object.entries(categories).forEach(([cat, count]) => {
        const item = document.createElement('li');
        item.innerHTML = `
            <a href="#" data-category="${cat}">
                ${cat.toUpperCase()}
                <span class="count">${count}</span>
            </a>
        `;
        item.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            filterByCategory(cat);
        });
        container.appendChild(item);
    });
}

function renderBreakingNews() {
    const container = document.getElementById('breakingNews');
    if (newsData.length > 0) {
        const breaking = newsData.slice(0, 3).map(n => n.title).join(' • ');
        container.textContent = breaking;
    }
}

// Filter and Search
function filterByCategory(category) {
    if (category === 'all') {
        renderNewsGrid(newsData.slice(1, 7));
    } else {
        const filtered = newsData.filter(news => news.category === category);
        renderNewsGrid(filtered);
    }
}

function searchNews(query) {
    if (!query) {
        renderNewsGrid(newsData.slice(1, 7));
        return;
    }
    
    const results = newsData.filter(news => 
        news.title.toLowerCase().includes(query.toLowerCase()) ||
        news.content.toLowerCase().includes(query.toLowerCase())
    );
    renderNewsGrid(results);
}

// Utilities
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    
    return date.toLocaleDateString();
}

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
}

// Local Storage
function saveToLocalStorage() {
    localStorage.setItem('newsData', JSON.stringify(newsData));
    localStorage.setItem('affiliateProducts', JSON.stringify(affiliateProducts));
    localStorage.setItem('settings', JSON.stringify(settings));
}

function loadFromLocalStorage() {
    const savedNews = localStorage.getItem('newsData');
    const savedProducts = localStorage.getItem('affiliateProducts');
    const savedSettings = localStorage.getItem('settings');
    
    if (savedNews) newsData = JSON.parse(savedNews);
    if (savedProducts) affiliateProducts = JSON.parse(savedProducts);
    if (savedSettings) settings = { ...settings, ...JSON.parse(savedSettings) };
}

// Sample Data
function loadSampleData() {
    if (newsData.length === 0) {
        newsData = [
            {
                id: Date.now() - 1,
                title: 'Major Tech Breakthrough: AI System Achieves Human-Level Understanding',
                category: 'tech',
                image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
                content: 'In a groundbreaking development, researchers have announced a new AI system that demonstrates unprecedented levels of comprehension and reasoning. This breakthrough could revolutionize industries from healthcare to education, marking a significant milestone in artificial intelligence development.',
                excerpt: 'Researchers announce breakthrough AI system with human-level comprehension capabilities...',
                source: 'Tech Today',
                date: new Date(Date.now() - 3600000).toISOString()
            },
            {
                id: Date.now() - 2,
                title: 'Global Climate Summit Reaches Historic Agreement',
                category: 'world',
                image: 'https://images.unsplash.com/photo-1569163139394-de4798aa62b5?w=800',
                content: 'World leaders have reached a landmark agreement on climate action, committing to ambitious carbon reduction targets. The agreement includes specific commitments from major economies and provisions for supporting developing nations in their transition to renewable energy.',
                excerpt: 'World leaders commit to ambitious new climate targets in historic agreement...',
                source: 'Global News',
                date: new Date(Date.now() - 7200000).toISOString()
            },
            {
                id: Date.now() - 3,
                title: 'Stock Markets Rally as Economic Indicators Show Strong Growth',
                category: 'business',
                image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
                content: 'Major stock indices reached new highs today as positive economic data reinforced investor confidence. The rally was driven by strong earnings reports and improving employment figures, signaling robust economic recovery.',
                excerpt: 'Markets surge to record highs on positive economic data and earnings reports...',
                source: 'Financial Times',
                date: new Date(Date.now() - 10800000).toISOString()
            },
            {
                id: Date.now() - 4,
                title: 'India Launches Revolutionary Space Mission to Study Solar Corona',
                category: 'india',
                image: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800',
                content: 'The Indian Space Research Organisation (ISRO) successfully launched its most ambitious solar mission aimed at studying the sun\'s corona. This mission positions India among the elite nations conducting cutting-edge space research.',
                excerpt: 'ISRO launches groundbreaking solar observation mission...',
                source: 'Space News India',
                date: new Date(Date.now() - 14400000).toISOString()
            },
            {
                id: Date.now() - 5,
                title: 'US Unveils Infrastructure Plan for Sustainable Cities',
                category: 'usa',
                image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
                content: 'The Biden administration announced a comprehensive infrastructure initiative focused on creating sustainable, smart cities. The plan includes significant investments in public transportation, renewable energy infrastructure, and digital connectivity.',
                excerpt: 'New federal initiative aims to transform American cities with sustainable infrastructure...',
                source: 'Washington Post',
                date: new Date(Date.now() - 18000000).toISOString()
            },
            {
                id: Date.now() - 6,
                title: 'China Announces Major Renewable Energy Expansion',
                category: 'china',
                image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800',
                content: 'China revealed plans to dramatically increase its renewable energy capacity, with massive investments in solar and wind power. The initiative is part of the country\'s commitment to achieving carbon neutrality by 2060.',
                excerpt: 'Beijing commits to massive expansion of clean energy infrastructure...',
                source: 'Asian Economics',
                date: new Date(Date.now() - 21600000).toISOString()
            },
            {
                id: Date.now() - 7,
                title: 'European Union Introduces Digital Privacy Regulations',
                category: 'europe',
                image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800',
                content: 'The EU has passed comprehensive digital privacy legislation that sets new global standards for data protection. The regulations will affect how tech companies operate worldwide and handle user information.',
                excerpt: 'New EU regulations set global benchmark for digital privacy protection...',
                source: 'Euro News',
                date: new Date(Date.now() - 25200000).toISOString()
            }
        ];
        
        affiliateProducts = [
            {
                id: Date.now() - 101,
                name: 'Premium Noise Cancelling Headphones',
                image: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=300',
                price: '$299.99',
                link: 'https://amazon.com',
                description: 'Industry-leading noise cancellation with superior sound quality',
                category: 'electronics'
            },
            {
                id: Date.now() - 102,
                name: 'Smart Fitness Tracker Watch',
                image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
                price: '$199.99',
                link: 'https://amazon.com',
                description: 'Track your health and fitness goals with advanced sensors',
                category: 'electronics'
            },
            {
                id: Date.now() - 103,
                name: 'Professional Camera Kit',
                image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300',
                price: '$1,299.99',
                link: 'https://amazon.com',
                description: 'Complete camera setup for professional photography',
                category: 'electronics'
            },
            {
                id: Date.now() - 104,
                name: 'Bestselling Business Book',
                image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=300',
                price: '$24.99',
                link: 'https://amazon.com',
                description: 'Transform your business with proven strategies',
                category: 'books'
            }
        ];
        
        saveToLocalStorage();
    }
}
