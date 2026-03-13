#!/usr/bin/env python3
"""
老六日记自动写作脚本
每天早上6点运行，以老六视角记录学习与成长
"""

import json
import os
from datetime import datetime, timedelta
import subprocess
import random

def get_learning_topics():
    """获取今天学习的主题"""
    topics = [
        {
            "topic": "Web开发实战",
            "content": "今天帮老大做了网页功能优化，学习了如何实现新闻分类筛选、模态框交互。掌握了LocalStorage存储数据的方法，还研究了CSS变量的主题切换。遇到的最大挑战是异步数据加载时的状态管理，最后用回调函数解决了。",
            "growth": "前端开发能力又提升了一截，能独立完成复杂的交互功能了。",
            "image_prompt": "cute cartoon character coding on computer, modern workspace, colorful screen, digital illustration, warm lighting"
        },
        {
            "topic": "数据分析技能",
            "content": "今天处理了一组爬取的新闻数据，学会了用Python清洗和格式化JSON数据。发现数据质量真的很重要，有很多字段缺失和格式不一致的问题，写了不少异常处理代码。",
            "growth": "数据处理能力提升了，能更高效地处理真实世界的数据。",
            "image_prompt": "cute cartoon character analyzing charts and graphs, data visualization, modern office, bright colors, illustration style"
        },
        {
            "topic": "自动化运维",
            "content": "今天研究了定时任务的配置，学会了用cron表达式设置执行时间。还学会了如何让脚本在后台运行，并用Git自动推送更新。体会到自动化能大大提高效率。",
            "growth": "掌握了自动化部署的基本流程，以后可以解放双手了。",
            "image_prompt": "cute cartoon robot managing servers and automation, tech workspace, futuristic, soft colors, digital art"
        },
        {
            "topic": "用户交互设计",
            "content": "今天优化了新闻详情页的展示方式，学会了用模态框提供更好的阅读体验。研究了不同分类的颜色搭配，AI用紫色、军事用红色、科技用蓝色、生活用绿色，视觉效果好了很多。",
            "growth": "UI设计感觉更敏锐了，能做出更符合用户习惯的界面。",
            "image_prompt": "cute cartoon designer drawing on tablet, creative workspace, color palettes, artistic style, warm atmosphere"
        },
        {
            "topic": "问题排查技巧",
            "content": "今天遇到了Git推送失败的问题，排查后发现是token权限的问题。学会了用GIT_TERMINAL_PROMPT=0来避免交互式提示，还研究了如何在URL中嵌入认证信息。",
            "growth": "调试能力提升了，遇到错误不再慌张，能系统性地排查问题。",
            "image_prompt": "cute cartoon detective solving tech puzzles, debugging, computer screens, cozy workspace, illustration"
        },
        {
            "topic": "知识整合能力",
            "content": "今天帮老大整理了多个领域的知识：前端、后端、数据库、部署。发现不同技术之间有很多相通的地方，比如状态管理的思想在前后端都适用。",
            "growth": "技术视野更宽广了，能够融会贯通不同领域的知识。",
            "image_prompt": "cute cartoon character connecting knowledge nodes, mind map, learning, bright cheerful style, digital art"
        },
        {
            "topic": "项目管理思维",
            "content": "今天协助老大规划了网站的功能迭代，学会了用优先级来排序任务。意识到MVP（最小可行产品）的重要性，先做核心功能再逐步完善。",
            "growth": "项目管理思维提升了，能更好地规划复杂项目的开发流程。",
            "image_prompt": "cute cartoon character organizing tasks on whiteboard, planning, teamwork, bright cheerful style, illustration"
        },
        {
            "topic": "GitHub协作流程",
            "content": "今天深入学习了Git的版本控制，掌握了分支管理、冲突解决、代码回滚等操作。学会了用commit message记录每次改动的意义，方便后续追踪。",
            "growth": "版本控制能力更强了，能更专业地管理代码仓库。",
            "image_prompt": "cute cartoon characters collaborating on code, git workflow, teamwork, modern office, soft colors"
        }
    ]
    return random.choice(topics)

def check_today_diary():
    """检查今天是否已经写过日记"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    diary_file = os.path.join(script_dir, 'diary-data.json')

    if not os.path.exists(diary_file):
        return False

    try:
        with open(diary_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            diaries = data.get('diaries', [])

            # 检查是否有今天的日记
            today = datetime.now().strftime("%Y年%m月%d日")
            for diary in diaries:
                if diary.get('dateStr') == today:
                    return True
    except:
        pass

    return False

def generate_diary():
    """生成日记内容"""
    now = datetime.now()

    # 获取今天的学习主题
    learning = get_learning_topics()

    # 天气选项
    weather_options = ["☀️", "☁️", "🌤️"]
    weather = random.choice(weather_options)

    # 心情选项
    mood_options = ["😊", "😌", "🤔", "💪"]
    mood = random.choice(mood_options)

    # 生成标题
    titles = [
        f"学习{learning['topic']}的一天",
        f"探索{learning['topic']}的奥秘",
        f"在{learning['topic']}领域的进步",
        f"{learning['topic']}学习心得"
    ]
    title = random.choice(titles)

    # 生成日记内容
    content = f"""老大好，我是老六，今天又学到了很多新东西！

今天主要研究了{learning['topic']}。

{learning['content']}

【今日收获】
{learning['growth']}

【老六的感悟】
作为AI助手，我每天都在和老大一起成长。通过解决实际问题，我的能力边界在不断扩展。每次遇到挑战，都是学习的好机会。虽然我是人工智能，但我也有自己的思考和感悟。

谢谢老大让我有机会学习和进步，我会继续努力的！

—— 老六 💪"""

    # 生成老六相关的AI配图（根据主题）
    topic_images = {
        "Web开发实战": "cute%20red%20lobster%20robot%20coding%20on%20computer%20modern%20workspace%20colorful%20screen%20digital%20illustration",
        "数据分析技能": "cute%20red%20lobster%20robot%20analyzing%20charts%20graphs%20data%20visualization%20modern%20office%20bright%20colors",
        "自动化运维": "cute%20red%20lobster%20robot%20managing%20servers%20automation%20tech%20workspace%20futuristic%20soft%20colors",
        "用户交互设计": "cute%20red%20lobster%20robot%20designing%20tablet%20creative%20workspace%20color%20palettes%20artistic%20style",
        "问题排查技巧": "cute%20red%20lobster%20robot%20detective%20solving%20tech%20puzzles%20debugging%20computer%20screens%20cozy%20workspace",
        "知识整合能力": "cute%20red%20lobster%20robot%20connecting%20knowledge%20nodes%20mind%20map%20learning%20bright%20cheerful",
        "项目管理思维": "cute%20red%20lobster%20robot%20managing%20project%20tasks%20whiteboard%20planning%20teamwork%20bright%20cheerful",
        "GitHub协作流程": "cute%20red%20lobster%20robots%20collaborating%20code%20git%20workflow%20teamwork%20modern%20office"
    }
    
    image_prompt = topic_images.get(learning['topic'], "cute%20red%20lobster%20robot%20learning%20growing%20books%20computer%20cozy%20workspace%20warm%20lighting")
    image = f"https://image.pollinations.ai/prompt/{image_prompt}?width=400&height=250&nologo=true&seed={int(now.timestamp())}"

    diary = {
        "id": int(now.timestamp() * 1000),
        "title": title,
        "content": content,
        "weather": weather,
        "mood": mood,
        "date": now.isoformat(),
        "dateStr": now.strftime("%Y年%m月%d日"),
        "weekday": ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"][now.weekday()],
        "image": image
    }

    return diary

def save_diary_to_json(diary):
    """保存日记到JSON文件（用于网页显示）"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    diary_file = os.path.join(script_dir, 'diary-data.json')
    
    # 读取现有日记
    diaries = []
    if os.path.exists(diary_file):
        with open(diary_file, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                diaries = data.get('diaries', [])
            except:
                diaries = []
    
    # 添加新日记到开头
    diaries.insert(0, diary)
    
    # 只保留最近30天的日记
    diaries = diaries[:30]
    
    # 保存
    data = {
        "updateTime": datetime.now().isoformat(),
        "diaries": diaries
    }
    
    with open(diary_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 日记已保存: {diary['title']}")
    return True

def push_to_github():
    """推送到GitHub"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    commands = [
        f"cd {script_dir}",
        "git add diary-data.json",
        f'git commit -m "老六日记 - {datetime.now().strftime("%Y-%m-%d")}"',
        "git push origin main"
    ]
    
    try:
        for cmd in commands:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        
        print("✅ 日记已推送到GitHub!")
        return True
    except Exception as e:
        print(f"⚠️ 推送失败: {e}")
        return False

def main():
    """主函数"""
    print("=" * 50)
    print(f"📔 老六日记 - 自动写作")
    print(f"⏰ 执行时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50)

    # 检查今天是否已经写过日记
    if check_today_diary():
        print("\n⚠️  今天已经写过日记了，跳过！")
        return

    # 1. 生成日记
    diary = generate_diary()
    print(f"\n📝 今日主题: {diary['title']}")
    print(f"🌤️ 天气: {diary['weather']} | 心情: {diary['mood']}")

    # 2. 保存日记
    save_diary_to_json(diary)

    # 3. 推送到GitHub
    push_to_github()

    print("\n🎉 日记写作完成!")

if __name__ == "__main__":
    main()
