// 单词轮播
document.addEventListener('DOMContentLoaded', function() {
    const words = [
        {
            day: 'DAY 1',
            title: 'abandon',
            phonetic: '/əˈbændən/',
            meaning: 'v. 放弃，遗弃',
            example: 'He abandoned his car in the snow.'
        },
        {
            day: 'DAY 1',
            title: 'ability',
            phonetic: '/əˈbɪləti/',
            meaning: 'n. 能力，才能',
            example: 'She has the ability to speak four languages.'
        },
        {
            day: 'DAY 1',
            title: 'abroad',
            phonetic: '/əˈbrɔːd/',
            meaning: 'adv. 在国外，到国外',
            example: 'He studied abroad for three years.'
        },
        {
            day: 'DAY 1',
            title: 'absence',
            phonetic: '/ˈæbsəns/',
            meaning: 'n. 缺席，缺乏',
            example: 'His absence from school was noticed.'
        },
        {
            day: 'DAY 1',
            title: 'absolute',
            phonetic: '/ˈæbsəluːt/',
            meaning: 'adj. 绝对的，完全的',
            example: 'I have absolute confidence in you.'
        }
    ];

    let currentIndex = 0;
    const card = document.querySelector('.showcase-card');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.nav-btn.prev');
    const nextBtn = document.querySelector('.nav-btn.next');

    function updateCard(index) {
        const word = words[index];
        card.innerHTML = `
            <div class="word-day">${word.day}</div>
            <div class="word-content">
                <h3 class="word-title">${word.title}</h3>
                <p class="word-phonetic">${word.phonetic}</p>
                <p class="word-meaning">${word.meaning}</p>
                <p class="word-example">${word.example}</p>
            </div>
        `;
        
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + words.length) % words.length;
        updateCard(currentIndex);
    });

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % words.length;
        updateCard(currentIndex);
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateCard(currentIndex);
        });
    });

    // 自动轮播
    setInterval(() => {
        currentIndex = (currentIndex + 1) % words.length;
        updateCard(currentIndex);
    }, 5000);

    // 学习按钮点击
    document.querySelectorAll('.btn-learn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.textContent = '已学';
            this.style.background = '#27ae60';
            this.disabled = true;
        });
    });

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 导航栏滚动效果
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });

    // 语言切换
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // 数字动画
    function animateNumber(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        function update() {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start) + '+';
                requestAnimationFrame(update);
            } else {
                element.textContent = target + '+';
            }
        }
        
        update();
    }

    // 当元素进入视口时触发动画
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    const target = parseInt(stat.textContent);
                    animateNumber(stat, target);
                });
                observer.unobserve(entry.target);
            }
        });
    });

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        observer.observe(heroStats);
    }
});
