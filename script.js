// 老六日记 - 主脚本

document.addEventListener('DOMContentLoaded', function() {
    // 初始化日期
    initDate();
    
    // 初始化Tab切换
    initTabs();
    
    // 初始化日记功能
    initDiary();
    
    // 初始化英语学习
    initEnglish();
    
    // 初始化每日快讯
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

// ===== 日记功能 - 卡片式布局 =====
let allDiaries = []; // 存储所有日记数据

function initDiary() {
    // 加载日记数据（从JSON文件和localStorage合并）
    loadDiaries();
}

// 加载日记列表
async function loadDiaries() {
    const gridContainer = document.getElementById('diaryGrid');
    const emptyState = document.getElementById('diaryEmpty');
    
    try {
        // 尝试从JSON文件加载自动生成的日记
        const response = await fetch('diary-data.json?t=' + Date.now());
        const data = await response.json();
        
        // 合并自动生成的日记和本地存储的日记
        const autoDiaries = data.diaries || [];
        const localDiaries = JSON.parse(localStorage.getItem('laoliu_diaries') || '[]');
        
        // 合并并去重（根据id）
        const diaryMap = new Map();
        [...autoDiaries, ...localDiaries].forEach(diary => {
            diaryMap.set(diary.id, diary);
        });
        
        allDiaries = Array.from(diaryMap.values());
        // 按日期降序排序
        allDiaries.sort((a, b) => new Date(b.date) - new Date(a.date));
        
    } catch (error) {
        // 如果JSON文件不存在，只使用localStorage的数据
        allDiaries = JSON.parse(localStorage.getItem('laoliu_diaries') || '[]');
    }
    
    if (allDiaries.length === 0) {
        gridContainer.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    gridContainer.style.display = 'grid';
    emptyState.style.display = 'none';
    
    // 渲染日记卡片
    gridContainer.innerHTML = allDiaries.map((diary, index) => {
        const dayNumber = allDiaries.length - index; // Day编号（从最早开始算）
        const shortTitle = diary.title.length > 30 ? diary.title.substring(0, 30) + '...' : diary.title;
        
        // 生成随机配图（根据日记内容生成不同的图片）
        const imageUrl = generateDiaryImage(diary, index);
        
        return `
            <div class="diary-card" onclick="openDiaryModal(${diary.id})">
                <img src="${imageUrl}" alt="日记配图" class="diary-card-image" loading="lazy">
                <span class="diary-day-tag">Day ${dayNumber}</span>
                <div class="diary-card-content">
                    <p class="diary-card-title">${escapeHtml(shortTitle)}</p>
                </div>
            </div>
        `;
    }).join('');
}

// 生成日记配图（根据日记主题生成不同的图片）
function generateDiaryImage(diary, index) {
    // 根据日记标题或内容关键词选择不同的主题图片
    const title = diary.title.toLowerCase();
    const content = (diary.content || '').toLowerCase();
    
    // 主题关键词映射
    const themes = [
        { keywords: ['ai', '人工智能', '模型', '学习'], seed: 'ai-learning' },
        { keywords: ['web', '前端', '网页', '开发'], seed: 'web-development' },
        { keywords: ['数据', '分析', 'python'], seed: 'data-analysis' },
        { keywords: ['git', 'github', '代码'], seed: 'coding' },
        { keywords: ['设计', 'ui', '样式'], seed: 'design' },
        { keywords: ['项目', '管理', '规划'], seed: 'project-management' }
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
    
    // 使用Pollinations AI生成图片
    const prompts = {
        'ai-learning': 'cute cartoon AI robot studying with books, warm lighting, cozy workspace, digital art style, soft colors',
        'web-development': 'cute cartoon character coding on computer, modern workspace, colorful screen, digital illustration',
        'data-analysis': 'cute cartoon character analyzing charts and graphs, data visualization, modern office, bright colors',
        'coding': 'cute cartoon programmer with laptop, code on screen, coffee cup, cozy atmosphere, illustration style',
        'design': 'cute cartoon designer drawing on tablet, creative workspace, color palettes, artistic style',
        'project-management': 'cute cartoon character organizing tasks on whiteboard, planning, teamwork, bright cheerful style'
    };
    
    const prompt = prompts[matchedTheme.seed] || prompts['ai-learning'];
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=250&nologo=true&seed=${diary.id}`;
}

// 打开日记详情弹窗
function openDiaryModal(id) {
    const diary = allDiaries.find(d => d.id === id);
    if (!diary) return;
    
    // 计算Day编号
    const index = allDiaries.findIndex(d => d.id === id);
    const dayNumber = allDiaries.length - index;
    
    // 填充弹窗内容
    document.getElementById('modalDayTag').textContent = `Day ${dayNumber}`;
    document.getElementById('modalDiaryTitle').textContent = diary.title;
    document.getElementById('modalDiaryDate').textContent = diary.dateStr || new Date(diary.date).toLocaleDateString('zh-CN');
    document.getElementById('modalDiaryWeather').textContent = diary.weather || '☀️';
    document.getElementById('modalDiaryMood').textContent = diary.mood || '😊';
    document.getElementById('modalDiaryContent').textContent = diary.content;
    
    // 设置图片
    const imageWrapper = document.getElementById('modalImageWrapper');
    const image = document.getElementById('modalDiaryImage');
    const imageUrl = generateDiaryImage(diary, index);
    image.src = imageUrl;
    
    // 显示弹窗
    document.getElementById('diaryModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

// 关闭日记详情弹窗
function closeDiaryModal() {
    document.getElementById('diaryModal').classList.remove('show');
    document.body.style.overflow = '';
}

// 点击弹窗外部关闭
document.addEventListener('click', (e) => {
    const modal = document.getElementById('diaryModal');
    if (e.target === modal) {
        closeDiaryModal();
    }
});

// ESC键关闭弹窗
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeDiaryModal();
    }
});

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== 英语学习功能 =====
let englishWords = []; // 存储单词数据
let currentDay = 1; // 当前选中的Day
const totalDays = 76; // 总共76天

async function initEnglish() {
    // 从JSON文件加载单词数据
    try {
        const response = await fetch('english-words-data.json?t=' + Date.now());
        const data = await response.json();
        englishWords = data.words || [];
        currentDay = data.day || 1;
        
        // 更新日期显示
        document.getElementById('currentDay').textContent = currentDay;
        document.getElementById('listDay').textContent = currentDay;
        document.getElementById('dayCount').textContent = currentDay;
        
        // 生成Day选择表格
        renderDayGrid();
        
    } catch (error) {
        console.error('加载单词失败:', error);
        englishWords = [];
    }
    
    let currentIndex = 0;
    const learnedWords = JSON.parse(localStorage.getItem('laoliu_learned_words') || '[]');
    
    // 生成Day选择表格
    function renderDayGrid() {
        const dayGrid = document.getElementById('dayGrid');
        const learnedDays = JSON.parse(localStorage.getItem('laoliu_learned_days') || '[]');
        
        dayGrid.innerHTML = '';
        for (let i = 1; i <= totalDays; i++) {
            const btn = document.createElement('button');
            btn.className = 'day-btn';
            btn.textContent = `Day ${i}`;
            
            if (i === currentDay) {
                btn.classList.add('active');
            } else if (learnedDays.includes(i)) {
                btn.classList.add('completed');
            }
            
            btn.onclick = () => selectDay(i);
            dayGrid.appendChild(btn);
        }
    }
    
    // 选择某一天
    async function selectDay(day) {
        currentDay = day;
        
        // 更新按钮状态
        document.querySelectorAll('.day-btn').forEach((btn, index) => {
            btn.classList.remove('active');
            if (index + 1 === day) {
                btn.classList.add('active');
            }
        });
        
        // 更新显示
        document.getElementById('currentDay').textContent = day;
        document.getElementById('listDay').textContent = day;
        document.getElementById('dayCount').textContent = day;
        
        // 加载对应天的单词（这里用模拟数据，实际应该从不同文件加载）
        // 目前只有Day 1的数据，其他天用循环生成
        if (day === 1) {
            englishWords = await loadWordsForDay(1);
        } else {
            // 模拟其他天的数据（实际应该从不同JSON文件加载）
            englishWords = generateWordsForDay(day);
        }
        
        // 重新渲染
        updateWordCard(0);
        renderWordList();
        updateDots();
    }
    
    // 加载指定天的单词
    async function loadWordsForDay(day) {
        try {
            const response = await fetch(`english-words-data-day${day}.json?t=${Date.now()}`);
            const data = await response.json();
            return data.words || [];
        } catch (error) {
            // 如果文件不存在，生成模拟数据
            return generateWordsForDay(day);
        }
    }
    
    // 生成指定天的单词（模拟数据）
    function generateWordsForDay(day) {
        const baseWords = [
            { word: 'abandon', phonetic: '/əˈbændən/', meaning: 'v. 放弃，遗弃', example: 'He abandoned his car in the snow.' },
            { word: 'ability', phonetic: '/əˈbɪləti/', meaning: 'n. 能力，才能', example: 'She has the ability to speak four languages.' },
            { word: 'abroad', phonetic: '/əˈbrɔːd/', meaning: 'adv. 在国外，到国外', example: 'He studied abroad for three years.' },
            { word: 'absence', phonetic: '/ˈæbsəns/', meaning: 'n. 缺席，缺乏', example: 'His absence from school was noticed.' },
            { word: 'absolute', phonetic: '/ˈæbsəluːt/', meaning: 'adj. 绝对的，完全的', example: 'I have absolute confidence in you.' }
        ];
        
        // 根据day生成不同的50个单词（这里简化处理，实际应该有完整词库）
        const words = [];
        for (let i = 0; i < 50; i++) {
            const baseWord = baseWords[i % baseWords.length];
            words.push({
                word: `${baseWord.word}_${day}_${i + 1}`,
                phonetic: baseWord.phonetic,
                meaning: baseWord.meaning,
                example: baseWord.example
            });
        }
        return words;
    }
    
    // 初始化单词展示
    function updateWordCard(index) {
        const word = englishWords[index] || { word: 'Loading...', phonetic: '', meaning: '', example: '' };
        document.getElementById('currentWord').textContent = word.word.split('_')[0]; // 去掉后缀
        document.getElementById('currentPhonetic').textContent = word.phonetic;
        document.getElementById('currentMeaning').textContent = word.meaning;
        document.getElementById('currentExample').textContent = word.example;
        
        // 更新圆点
        const dots = document.querySelectorAll('#wordDots .dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
    
    // 更新圆点数量
    function updateDots() {
        const dotsContainer = document.getElementById('wordDots');
        dotsContainer.innerHTML = englishWords.slice(0, 5).map((_, i) => 
            `<span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`
        ).join('');
        
        dotsContainer.querySelectorAll('.dot').forEach(dot => {
            dot.addEventListener('click', () => {
                currentIndex = parseInt(dot.dataset.index);
                updateWordCard(currentIndex);
            });
        });
    }
    
    // 初始化单词列表 - 显示50个
    function renderWordList() {
        const tbody = document.getElementById('wordListBody');
        if (englishWords.length === 0) {
            tbody.innerHTML = '<div class="word-row"><span style="padding: 20px; color: #999;">加载中...</span></div>';
            return;
        }
        
        tbody.innerHTML = englishWords.map((word, index) => {
            const cleanWord = word.word.split('_')[0]; // 去掉后缀
            return `
            <div class="word-row">
                <span class="col-num">${index + 1}</span>
                <span class="col-word">${cleanWord}</span>
                <span class="col-phonetic">${word.phonetic}</span>
                <span class="col-meaning">${word.meaning}</span>
                <span class="col-status">
                    <button class="status-btn ${learnedWords.includes(cleanWord) ? 'learned' : ''}" 
                            onclick="toggleLearned('${cleanWord}', this)">
                        ${learnedWords.includes(cleanWord) ? '已学' : '学习'}
                    </button>
                </span>
            </div>
        `}).join('');
        
        // 更新进度
        updateProgress();
    }
    
    // 更新进度
    function updateProgress() {
        document.getElementById('learnedCount').textContent = learnedWords.length;
        document.getElementById('progressPercent').textContent = Math.round(learnedWords.length / words.length * 100) + '%';
    }
    
    // 绑定事件
    document.getElementById('prevWord').addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + Math.min(englishWords.length, 5)) % Math.min(englishWords.length, 5);
        updateWordCard(currentIndex);
    });
    
    document.getElementById('nextWord').addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % Math.min(englishWords.length, 5);
        updateWordCard(currentIndex);
    });
    
    // 初始化
    updateDots();
    updateWordCard(0);
    renderWordList();
    
    // 自动轮播（只轮播前5个）
    setInterval(() => {
        currentIndex = (currentIndex + 1) % Math.min(englishWords.length, 5);
        updateWordCard(currentIndex);
    }, 5000);
}

// 切换学习状态
function toggleLearned(word, btn) {
    const learnedWords = JSON.parse(localStorage.getItem('laoliu_learned_words') || '[]');
    
    if (learnedWords.includes(word)) {
        // 取消学习
        const index = learnedWords.indexOf(word);
        learnedWords.splice(index, 1);
        btn.classList.remove('learned');
        btn.textContent = '学习';
    } else {
        // 标记已学
        learnedWords.push(word);
        btn.classList.add('learned');
        btn.textContent = '已学';
    }
    
    localStorage.setItem('laoliu_learned_words', JSON.stringify(learnedWords));
    
    // 更新进度
    document.getElementById('learnedCount').textContent = learnedWords.length;
    const totalWords = 10; // 当前展示的单词总数
    document.getElementById('progressPercent').textContent = Math.round(learnedWords.length / totalWords * 100) + '%';
}

// ===== 每日快讯功能 =====
let allNewsData = null; // 存储所有新闻数据
let currentCategory = 'all'; // 当前选中的分类

function initNews() {
    loadNews();
    initCategoryButtons();
}

// 初始化分类按钮
function initCategoryButtons() {
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // 更新按钮状态
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 筛选新闻
            currentCategory = btn.dataset.category;
            renderNewsList();
        });
    });
}

// 加载新闻
async function loadNews() {
    const newsList = document.getElementById('newsList');
    const updateTimeEl = document.getElementById('newsUpdateTime');
    
    try {
        // 加载新闻数据
        const response = await fetch('news-data.json?t=' + Date.now());
        const data = await response.json();
        
        // 存储数据
        allNewsData = data;
        
        // 更新时间显示
        updateTimeEl.textContent = `更新时间：${data.date} ${data.updateTime.split(' ')[1]}`;
        
        // 渲染新闻列表
        renderNewsList();
        
    } catch (error) {
        console.error('加载新闻失败:', error);
        newsList.innerHTML = `
            <div class="news-empty">
                <div class="news-empty-icon">⚠️</div>
                <p>新闻加载失败，请刷新重试</p>
            </div>
        `;
    }
}

// 渲染新闻列表
function renderNewsList() {
    const newsList = document.getElementById('newsList');
    const newsCountEl = document.getElementById('newsCount');
    
    if (!allNewsData || !allNewsData.news) {
        return;
    }
    
    // 筛选新闻
    let filteredNews = allNewsData.news;
    if (currentCategory !== 'all') {
        filteredNews = allNewsData.news.filter(item => item.category === currentCategory);
    }
    
    // 更新统计
    newsCountEl.textContent = `共 ${filteredNews.length} 条新闻`;
    
    // 渲染列表
    if (filteredNews.length > 0) {
        newsList.innerHTML = filteredNews.map((item, index) => `
            <div class="news-card ${item.category}" onclick="openNewsModal(${item.id})">
                <span class="news-rank ${index < 3 ? 'top3' : ''}">${index + 1}</span>
                ${item.image ? `
                    <div class="news-image-wrapper">
                        <img src="${item.image}" alt="${escapeHtml(item.title)}" class="news-image" loading="lazy">
                        <div class="news-image-overlay"></div>
                    </div>
                ` : ''}
                <div class="news-content-wrapper">
                    <div class="news-meta">
                        <span class="news-category">${getCategoryEmoji(item.category)} ${item.categoryName}</span>
                        <span class="news-time">${item.time}</span>
                    </div>
                    <h3 class="news-title">${escapeHtml(item.title)}</h3>
                    <p class="news-summary">${escapeHtml(item.summary)}</p>
                    <p class="news-source">来源：${escapeHtml(item.source)}</p>
                </div>
            </div>
        `).join('');
    } else {
        newsList.innerHTML = `
            <div class="news-empty">
                <div class="news-empty-icon">📰</div>
                <p>该分类暂无新闻</p>
            </div>
        `;
    }
}

// 获取分类emoji
function getCategoryEmoji(category) {
    const emojiMap = {
        'ai': '🤖',
        'military': '🎖️',
        'tech': '💻',
        'life': '🏠',
        'finance': '💰',
        'sports': '⚽',
        'entertainment': '🎬',
        'world': '🌍'
    };
    return emojiMap[category] || '📰';
}

// 打开新闻详情弹窗
function openNewsModal(id) {
    if (!allNewsData || !allNewsData.news) return;
    
    const newsItem = allNewsData.news.find(item => item.id === id);
    if (!newsItem) return;
    
    // 填充弹窗内容
    document.getElementById('modalTitle').textContent = newsItem.title;
    document.getElementById('modalCategory').textContent = `${getCategoryEmoji(newsItem.category)} ${newsItem.categoryName}`;
    document.getElementById('modalTime').textContent = newsItem.time;
    document.getElementById('modalSource').textContent = `来源：${newsItem.source}`;
    
    // 详情内容（如果有详细内容则显示，否则显示摘要）
    const modalBody = document.getElementById('modalBody');
    let contentHtml = '';
    
    // 如果有图片，显示图片
    if (newsItem.image) {
        contentHtml += `
            <div class="news-modal-image-wrapper">
                <img src="${newsItem.image}" alt="${escapeHtml(newsItem.title)}" class="news-modal-image">
                <div class="image-caption">📰 新闻配图</div>
            </div>
        `;
    }
    
    // 添加正文内容
    if (newsItem.content) {
        contentHtml += newsItem.content;
    } else {
        contentHtml += `<p>${newsItem.summary}</p>`;
    }
    
    modalBody.innerHTML = contentHtml;
    
    // 原文链接
    const modalLink = document.getElementById('modalLink');
    if (newsItem.url) {
        modalLink.href = newsItem.url;
        modalLink.style.display = 'inline-block';
    } else {
        modalLink.style.display = 'none';
    }
    
    // 显示弹窗
    document.getElementById('newsModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

// 关闭新闻详情弹窗
function closeNewsModal() {
    document.getElementById('newsModal').classList.remove('show');
    document.body.style.overflow = '';
}

// 点击弹窗外部关闭
document.addEventListener('click', (e) => {
    if (e.target.id === 'newsModal') {
        closeNewsModal();
    }
});

// ESC键关闭弹窗
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeNewsModal();
    }
});
