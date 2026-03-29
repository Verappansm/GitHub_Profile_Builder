let state = {
    name: '',
    tagline: '',
    aboutme: '',
    work_project: '', work_link: '',
    collab_project: '', collab_link: '',
    help_project: '', help_link: '',
    learning: '',
    askme: '',
    reachme: '',
    projects_url: '',
    blog_url: '',
    resume_url: '',
    funfact: '',
    github: '',
    theme: 'tokyonight',
    stats: { profile: true, topLang: true, streak: true },
    addons: {
        visitors: false,
        trophy: false,
        stats: false,
        skills: false,
        streak: false,
        twitter: false,
        blog_devto: false,
        blog_medium: false
    },
    socials: {
        twitter: '', linkedin: '', instagram: '', youtube: '',
        stackoverflow: '', medium: '',
        kaggle: '', leetcode: '', codechef: '',
        codeforces: '', hackerrank: '', discord: '', quora: ''
    },
    socialStyle: 'badges',
    selectedTech: [],
    activeTab: 'preview',
    searchQuery: ''
};

function init() {
    renderTechStack();
    setupEventListeners();
    updateOutput();
}

function renderTechStack() {
    const container = document.getElementById('techStackContainer');
    container.innerHTML = '';
    renderSelectedTechBar();
    const categories = [...new Set(TECH_STACK.map(item => item.category))];
    categories.forEach(cat => {
        const filteredTech = TECH_STACK.filter(tech => tech.category === cat && tech.name.toLowerCase().includes(state.searchQuery.toLowerCase()));
        if (filteredTech.length === 0) return;
        const catIds = filteredTech.map(t => t.id);
        const allSelected = catIds.every(id => state.selectedTech.includes(id));
        const catSection = document.createElement('div');
        catSection.className = 'tech-category';
        catSection.innerHTML = `
            <div class="tech-category-header">
                <h3>${cat}</h3>
                <div class="tech-category-actions">
                    <button type="button" data-action="select-all">${allSelected ? '✓ All' : 'Select All'}</button>
                    <button type="button" data-action="clear-all">Clear</button>
                </div>
            </div>
            <div class="tech-grid"></div>`;
        catSection.querySelector('[data-action="select-all"]').onclick = () => {
            catIds.forEach(id => { if (!state.selectedTech.includes(id)) state.selectedTech.push(id); });
            renderTechStack(); updateOutput();
        };
        catSection.querySelector('[data-action="clear-all"]').onclick = () => {
            state.selectedTech = state.selectedTech.filter(id => !catIds.includes(id));
            renderTechStack(); updateOutput();
        };
        const grid = catSection.querySelector('.tech-grid');
        filteredTech.forEach(tech => {
            const item = document.createElement('div');
            item.className = `tech-item ${state.selectedTech.includes(tech.id) ? 'selected' : ''}`;

            let iconUrl = tech.customIconUrl;
            if (!iconUrl) {
                if (tech.id === 'amazonaws') {
                    iconUrl = `https://cdn.simpleicons.org/amazonwebservices/white`;
                } else if (tech.id === 'django') {
                    iconUrl = `https://cdn.simpleicons.org/django/white`;
                } else {
                    iconUrl = `https://raw.githubusercontent.com/devicons/devicon/master/icons/${tech.icon}/${tech.icon}-original.svg`;
                }
            }

            item.innerHTML = `<img src="${iconUrl}" onerror="this.src='https://cdn.simpleicons.org/${tech.id}/white'" alt="${tech.name}" title="${tech.name}"><span>${tech.name}</span>`;
            item.onclick = () => toggleTech(tech.id);
            grid.appendChild(item);
        });
        container.appendChild(catSection);
    });
}

function toggleTech(id) {
    const idx = state.selectedTech.indexOf(id);
    if (idx !== -1) state.selectedTech.splice(idx, 1);
    else state.selectedTech.push(id);
    renderTechStack();
    updateOutput();
}

function setupEventListeners() {
    const toggleBtn = document.getElementById('togglePreview');
    const toggleDarkBtn = document.getElementById('toggleDarkMode');
    const skillsSearch = document.getElementById('skillsSearch');

    // Initialize dark mode from localStorage
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.body.setAttribute('data-theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        document.body.setAttribute('data-theme', 'light');
    }

    // Dark mode toggle
    if (toggleDarkBtn) {
        toggleDarkBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isDark = document.body.classList.toggle('dark-mode');
            
            // Also set data attribute
            if (isDark) {
                document.body.setAttribute('data-theme', 'dark');
                localStorage.setItem('darkMode', 'true');
            } else {
                document.body.setAttribute('data-theme', 'light');
                localStorage.setItem('darkMode', 'false');
            }
        });
    }

    const basicInputs = ['name', 'tagline', 'aboutme', 'work_project', 'work_link', 'collab_project', 'collab_link', 'help_project', 'help_link', 'learning', 'askme', 'reachme', 'projects_url', 'blog_url', 'resume_url', 'funfact', 'github', 'theme'];
    basicInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', (e) => { state[id] = e.target.value; updateOutput(); });
    });

    const checkboxes = ['profile_stats', 'top_lang', 'streak'];
    checkboxes.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', (e) => {
            if (id === 'profile_stats') state.stats.profile = e.target.checked;
            if (id === 'top_lang') state.stats.topLang = e.target.checked;
            if (id === 'streak') state.stats.streak = e.target.checked;
            updateOutput();
        });
    });

    const addons = ['visitors', 'trophy', 'stats', 'skills', 'streak', 'twitter', 'blog_devto', 'blog_medium'];
    addons.forEach(id => {
        const el = document.getElementById(`addon_${id}`);
        if (el) el.addEventListener('change', (e) => { state.addons[id] = e.target.checked; updateOutput(); });
    });

    const socials = ['twitter', 'linkedin', 'instagram', 'youtube', 'devto', 'codepen', 'codesandbox', 'stackoverflow', 'medium', 'kaggle', 'leetcode', 'codechef', 'codeforces', 'hackerrank', 'discord', 'quora', 'rss'];
    socials.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', (e) => { state.socials[id] = e.target.value; updateOutput(); });
    });

    const socialStyle = document.getElementById('socialStyle');
    if (socialStyle) {
        socialStyle.addEventListener('change', (e) => {
            state.socialStyle = e.target.value;
            updateOutput();
        });
    }

    if (toggleBtn) toggleBtn.addEventListener('click', () => {
        const app = document.getElementById('app');
        const resizer = document.getElementById('resizer');
        const sidebar = document.querySelector('.sidebar');
        const previewArea = document.querySelector('.preview-area');

        app.classList.toggle('preview-hidden');
        const isHidden = app.classList.contains('preview-hidden');
        toggleBtn.textContent = isHidden ? 'View Preview' : 'Close Preview';

        if (resizer) resizer.style.display = isHidden ? 'none' : 'block';

        if (isHidden) {
            sidebar.style.width = '';
            previewArea.style.width = '';
        } else {
            // Restore default 50/50 when opening
            sidebar.style.width = '50%';
            previewArea.style.width = '50%';
        }
    });

    if (skillsSearch) {
        skillsSearch.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            renderTechStack();
        });
    }

    // Resizer Logic
    const resizer = document.getElementById('resizer');
    const sidebar = document.querySelector('.sidebar');
    const previewArea = document.querySelector('.preview-area');
    let isResizing = false;

    if (resizer) {
        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            resizer.classList.add('dragging');
            document.body.style.cursor = 'col-resize';
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', stopResizing);
        });
    }

    function handleMouseMove(e) {
        if (!isResizing) return;
        const containerWidth = document.getElementById('app').offsetWidth;
        const newSidebarWidth = (e.clientX / containerWidth) * 100;

        if (newSidebarWidth > 20 && newSidebarWidth < 80) {
            sidebar.style.width = `${newSidebarWidth}%`;
            previewArea.style.width = `${100 - newSidebarWidth}%`;
        }
    }

    function stopResizing() {
        isResizing = false;
        resizer.classList.remove('dragging');
        document.body.style.cursor = 'default';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', stopResizing);
    }

    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            state.activeTab = tab.dataset.tab;
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('previewPane').style.display = state.activeTab === 'preview' ? 'block' : 'none';
            document.getElementById('codePane').style.display = state.activeTab === 'code' ? 'block' : 'none';
        });
    });

    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) copyBtn.addEventListener('click', () => {
        const code = generateMarkdown();
        navigator.clipboard.writeText(code);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = 'Copy Code', 2000);
    });
}

function generateMarkdown() {
    let md = `# Hi 👋, I'm ${state.name || 'Your Name'}\n`;
    md += `\n<h4>${state.tagline || 'A passionate developer from India'}</h4>\n\n`;

    if (state.aboutme) {
        md += `\n${state.aboutme}\n\n`;
    }

    if (state.addons.visitors && state.github) {
        md += `<p align="left"><img src="https://komarev.com/ghpvc/?username=${state.github}&label=Profile%20views&color=0e75b6&style=flat" alt="${state.github}" /></p>\n\n`;
    }

    let aboutMd = '';
    if (state.work_project) aboutMd += `\n - 🔭 I’m currently working on [${state.work_project}](${state.work_link || '#'})\n`;
    if (state.learning) aboutMd += `\n - 🌱 I’m currently learning **${state.learning}**\n`;
    if (state.collab_project) aboutMd += `\n - 👯 I’m looking to collaborate on [${state.collab_project}](${state.collab_link || '#'})\n`;
    if (state.help_project) aboutMd += `\n - 🤝 I’m looking for help with [${state.help_project}](${state.help_link || '#'})\n`;
    if (state.askme) aboutMd += `\n - 💬 Ask me about **${state.askme}**\n`;
    if (state.reachme) aboutMd += `\n - 📫 How to reach me **${state.reachme}**\n`;
    if (state.projects_url) aboutMd += `\n - 👨‍💻 All of my projects are available at [${state.projects_url}](${state.projects_url})\n`;
    if (state.blog_url) aboutMd += `\n - 📝 I regularly write articles on [${state.blog_url}](${state.blog_url})\n`;
    if (state.resume_url) aboutMd += `\n - 📄 Know about my experiences [${state.resume_url}](${state.resume_url})\n`;
    if (state.funfact) aboutMd += `\n - ⚡ Fun fact **${state.funfact}**\n`;
    if (aboutMd) md += aboutMd + '\n';

    if (state.selectedTech.length > 0) {
        md += `\n\n<h3 align="left">Languages and Tools:</h3>\n\n<p align="left"> `;
        state.selectedTech.forEach(id => {
            const tech = TECH_STACK.find(t => t.id === id);
            if (tech) {
                let iconUrl = tech.customIconUrl;
                if (!iconUrl) {
                    if (tech.id === 'amazonaws') {
                        iconUrl = `https://cdn.simpleicons.org/amazonwebservices/white`;
                    } else if (tech.id === 'django') {
                        iconUrl = `https://cdn.simpleicons.org/django/white`;
                    } else {
                        iconUrl = `https://raw.githubusercontent.com/devicons/devicon/master/icons/${tech.icon}/${tech.icon}-original.svg`;
                    }
                }
                const link = tech.link || '#';
                md += `<a href="${link}" target="_blank" rel="noreferrer"><img src="${iconUrl}" onerror="this.src='https://cdn.simpleicons.org/${tech.id}/white'" alt="${tech.id}" title="${tech.name}" width="40" height="40"/></a>`;
            }
        });
        md += `</p>\n\n`;
    }

    const connectPlatforms = ['twitter', 'linkedin', 'instagram', 'youtube'];
    const activeSocials = Object.entries(state.socials).filter(([_, user]) => user);

    if (activeSocials.length > 0) {
        const connectWithMe = activeSocials.filter(([p]) => connectPlatforms.includes(p));
        const checkMyWork = activeSocials.filter(([p]) => !connectPlatforms.includes(p));

        if (connectWithMe.length > 0) {
            md += `\n\n<h3 align="left">Connect with me:</h3>\n\n<p align="left">\n`;
            connectWithMe.forEach(([platform, user]) => {
                md += renderSocialLink(platform, user);
            });
            md += `\n</p>\n\n`;
        }

        if (checkMyWork.length > 0) {
            md += `\n\n<h3 align="left">Check my work:</h3>\n\n<p align="left">\n`;
            checkMyWork.forEach(([platform, user]) => {
                md += renderSocialLink(platform, user);
            });
            md += `\n</p>\n\n`;
        }
    }

    // GitHub Dashboard stuff at the end
    if (state.github) {
        let statsMd = '';
        if (state.addons.trophy) {
            statsMd += `<p align="left"><a href="https://github.com/ryo-ma/github-profile-trophy"><img src="https://github-profile-trophy.vercel.app/?username=${state.github}&theme=${state.theme}" alt="${state.github}" /></a></p>\n\n`;
        }
        if (state.stats.topLang) statsMd += `<p align="left"><img src="https://github-readme-stats.zcy.dev/api/top-langs?username=${state.github}&show_icons=true&locale=en&layout=compact&theme=${state.theme}" alt="${state.github}" /></p>\n\n`;
        if (state.stats.profile) statsMd += `<p align="left"><img src="https://github-readme-stats.zcy.dev/api?username=${state.github}&show_icons=true&theme=${state.theme}" alt="${state.github}" /></p>\n\n`;
        if (state.stats.streak) statsMd += `<p align="left"><img src="https://github-readme-streak-stats.herokuapp.com/?user=${state.github}&theme=${state.theme}" alt="${state.github}" /></p>\n\n`;

        if (statsMd) md += `\n\n` + statsMd;
    }

    return md;
}

const SOCIAL_COLORS = {
    twitter: '1DA1F2', linkedin: '0077B5', instagram: 'E4405F', youtube: 'FF0000',
    stackoverflow: 'FE7A15', medium: '12100E', kaggle: '20BEFF',
    leetcode: 'FFA116', codechef: '5B4638', codeforces: '1F8ACB',
    hackerrank: '2EC866', discord: '5865F2', quora: 'B92B27',
    devto: '0A0A0A', codepen: '000000', codesandbox: '000000', rss: 'FFA500'
};

function renderSocialLink(platform, user) {
    const urlMap = {
        twitter: `https://twitter.com/${user}`,
        linkedin: `https://linkedin.com/in/${user}`,
        instagram: `https://instagram.com/${user}`,
        youtube: `https://www.youtube.com/${user}`,
        devto: `https://dev.to/${user}`,
        codepen: `https://codepen.io/${user}`,
        codesandbox: `https://codesandbox.io/u/${user}`,
        stackoverflow: `https://stackoverflow.com/users/${user}`,
        medium: `https://medium.com/@${user}`,
        kaggle: `https://kaggle.com/${user}`,
        leetcode: `https://leetcode.com/${user}`,
        codechef: `https://codechef.com/users/${user}`,
        codeforces: `https://codeforces.com/profile/${user}`,
        hackerrank: `https://hackerrank.com/${user}`,
        discord: `https://discord.gg/${user}`,
        quora: `https://quora.com/profile/${user}`,
        rss: user
    };

    const url = urlMap[platform];
    const color = SOCIAL_COLORS[platform] || '1E3233';
    let logo = platform === 'twitter' ? 'x' : platform;
    if (platform === 'devto') logo = 'devdotto';

    if (state.socialStyle === 'icons') {
        const iconUrl = platform === 'linkedin'
            ? 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg'
            : `https://cdn.simpleicons.org/${logo}/${color}`;
        return `<a href="${url}" target="blank"><img src="${iconUrl}" alt="${platform}" title="${platform}" height="40" width="40" /></a>&nbsp;`;
    } else {
        return `<a href="${url}" target="blank"><img src="https://img.shields.io/badge/${platform}-%23${color}.svg?style=for-the-badge&logo=${logo}&logoColor=white" alt="${platform}" /></a>&nbsp;`;
    }
}

function updateOutput() {
    const md = generateMarkdown();
    const codePane = document.getElementById('markdownOutput');
    if (codePane) codePane.textContent = md;

    // Better preview rendering to mimic GitHub spacing
    let html = md
        .replace(/#### (.*)/g, '<h4>$1</h4>')
        .replace(/### (.*)/g, '<h3>$1</h3>')
        .replace(/## (.*)/g, '<h2>$1</h2>')
        .replace(/# (.*)/g, '<h1>$1</h1>')
        .replace(/\n\n\n/g, '<p style="margin-bottom: 32px;"></p>') // Handle triple newlines as large gaps
        .replace(/\n\n/g, '<p></p>')
        .replace(/\n/g, '<br>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Clean up produced fragments
    html = html.replace(/<a(.*?)><br>/g, '<a$1>')
        .replace(/<br><\/a>/g, '</a>');

    const previewPane = document.getElementById('previewPane');
    if (previewPane) previewPane.innerHTML = html;
}

// ===== NEW FEATURES =====

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Progress Indicator
function updateProgress() {
    let filled = 0;
    let total = 0;
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        total++;
        if (input.type === 'checkbox') {
            if (input.checked) filled++;
        } else if (input.value.trim() !== '') {
            filled++;
        }
    });
    const percentage = Math.round((filled / total) * 100);
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    if (progressFill) progressFill.style.width = percentage + '%';
    if (progressText) progressText.textContent = percentage + '% Complete';
}

// Collapsible Sections
function setupCollapsibleSections() {
    const collapseBtns = document.querySelectorAll('.collapse-btn');
    collapseBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const section = btn.closest('.config-section');
            const content = section.querySelector('.section-content');
            const isExpanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', !isExpanded);
            content.classList.toggle('collapsed');
        });
    });
}

// Section Navigation
function setupSectionNav() {
    const navItems = document.querySelectorAll('.nav-item-inline');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const section = document.getElementById(item.dataset.section);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Copy to Clipboard
function setupCopyButton() {
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const markdown = document.getElementById('markdownOutput').textContent;
            navigator.clipboard.writeText(markdown)
                .then(() => showNotification('Markdown copied to clipboard!'))
                .catch(() => showNotification('Failed to copy', 'error'));
        });
    }
}

// Download as File
function setupDownloadButton() {
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const markdown = document.getElementById('markdownOutput').textContent;
            const blob = new Blob([markdown], { type: 'text/markdown' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'README.md';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showNotification('README.md downloaded!');
        });
    }
}

// Reset Button
function setupResetButton() {
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all fields?')) {
                document.getElementById('readmeForm').reset();
                state.selectedTech = [];
                renderTechStack();
                updateOutput();
                updateProgress();
                localStorage.removeItem('readmeGenerator');
                showNotification('All fields cleared!');
            }
        });
    }
}

// Templates
const TEMPLATES = {
    frontend: {
        name: 'John Doe',
        tagline: 'Passionate Frontend Developer 💻',
        aboutme: 'I create beautiful and responsive web interfaces.',
        learning: 'React, Next.js, TypeScript',
        askme: 'React, Vue, CSS, JavaScript',
        reachme: 'john@example.com'
    },
    fullstack: {
        name: 'Jane Developer',
        tagline: 'Full Stack Developer ⚡',
        aboutme: 'Building end-to-end web solutions.',
        learning: 'Node.js, Docker, Kubernetes',
        askme: 'JavaScript, Python, Docker',
        reachme: 'jane@example.com'
    },
    datascience: {
        name: 'Data Scientist',
        tagline: 'Data Science & ML Engineer 📊',
        aboutme: 'Turning data into insights.',
        learning: 'TensorFlow, PyTorch, sklearn',
        askme: 'Python, ML, Data Analysis',
        reachme: 'ds@example.com'
    },
    devops: {
        name: 'DevOps Engineer',
        tagline: 'Cloud & Infrastructure Expert 🏗️',
        aboutme: 'Building scalable infrastructure.',
        learning: 'Kubernetes, AWS, Terraform',
        askme: 'Docker, CI/CD, AWS',
        reachme: 'devops@example.com'
    },
    designer: {
        name: 'UI/UX Designer',
        tagline: 'Creative Designer 🎨',
        aboutme: 'Designing beautiful user experiences.',
        learning: 'Figma, Design Systems, Animation',
        askme: 'UI Design, UX, Prototyping',
        reachme: 'designer@example.com'
    }
};

function setupTemplates() {
    const templatesBtn = document.getElementById('templatesBtn');
    const templatesModal = document.getElementById('templatesModal');
    const templateBtns = document.querySelectorAll('.template-btn');
    const modalClose = document.querySelector('.modal-close');

    if (templatesBtn) {
        templatesBtn.addEventListener('click', () => {
            templatesModal.style.display = 'flex';
        });
    }

    if (modalClose) {
        modalClose.addEventListener('click', () => {
            templatesModal.style.display = 'none';
        });
    }

    templatesModal.addEventListener('click', (e) => {
        if (e.target === templatesModal) {
            templatesModal.style.display = 'none';
        }
    });

    templateBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const template = btn.dataset.template;
            if (template === 'clear') {
                document.getElementById('readmeForm').reset();
                state.selectedTech = [];
            } else {
                const data = TEMPLATES[template];
                Object.keys(data).forEach(key => {
                    const el = document.getElementById(key);
                    if (el) el.value = data[key];
                    state[key] = data[key];
                });
                renderTechStack();
            }
            updateOutput();
            updateProgress();
            templatesModal.style.display = 'none';
            showNotification('Template loaded!');
        });
    });
}

// Auto-save to localStorage
function autoSave() {
    const data = {
        state: {
            name: state.name,
            tagline: state.tagline,
            aboutme: state.aboutme,
            work_project: state.work_project,
            work_link: state.work_link,
            collab_project: state.collab_project,
            collab_link: state.collab_link,
            help_project: state.help_project,
            help_link: state.help_link,
            learning: state.learning,
            askme: state.askme,
            reachme: state.reachme,
            projects_url: state.projects_url,
            blog_url: state.blog_url,
            resume_url: state.resume_url,
            funfact: state.funfact,
            github: state.github,
            theme: state.theme,
            socialStyle: state.socialStyle,
            stats: state.stats,
            addons: state.addons,
            socials: state.socials,
            selectedTech: [...state.selectedTech]
        }
    };
    localStorage.setItem('readmeGenerator', JSON.stringify(data));
}

// Load from localStorage
function loadSavedData() {
    const saved = localStorage.getItem('readmeGenerator');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            Object.assign(state, data.state);
            state.selectedTech = data.state.selectedTech || [];
            // Populate form
            Object.keys(data.state).forEach(key => {
                if (key !== 'selectedTech' && key !== 'stats' && key !== 'addons' && key !== 'socials') {
                    const el = document.getElementById(key);
                    if (el) el.value = data.state[key];
                }
            });
            Object.keys(data.state.stats || {}).forEach(key => {
                const el = document.getElementById(key === 'profile' ? 'profile_stats' : key === 'topLang' ? 'top_lang' : 'streak');
                if (el) el.checked = data.state.stats[key];
            });
            Object.keys(data.state.socials || {}).forEach(key => {
                const el = document.getElementById(key);
                if (el) el.value = data.state.socials[key];
            });
        } catch (e) {
            console.error('Failed to load saved data');
        }
    }
}

// Keyboard Shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'c' && e.shiftKey) {
                e.preventDefault();
                document.getElementById('copyBtn').click();
            } else if (e.key === 's') {
                e.preventDefault();
                autoSave();
                showNotification('Manually saved!');
            }
        }
    });
}

// Split View
function setupSplitView() {
    const splitCheckbox = document.getElementById('splitView');
    if (splitCheckbox) {
        splitCheckbox.addEventListener('change', () => {
            document.body.classList.toggle('split-view');
            const app = document.getElementById('app');
            if (document.body.classList.contains('split-view')) {
                app.classList.remove('preview-hidden');
                splitCheckbox.checked = true;
            }
        });
    }
}

// Initialize new features in setupEventListeners
const originalSetupEventListeners = setupEventListeners;
setupEventListeners = function() {
    originalSetupEventListeners.call(this);
    setupCollapsibleSections();
    setupSectionNav();
    setupCopyButton();
    setupDownloadButton();
    setupResetButton();
    setupTemplates();
    setupKeyboardShortcuts();
    setupSplitView();
    loadSavedData();
    updateProgress();
    const form = document.getElementById('readmeForm');
    if (form) {
        form.addEventListener('change', updateProgress);
        form.addEventListener('input', () => {
            updateProgress();
            autoSave();
        });
    }
};

// ===== QUICK WIN FEATURES =====

// Selected Tech Reorder Bar
function renderSelectedTechBar() {
    const bar = document.getElementById('selectedTechBar');
    const list = document.getElementById('selectedTechList');
    if (!bar || !list) return;

    if (state.selectedTech.length === 0) {
        bar.style.display = 'none';
        return;
    }
    bar.style.display = 'block';
    list.innerHTML = '';

    state.selectedTech.forEach((id, index) => {
        const tech = TECH_STACK.find(t => t.id === id);
        if (!tech) return;
        const chip = document.createElement('span');
        chip.className = 'selected-tech-chip';
        chip.draggable = true;
        chip.dataset.index = index;

        let iconUrl = tech.customIconUrl;
        if (!iconUrl) {
            if (tech.id === 'amazonaws') iconUrl = 'https://cdn.simpleicons.org/amazonwebservices/white';
            else if (tech.id === 'django') iconUrl = 'https://cdn.simpleicons.org/django/white';
            else iconUrl = `https://raw.githubusercontent.com/devicons/devicon/master/icons/${tech.icon}/${tech.icon}-original.svg`;
        }

        chip.innerHTML = `<img src="${iconUrl}" alt="${tech.name}">${tech.name}<span class="chip-remove">&times;</span>`;

        chip.querySelector('.chip-remove').onclick = (e) => {
            e.stopPropagation();
            state.selectedTech.splice(index, 1);
            renderTechStack();
            updateOutput();
        };

        chip.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', index);
            chip.style.opacity = '0.5';
        });
        chip.addEventListener('dragend', () => { chip.style.opacity = '1'; });
        chip.addEventListener('dragover', (e) => { e.preventDefault(); chip.classList.add('drag-over'); });
        chip.addEventListener('dragleave', () => { chip.classList.remove('drag-over'); });
        chip.addEventListener('drop', (e) => {
            e.preventDefault();
            chip.classList.remove('drag-over');
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const toIndex = index;
            if (fromIndex === toIndex) return;
            const [moved] = state.selectedTech.splice(fromIndex, 1);
            state.selectedTech.splice(toIndex, 0, moved);
            renderTechStack();
            updateOutput();
        });

        list.appendChild(chip);
    });
}

// Character Counters
function setupCharCounters() {
    const fields = [
        { id: 'name', max: 50 },
        { id: 'tagline', max: 100 },
        { id: 'aboutme', max: 500 }
    ];
    fields.forEach(({ id, max }) => {
        const input = document.getElementById(id);
        const counter = document.getElementById(`${id}-counter`);
        if (!input || !counter) return;
        function update() {
            const len = input.value.length;
            counter.textContent = `${len} / ${max}`;
            counter.classList.remove('warning', 'limit');
            if (len >= max) counter.classList.add('limit');
            else if (len >= max * 0.8) counter.classList.add('warning');
        }
        input.addEventListener('input', update);
        update();
    });
}

// Scroll to Top + translucent header/info-row
function setupScrollToTop() {
    const btn = document.getElementById('scrollTopBtn');
    const form = document.getElementById('readmeForm');
    const topHeader = document.querySelector('.top-header');
    const infoRow = document.querySelector('.info-row');
    if (!btn || !form) return;

    form.addEventListener('scroll', () => {
        const scrolled = form.scrollTop > 100;
        if (topHeader) topHeader.classList.toggle('scrolled', scrolled);
        if (infoRow) infoRow.classList.toggle('scrolled', scrolled);

        if (form.scrollTop > 300) {
            btn.style.display = 'flex';
            requestAnimationFrame(() => btn.classList.add('visible'));
        } else {
            btn.classList.remove('visible');
            setTimeout(() => { if (!btn.classList.contains('visible')) btn.style.display = 'none'; }, 300);
        }
    });

    btn.addEventListener('click', () => {
        form.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Auto-save Toast
let autosaveToast = null;
function showAutosaveToast() {
    if (!autosaveToast) {
        autosaveToast = document.createElement('div');
        autosaveToast.className = 'autosave-toast';
        autosaveToast.textContent = 'Draft saved';
        document.body.appendChild(autosaveToast);
    }
    autosaveToast.classList.add('show');
    clearTimeout(autosaveToast._hideTimer);
    autosaveToast._hideTimer = setTimeout(() => autosaveToast.classList.remove('show'), 1500);
}

// Patch autoSave to show toast
const _originalAutoSave = autoSave;
autoSave = function() {
    _originalAutoSave();
    showAutosaveToast();
};

// Wire up new features after DOM ready
const _originalInit = init;
init = function() {
    _originalInit();
    setupCharCounters();
    setupScrollToTop();
};

init();
