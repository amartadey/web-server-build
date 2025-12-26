// ===================================
// Navigation Toggle (Mobile)
// ===================================
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// ===================================
// Smooth Scroll for Anchor Links
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navbarHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ===================================
// Active Navigation on Scroll
// ===================================
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a');

    let current = '';
    const navbarHeight = document.querySelector('.navbar').offsetHeight;

    sections.forEach(section => {
        const sectionTop = section.offsetTop - navbarHeight - 100;
        const sectionHeight = section.offsetHeight;

        if (window.pageYOffset >= sectionTop &&
            window.pageYOffset < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ===================================
// Intersection Observer for Animations
// ===================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards and sections
const animatedElements = document.querySelectorAll('.feature-card, .step-item, .info-card, .stat-card');
animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
});

// ===================================
// Copy Code Functionality
// ===================================
function addCopyButtons() {
    const codeBlocks = document.querySelectorAll('pre code');

    codeBlocks.forEach(block => {
        const pre = block.parentElement;
        const wrapper = document.createElement('div');
        wrapper.className = 'code-wrapper';

        const copyButton = document.createElement('button');
        copyButton.className = 'copy-btn';
        copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy';

        copyButton.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(block.textContent);
                copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
                copyButton.classList.add('copied');

                setTimeout(() => {
                    copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy';
                    copyButton.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        });

        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
        wrapper.appendChild(copyButton);
    });
}

// Call on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addCopyButtons);
} else {
    addCopyButtons();
}

// ===================================
// Search Functionality
// ===================================
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (!searchInput || !searchResults) return;

    let searchIndex = [];

    // Build search index
    const contentElements = document.querySelectorAll('h1, h2, h3, h4, p, li');
    contentElements.forEach((el, index) => {
        const text = el.textContent.trim();
        if (text.length > 0) {
            searchIndex.push({
                id: index,
                text: text,
                element: el,
                type: el.tagName.toLowerCase()
            });
        }
    });

    // Search function
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        if (query.length < 2) {
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
            return;
        }

        const results = searchIndex.filter(item =>
            item.text.toLowerCase().includes(query)
        ).slice(0, 10);

        if (results.length > 0) {
            searchResults.innerHTML = results.map(result => {
                const highlightedText = result.text.replace(
                    new RegExp(query, 'gi'),
                    match => `<mark>${match}</mark>`
                );

                return `
                    <div class="search-result-item" data-id="${result.id}">
                        <span class="result-type">${result.type}</span>
                        <span class="result-text">${highlightedText}</span>
                    </div>
                `;
            }).join('');

            searchResults.style.display = 'block';

            // Add click handlers
            document.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const id = item.getAttribute('data-id');
                    const element = searchIndex[id].element;
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    searchResults.style.display = 'none';
                    searchInput.value = '';
                });
            });
        } else {
            searchResults.innerHTML = '<div class="no-results">No results found</div>';
            searchResults.style.display = 'block';
        }
    });

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

// Initialize search on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
} else {
    initSearch();
}

// ===================================
// Progress Bar
// ===================================
function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    if (!progressBar) return;

    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
    progressBar.style.width = `${scrollPercentage}%`;
}

window.addEventListener('scroll', updateProgressBar);
window.addEventListener('resize', updateProgressBar);

// ===================================
// Table of Contents Generator
// ===================================
function generateTOC() {
    const tocContainer = document.getElementById('tableOfContents');
    if (!tocContainer) return;

    const headings = document.querySelectorAll('h2, h3');
    if (headings.length === 0) return;

    const tocList = document.createElement('ul');
    tocList.className = 'toc-list';

    headings.forEach((heading, index) => {
        // Add ID if doesn't exist
        if (!heading.id) {
            heading.id = `heading-${index}`;
        }

        const li = document.createElement('li');
        li.className = `toc-item toc-${heading.tagName.toLowerCase()}`;

        const link = document.createElement('a');
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent;

        li.appendChild(link);
        tocList.appendChild(li);
    });

    tocContainer.appendChild(tocList);
}

// Generate TOC on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', generateTOC);
} else {
    generateTOC();
}

// ===================================
// Dark/Light Mode Toggle (Optional)
// ===================================
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);

    themeToggle.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme');
        const newTheme = theme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        themeToggle.innerHTML = newTheme === 'dark'
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
    });
}

// Initialize theme toggle
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggle);
} else {
    initThemeToggle();
}

// ===================================
// Update Current Year in Footer
// ===================================
const yearElement = document.getElementById('currentYear');
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

// ===================================
// Keyboard Navigation
// ===================================
document.addEventListener('keydown', (e) => {
    // Escape key closes mobile menu
    if (e.key === 'Escape') {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        if (navToggle && navMenu) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    }

    // Ctrl/Cmd + K opens search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
        }
    }
});

// ===================================
// Print Styles Helper
// ===================================
window.addEventListener('beforeprint', () => {
    // Expand all collapsed sections before printing
    const collapsibles = document.querySelectorAll('.collapsible');
    collapsibles.forEach(el => {
        el.classList.add('expanded');
    });
});

// ===================================
// Performance: Lazy Load Images
// ===================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===================================
// Console Welcome Message
// ===================================
console.log('%c🚀 Server Rebuild Guide', 'font-size: 20px; font-weight: bold; color: #6366f1;');
console.log('%cWelcome to the interactive guide!', 'font-size: 14px; color: #94a3b8;');
console.log('%cIf you find any issues, please report them.', 'font-size: 12px; color: #94a3b8;');
