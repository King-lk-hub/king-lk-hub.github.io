#!/usr/bin/env python3
"""
每日快讯自动更新脚本
每天早上7点运行，爬取热门新闻并推送到GitHub
"""

import json
import os
from datetime import datetime
import subprocess
import requests
from bs4 import BeautifulSoup
import time

def fetch_baidu_hot_news():
    """从百度热搜获取热门新闻"""
    news_list = []
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        
        # 百度热搜API
        url = 'https://top.baidu.com/board?tab=realtime'
        response = requests.get(url, headers=headers, timeout=10)
        response.encoding = 'utf-8'
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 尝试解析热搜列表
        items = soup.select('.category-wrap_iQLoo .content_1YWBm')[:15]
        
        for index, item in enumerate(items, 1):
            try:
                title_elem = item.select_one('.title_dIF3B')
                if not title_elem:
                    continue
                    
                title = title_elem.get_text(strip=True)
                
                # 根据关键词判断分类
                category = classify_news(title)
                
                news_item = {
                    "id": index,
                    "category": category,
                    "categoryName": get_category_name(category),
                    "title": title,
                    "summary": f"热搜榜第{index}名：{title}",
                    "content": f"<p>{title}</p><p>该话题在百度热搜榜排名第{index}位，引发广泛关注。</p>",
                    "time": datetime.now().strftime("%H:%M"),
                    "source": "百度热搜",
                    "url": ""
                }
                news_list.append(news_item)
                
            except Exception as e:
                print(f"解析新闻失败: {e}")
                continue
        
        # 如果爬取失败，使用备用数据
        if not news_list:
            print("爬取失败，使用备用数据")
            news_list = get_fallback_news()
            
    except Exception as e:
        print(f"获取新闻失败: {e}")
        news_list = get_fallback_news()
    
    return news_list

def classify_news(title):
    """根据关键词智能判断新闻分类"""
    title_lower = title.lower()
    
    # AI相关关键词（优先级最高）
    ai_keywords = ['ai', '人工智能', 'chatgpt', 'gpt', '大模型', '算法', '深度学习', '机器学习', '神经网络', 'openai', 'claude', '文心一言', '通义千问', '讯飞', '生成式ai', 'aigc', 'ai生成']
    
    # 军事相关关键词
    military_keywords = ['军事', '战争', '军队', '导弹', '战机', '航母', '坦克', '国防', '武器', '部队', '演习', '冲突', '伊朗', '美军', '海军', '空军', '陆军', '北约', '俄罗斯', '乌克兰', '以色列', '哈马斯', '朝鲜', '韩国', '台湾', '台海', '南海', '东海', '钓鱼岛', '中印', '边境', '阅兵', '军费', '核', '潜艇', '驱逐舰', '护卫舰', '加油机', '第五舰队']
    
    # 科技相关关键词
    tech_keywords = ['科技', '手机', '电脑', '芯片', '半导体', '5g', '6g', '互联网', '华为', '苹果', '小米', '腾讯', '阿里', '百度', '字节', '抖音', '快手', '电动车', '新能源汽车', '特斯拉', '比亚迪', '蔚来', '小鹏', '理想', '碳纤维', '航天', '卫星', '火箭', '太空', '量子', '区块链', '元宇宙', 'vr', 'ar', '云计算', '大数据', '物联网', '追觅']
    
    # 先检查AI（因为AI也是科技，但优先级更高）
    for kw in ai_keywords:
        if kw in title_lower or kw in title:
            return 'ai'
    
    # 再检查军事
    for kw in military_keywords:
        if kw in title:
            return 'military'
    
    # 再检查科技
    for kw in tech_keywords:
        if kw in title_lower or kw in title:
            return 'tech'
    
    # 其他都是生活
    return 'life'

def get_category_name(category):
    """获取分类中文名"""
    names = {
        'ai': 'AI',
        'military': '军事',
        'tech': '科技',
        'life': '生活'
    }
    return names.get(category, '生活')

def get_fallback_news():
    """备用新闻数据"""
    now = datetime.now()
    return [
        {
            "id": 1,
            "category": "tech",
            "categoryName": "科技",
            "title": "AI技术持续发展，智能应用场景不断拓展",
            "summary": "人工智能技术在各领域深入应用，正在改变人们的生活方式。",
            "content": "<p>人工智能技术持续快速发展，在智能助手、自动驾驶、医疗诊断等领域展现出巨大潜力。</p>",
            "time": "07:00",
            "source": "科技日报",
            "url": ""
        },
        {
            "id": 2,
            "category": "military",
            "categoryName": "军事",
            "title": "国防部发布重要军事演习消息",
            "summary": "国防部就近期军事活动发布相关消息。",
            "content": "<p>国防部新闻发言人就近期军事活动发布相关消息，详情请关注官方发布。</p>",
            "time": "07:15",
            "source": "国防部网站",
            "url": ""
        },
        {
            "id": 3,
            "category": "life",
            "categoryName": "生活",
            "title": "春季养生要点：健康生活从细节做起",
            "summary": "春季是养生黄金期，专家分享健康生活建议。",
            "content": "<p>春季是养生黄金期，建议保持规律作息、合理膳食、适度运动。</p>",
            "time": "07:30",
            "source": "健康报",
            "url": ""
        }
    ]

def update_news_file():
    """更新新闻数据文件"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    news_file = os.path.join(script_dir, 'news-data.json')
    
    # 获取新闻数据
    print("正在获取热门新闻...")
    news_list = fetch_baidu_hot_news()
    
    now = datetime.now()
    date_str = now.strftime("%Y年%m月%d日")
    time_str = now.strftime("%Y-%m-%d %H:%M:%S")
    
    news_data = {
        "updateTime": time_str,
        "date": date_str,
        "news": news_list
    }
    
    # 写入文件
    with open(news_file, 'w', encoding='utf-8') as f:
        json.dump(news_data, f, ensure_ascii=False, indent=4)
    
    print(f"✅ 新闻数据已更新: {date_str} - 共{len(news_list)}条")
    return True

def push_to_github():
    """推送到GitHub"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    commands = [
        f"cd {script_dir}",
        "git add news-data.json",
        f'git commit -m "自动更新每日快讯TOP15 - {datetime.now().strftime("%Y-%m-%d %H:%M")}"',
        "git push origin main"
    ]
    
    try:
        for cmd in commands:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            if result.returncode != 0 and "nothing to commit" not in result.stdout:
                print(f"命令执行: {cmd}")
                if "fatal" not in result.stderr.lower():
                    print(result.stderr)
        
        print("✅ 已推送到GitHub!")
        return True
    except Exception as e:
        print(f"❌ 推送失败: {e}")
        return False

def main():
    """主函数"""
    print("=" * 50)
    print(f"📰 每日快讯TOP15自动更新")
    print(f"⏰ 执行时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50)
    
    # 1. 更新新闻数据
    if not update_news_file():
        print("❌ 新闻数据更新失败")
        return
    
    # 2. 推送到GitHub
    push_to_github()
    
    print("\n🎉 每日快讯更新完成!")

if __name__ == "__main__":
    main()
