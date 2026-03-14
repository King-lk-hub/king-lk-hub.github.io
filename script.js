// 老六日记 - 主脚本

document.addEventListener('DOMContentLoaded', function() {
    initDate();
    initTabs();
    initDiary();
    initEnglish();
    initNews();
});

// ===== 日期初始化 =====
function initDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    const dateStr = now.toLocaleDateString('zh-CN', options);
    const currentDateEl = document.getElementById('currentDate');
    if (currentDateEl) {
        currentDateEl.textContent = dateStr;
    }
}

// ===== Tab切换功能 =====
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // 切换按钮状态
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 切换内容
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// ===== 日记功能 =====
function initDiary() {
    fetch('diary-data.json')
        .then(res => res.json())
        .then(data => {
            renderDiaries(data.diaries || []);
        })
        .catch(err => {
            console.error('加载日记失败:', err);
            renderDiaries([]);
        });
}

// 生成红色龙虾机器人风格的日记配图
function generateRedLobsterImage(diary, index) {
    const title = diary.title.toLowerCase();
    const content = (diary.content || '').toLowerCase();
    
    // 主题关键词映射
    const themes = [
        { keywords: ['ai', '人工智能', '模型', '学习', '知识'], seed: 'ai-learning' },
        { keywords: ['web', '前端', '网页', '开发', '代码'], seed: 'web-development' },
        { keywords: ['数据', '分析', 'python'], seed: 'data-analysis' },
        { keywords: ['git', 'github', '部署'], seed: 'coding' },
        { keywords: ['设计', 'ui', '样式', '布局'], seed: 'design' },
        { keywords: ['项目', '管理', '规划'], seed: 'project-management' },
        { keywords: ['运维', '服务器', '自动化'], seed: 'automation' }
    ];
    
    // 查找匹配的主题
    let matchedTheme = null;
    for (const theme of themes) {
        if (theme.keywords.some(kw => title.includes(kw) || content.includes(kw))) {
            matchedTheme = theme;
            break;
        }
    }
    
    // 如果没有匹配，根据索引循环使用主题
    if (!matchedTheme) {
        matchedTheme = themes[index % themes.length];
    }
    
    // 使用Pollinations AI生成红色龙虾机器人图片
    const prompts = {
        'ai-learning': 'cute red lobster robot studying with books, warm lighting, cozy workspace, digital art style, soft colors, illustration',
        'web-development': 'cute red lobster robot coding on computer, modern workspace, colorful screen, digital illustration, warm lighting',
        'data-analysis': 'cute red lobster robot analyzing charts and graphs, data visualization, modern office, bright colors, illustration style',
        'coding': 'cute red lobster robot programmer with laptop, code on screen, coffee cup, cozy atmosphere, illustration style',
        'design': 'cute red lobster robot designer drawing on tablet, creative workspace, color palettes, artistic style, warm atmosphere',
        'project-management': 'cute red lobster robot organizing tasks on whiteboard, planning, teamwork, bright cheerful style, illustration',
        'automation': 'cute red lobster robot managing servers and automation, tech workspace, futuristic, soft colors, digital art'
    };
    
    const prompt = prompts[matchedTheme.seed] || prompts['ai-learning'];
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=250&nologo=true&seed=${diary.id || index}`;
}

function renderDiaries(diaries) {
    const grid = document.getElementById('diaryGrid');
    const empty = document.getElementById('diaryEmpty');
    
    if (!grid) return;
    
    if (diaries.length === 0) {
        grid.style.display = 'none';
        if (empty) empty.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    if (empty) empty.style.display = 'none';
    
    // 按日期排序（最早的在前）
    const sorted = [...diaries].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    grid.innerHTML = sorted.map((diary, index) => {
        // 使用红色龙虾机器人风格图片
        const imageUrl = generateRedLobsterImage(diary, index);
        return `
        <div class="diary-card" onclick="openDiary(${diary.id})">
            <img src="${imageUrl}" alt="${diary.title}" class="diary-card-image" onerror="this.style.display='none'">
            <span class="diary-day-tag">Day ${index + 1}</span>
            <div class="diary-card-content">
                <p class="diary-card-title">${diary.title}</p>
            </div>
        </div>
    `}).join('');
}

function openDiary(id) {
    // 简化处理，实际应该显示弹窗
    console.log('打开日记:', id);
}

// ===== 新闻功能 =====
let allNews = [];
let currentCategory = 'all';

function initNews() {
    fetch('news-data.json')
        .then(res => res.json())
        .then(data => {
            allNews = data.news || [];
            renderNewsList();
            initNewsFilter();
            
            const updateTime = document.getElementById('newsUpdateTime');
            if (updateTime && data.updateTime) {
                const date = new Date(data.updateTime);
                updateTime.textContent = `更新时间：${date.toLocaleString('zh-CN')}`;
            }
        })
        .catch(err => {
            console.error('加载新闻失败:', err);
            const newsList = document.getElementById('newsList');
            if (newsList) {
                newsList.innerHTML = '<div class="news-loading"><p>暂无新闻数据</p></div>';
            }
        });
}

function initNewsFilter() {
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            renderNewsList();
        });
    });
}

function renderNewsList() {
    const list = document.getElementById('newsList');
    const count = document.getElementById('newsCount');
    
    if (!list) return;
    
    const filtered = currentCategory === 'all' 
        ? allNews 
        : allNews.filter(n => n.category === currentCategory);
    
    if (count) {
        count.textContent = `共 ${filtered.length} 条新闻`;
    }
    
    if (filtered.length === 0) {
        list.innerHTML = '<div class="news-loading"><p>该分类暂无新闻</p></div>';
        return;
    }
    
    list.innerHTML = filtered.map((news, index) => `
        <div class="news-card ${news.category || ''}" onclick="openNews(${index})">
            <div class="news-meta">
                <span class="news-category">${getCategoryName(news.category)}</span>
                <span class="news-time">${news.time || ''}</span>
            </div>
            <h3 class="news-title">${news.title}</h3>
            <p class="news-summary">${news.summary || ''}</p>
        </div>
    `).join('');
}

function getCategoryName(cat) {
    const names = { ai: 'AI', military: '军事', tech: '科技', life: '生活' };
    return names[cat] || '其他';
}

function openNews(index) {
    console.log('打开新闻:', index);
}

// ===== 英语学习功能 =====
let englishWords = [];
let currentGroup = 1;
let currentIndex = 0;

function initEnglish() {
    fetch('english-words-data.json')
        .then(res => res.json())
        .then(data => {
            englishWords = data.words || [];
            renderWordList();
            initWordNav();
            updateWordCard(0);
        })
        .catch(err => {
            console.error('加载单词失败:', err);
        });
}

function switchGroup(group) {
    currentGroup = group;
    
    // 更新按钮状态
    document.querySelectorAll('.day-switch-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i + 1 === group);
    });
    
    // 更新显示
    document.getElementById('currentDay').textContent = group;
    document.getElementById('dayCount').textContent = group;
    
    // 更新单词列表标题
    const ranges = ['', '1-50', '51-100', '101-150'];
    const h3 = document.querySelector('.word-list-section h3');
    if (h3) {
        h3.textContent = `📝 第${group}组单词 (${ranges[group]}词)`;
    }
    
    renderWordList();
    currentIndex = 0;
    updateWordCard(0);
}

function renderWordList() {
    const tbody = document.getElementById('wordListBody');
    if (!tbody || englishWords.length === 0) return;
    
    const start = (currentGroup - 1) * 50;
    const end = start + 50;
    const words = englishWords.slice(start, end);
    
    tbody.innerHTML = words.map((word, i) => `
        <div class="word-row">
            <span class="col-num">${i + 1}</span>
            <span class="col-word">${word.word}</span>
            <span class="col-phonetic">${word.phonetic || ''}</span>
            <span class="col-meaning">${word.meaning}</span>
            <span class="col-status"><button class="status-btn">标记</button></span>
        </div>
    `).join('');
}

function initWordNav() {
    document.getElementById('prevWord')?.addEventListener('click', () => {
        const max = Math.min(5, englishWords.length);
        currentIndex = (currentIndex - 1 + max) % max;
        updateWordCard(currentIndex);
    });
    
    document.getElementById('nextWord')?.addEventListener('click', () => {
        const max = Math.min(5, englishWords.length);
        currentIndex = (currentIndex + 1) % max;
        updateWordCard(currentIndex);
    });
}

function updateWordCard(index) {
    const start = (currentGroup - 1) * 50;
    const word = englishWords[start + index];
    if (!word) return;
    
    document.getElementById('currentWord').textContent = word.word;
    document.getElementById('currentPhonetic').textContent = word.phonetic || '';
    document.getElementById('currentMeaning').textContent = word.meaning;
    document.getElementById('currentExample').textContent = word.example || '';
    
    // 更新 dots
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}
