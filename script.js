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
    
    document.getElementById('currentDate').textContent = dateStr;
    document.getElementById('diaryDate').textContent = dateStr;
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
    const saveBtn = document.getElementById('saveDiary');
    const titleInput = document.getElementById('diaryTitle');
    const contentInput = document.getElementById('diaryContent');
    const weatherSelect = document.getElementById('weatherSelect');
    const moodSelect = document.getElementById('moodSelect');
    
    // 加载已保存的日记
    loadDiaries();
    
    // 保存日记
    saveBtn.addEventListener('click', () => {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        const weather = weatherSelect.value;
        const mood = moodSelect.value;
        
        if (!content) {
            alert('请输入日记内容！');
            return;
        }
        
        const diary = {
            id: Date.now(),
            title: title || '无标题',
            content: content,
            weather: weather,
            mood: mood,
            date: new Date().toISOString(),
            dateStr: document.getElementById('diaryDate').textContent
        };
        
        // 保存到localStorage
        const diaries = JSON.parse(localStorage.getItem('laoliu_diaries') || '[]');
        diaries.unshift(diary);
        localStorage.setItem('laoliu_diaries', JSON.stringify(diaries));
        
        // 清空输入
        titleInput.value = '';
        contentInput.value = '';
        
        // 刷新列表
        loadDiaries();
        
        // 提示成功
        alert('日记保存成功！');
    });
}

// 加载日记列表
function loadDiaries() {
    const entriesContainer = document.getElementById('diaryEntries');
    const diaries = JSON.parse(localStorage.getItem('laoliu_diaries') || '[]');
    
    if (diaries.length === 0) {
        entriesContainer.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📝</span>
                <p>还没有日记，开始记录你的第一天吧！</p>
            </div>
        `;
        return;
    }
    
    entriesContainer.innerHTML = diaries.map(diary => `
        <div class="diary-entry" data-id="${diary.id}">
            <div class="entry-header">
                <span class="entry-date">${diary.dateStr} ${diary.weather}</span>
                <span class="entry-mood">${diary.mood}</span>
            </div>
            <h4 class="entry-title">${escapeHtml(diary.title)}</h4>
            <p class="entry-content">${escapeHtml(diary.content)}</p>
            <div class="entry-actions">
                <button class="btn-entry view" onclick="viewDiary(${diary.id})">查看</button>
                <button class="btn-entry delete" onclick="deleteDiary(${diary.id})">删除</button>
            </div>
        </div>
    `).join('');
}

// 查看日记详情
function viewDiary(id) {
    const diaries = JSON.parse(localStorage.getItem('laoliu_diaries') || '[]');
    const diary = diaries.find(d => d.id === id);
    if (diary) {
        alert(`${diary.dateStr} ${diary.weather} ${diary.mood}\n\n【${diary.title}】\n\n${diary.content}`);
    }
}

// 删除日记
function deleteDiary(id) {
    if (confirm('确定要删除这篇日记吗？')) {
        const diaries = JSON.parse(localStorage.getItem('laoliu_diaries') || '[]');
        const newDiaries = diaries.filter(d => d.id !== id);
        localStorage.setItem('laoliu_diaries', JSON.stringify(newDiaries));
        loadDiaries();
    }
}

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== 英语学习功能 =====
function initEnglish() {
    // 今日单词数据
    const words = [
        { word: 'abandon', phonetic: '/əˈbændən/', meaning: 'v. 放弃，遗弃', example: 'He abandoned his car in the snow.' },
        { word: 'ability', phonetic: '/əˈbɪləti/', meaning: 'n. 能力，才能', example: 'She has the ability to speak four languages.' },
        { word: 'abroad', phonetic: '/əˈbrɔːd/', meaning: 'adv. 在国外，到国外', example: 'He studied abroad for three years.' },
        { word: 'absence', phonetic: '/ˈæbsəns/', meaning: 'n. 缺席，缺乏', example: 'His absence from school was noticed.' },
        { word: 'absolute', phonetic: '/ˈæbsəluːt/', meaning: 'adj. 绝对的，完全的', example: 'I have absolute confidence in you.' },
        { word: 'absorb', phonetic: '/əbˈsɔːb/', meaning: 'v. 吸收，吸引', example: 'Plants absorb water from the soil.' },
        { word: 'abstract', phonetic: '/ˈæbstrækt/', meaning: 'adj. 抽象的 n. 摘要', example: 'This is an abstract concept.' },
        { word: 'abundant', phonetic: '/əˈbʌndənt/', meaning: 'adj. 丰富的，充裕的', example: 'The region has abundant natural resources.' },
        { word: 'academic', phonetic: '/ˌækəˈdemɪk/', meaning: 'adj. 学术的，学院的', example: 'She has an academic background.' },
        { word: 'accelerate', phonetic: '/əkˈseləreɪt/', meaning: 'v. 加速，促进', example: 'The car began to accelerate.' }
    ];
    
    let currentIndex = 0;
    const learnedWords = JSON.parse(localStorage.getItem('laoliu_learned_words') || '[]');
    
    // 初始化单词展示
    function updateWordCard(index) {
        const word = words[index];
        document.getElementById('currentWord').textContent = word.word;
        document.getElementById('currentPhonetic').textContent = word.phonetic;
        document.getElementById('currentMeaning').textContent = word.meaning;
        document.getElementById('currentExample').textContent = word.example;
        
        // 更新圆点
        const dots = document.querySelectorAll('#wordDots .dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
    
    // 初始化单词列表
    function renderWordList() {
        const tbody = document.getElementById('wordListBody');
        tbody.innerHTML = words.map((word, index) => `
            <div class="word-row">
                <span class="col-num">${index + 1}</span>
                <span class="col-word">${word.word}</span>
                <span class="col-phonetic">${word.phonetic}</span>
                <span class="col-meaning">${word.meaning}</span>
                <span class="col-status">
                    <button class="status-btn ${learnedWords.includes(word.word) ? 'learned' : ''}" 
                            onclick="toggleLearned('${word.word}', this)">
                        ${learnedWords.includes(word.word) ? '已学' : '学习'}
                    </button>
                </span>
            </div>
        `).join('');
        
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
        currentIndex = (currentIndex - 1 + words.length) % words.length;
        updateWordCard(currentIndex);
    });
    
    document.getElementById('nextWord').addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % words.length;
        updateWordCard(currentIndex);
    });
    
    // 圆点点击
    const dotsContainer = document.getElementById('wordDots');
    dotsContainer.innerHTML = words.slice(0, 5).map((_, i) => 
        `<span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`
    ).join('');
    
    dotsContainer.querySelectorAll('.dot').forEach(dot => {
        dot.addEventListener('click', () => {
            currentIndex = parseInt(dot.dataset.index);
            updateWordCard(currentIndex);
        });
    });
    
    // 初始化
    updateWordCard(0);
    renderWordList();
    
    // 自动轮播
    setInterval(() => {
        currentIndex = (currentIndex + 1) % words.length;
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
function initNews() {
    loadNews();
}

// 加载新闻
async function loadNews() {
    const newsList = document.getElementById('newsList');
    const updateTimeEl = document.getElementById('newsUpdateTime');
    
    try {
        // 加载新闻数据
        const response = await fetch('news-data.json?t=' + Date.now());
        const data = await response.json();
        
        // 更新时间显示
        updateTimeEl.textContent = `更新时间：${data.date} ${data.updateTime.split(' ')[1]}`;
        
        // 渲染新闻列表
        if (data.news && data.news.length > 0) {
            newsList.innerHTML = data.news.map(item => `
                <div class="news-card ${item.category}" onclick="openNews(${item.id})">
                    <div class="news-meta">
                        <span class="news-category">${item.categoryName}</span>
                        <span class="news-time">${item.time}</span>
                    </div>
                    <h3 class="news-title">${escapeHtml(item.title)}</h3>
                    <p class="news-summary">${escapeHtml(item.summary)}</p>
                    <p class="news-source">来源：${escapeHtml(item.source)}</p>
                </div>
            `).join('');
        } else {
            newsList.innerHTML = `
                <div class="news-empty">
                    <div class="news-empty-icon">📰</div>
                    <p>暂无新闻，请稍后再来</p>
                </div>
            `;
        }
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

// 打开新闻详情（示例）
function openNews(id) {
    alert('新闻详情功能开发中...\n新闻ID: ' + id);
}
