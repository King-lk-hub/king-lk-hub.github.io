#!/usr/bin/env python3
"""
每日快讯自动更新脚本
每天早上7点运行，爬取热门新闻并推送到GitHub
支持多新闻源：百度热搜、微博热搜、知乎热门、国际新闻
"""

import json
import os
from datetime import datetime
import subprocess
import requests
from bs4 import BeautifulSoup
import time
import re

# Tavily API 配置
TAVILY_API_KEY = "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"
TAVILY_API_URL = "https://api.tavily.com/search"

def tavily_search(query, max_results=3):
    """使用 Tavily API 搜索获取更详细内容"""
    try:
        response = requests.post(
            TAVILY_API_URL,
            json={
                "api_key": TAVILY_API_KEY,
                "query": query,
                "max_results": max_results,
                "include_answer": True,
                "include_raw_content": False,
                "include_images": True
            },
            timeout=15
        )
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"Tavily 搜索失败: {e}")
    return None

def fetch_baidu_hot_news():
    """从百度热搜获取热门新闻"""
    news_list = []
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        
        url = 'https://top.baidu.com/board?tab=realtime'
        response = requests.get(url, headers=headers, timeout=10)
        response.encoding = 'utf-8'
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 解析热搜列表
        items = soup.select('.category-wrap_iQLoo .content_1YWBm')[:10]
        
        for index, item in enumerate(items, 1):
            try:
                title_elem = item.select_one('.title_dIF3B')
                if not title_elem:
                    continue
                    
                title = title_elem.get_text(strip=True)
                category = classify_news(title)
                
                # 获取图片
                img_elem = item.select_one('img')
                image = img_elem.get('src') if img_elem else ''
                
                # 用 Tavily 获取更多内容
                detail = ""
                search_result = tavily_search(title, 1)
                if search_result and search_result.get('results'):
                    first_result = search_result['results'][0]
                    detail = first_result.get('content', '')[:500]
                    if not image and search_result.get('images'):
                        image = search_result['images'][0]
                
                news_item = {
                    "id": len(news_list) + 1,
                    "category": category,
                    "categoryName": get_category_name(category),
                    "title": title,
                    "summary": detail[:100] + "..." if detail else f"热搜榜第{index}名：{title}",
                    "content": f"<p>{title}</p><p>{detail}</p><p>该话题在百度热搜榜排名第{index}位，引发广泛关注。</p>",
                    "time": datetime.now().strftime("%H:%M"),
                    "source": "百度热搜",
                    "url": "",
                    "image": image
                }
                news_list.append(news_item)
                
            except Exception as e:
                print(f"解析百度新闻失败: {e}")
                continue
        
    except Exception as e:
        print(f"获取百度热搜失败: {e}")
    
    return news_list

def fetch_weibo_hot_news():
    """从微博热搜获取热门新闻"""
    news_list = []
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://weibo.com'
        }
        
        # 微博热搜榜
        url = 'https://weibo.com/ajax/side/hotSearch'
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('ok') == 1:
                realtime = data.get('data', {}).get('realtime', [])[:8]
                
                for item in realtime:
                    try:
                        title = item.get('word', '')
                        if not title:
                            continue
                        
                        category = classify_news(title)
                        
                        # 尝试获取图片
                        image = ''
                        if item.get('pic_id'):
                            image = f"https://wx1.sinaimg.cn/orj360/{item['pic_id']}.jpg"
                        
                        # 用 Tavily 获取更多内容
                        detail = ""
                        search_result = tavily_search(title, 1)
                        if search_result and search_result.get('results'):
                            first_result = search_result['results'][0]
                            detail = first_result.get('content', '')[:500]
                        
                        news_item = {
                            "id": len(news_list) + 1,
                            "category": category,
                            "categoryName": get_category_name(category),
                            "title": title,
                            "summary": detail[:100] + "..." if detail else f"微博热搜：{title}",
                            "content": f"<p>{title}</p><p>{detail}</p><p>该话题在微博热搜引发热议。</p>",
                            "time": datetime.now().strftime("%H:%M"),
                            "source": "微博热搜",
                            "url": f"https://s.weibo.com/weibo?q={requests.utils.quote(title)}",
                            "image": image
                        }
                        news_list.append(news_item)
                        
                    except Exception as e:
                        print(f"解析微博新闻失败: {e}")
                        continue
        
    except Exception as e:
        print(f"获取微博热搜失败: {e}")
    
    return news_list

def fetch_zhihu_hot_news():
    """从知乎获取热门问答"""
    news_list = []
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        
        url = 'https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total?limit=10&desktop=true'
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            items = data.get('data', [])[:8]
            
            for item in items:
                try:
                    title = item.get('target', {}).get('title', '')
                    if not title:
                        continue
                    
                    category = 'life'  # 知乎主要是生活类
                    detail = item.get('target', {}).get('excerpt', '')[:500]
                    image = ''
                    
                    # 尝试获取封面图
                    if item.get('target', {}).get('image_url'):
                        image = item['target']['image_url'].replace('_l.jpg', '_xl.jpg')
                    
                    news_item = {
                        "id": len(news_list) + 1,
                        "category": category,
                        "categoryName": "知乎",
                        "title": title,
                        "summary": detail[:100] + "..." if detail else title,
                        "content": f"<p>{title}</p><p>{detail}</p>",
                        "time": datetime.now().strftime("%H:%M"),
                        "source": "知乎",
                        "url": f"https://www.zhihu.com/question/{item.get('target', {}).get('id', '')}",
                        "image": image
                    }
                    news_list.append(news_item)
                    
                except Exception as e:
                    print(f"解析知乎新闻失败: {e}")
                    continue
        
    except Exception as e:
        print(f"获取知乎热门失败: {e}")
    
    return news_list

def fetch_international_news():
    """获取国际新闻 - 用 Tavily 搜索"""
    news_list = []
    
    try:
        # 用 Tavily 搜索国际热点新闻
        search_queries = [
            "breaking news world today",
            "latest international news",
            "global news headlines"
        ]
        
        for query in search_queries[:1]:
            search_result = tavily_search(query, 5)
            if search_result and search_result.get('results'):
                for r in search_result['results']:
                    title = r.get('title', '')
                    if not title or len(title) < 10:
                        continue
                    
                    news_list.append({
                        "id": len(news_list) + 1,
                        "category": "international",
                        "categoryName": "国际",
                        "title": title,
                        "summary": r.get('content', '')[:100],
                        "content": f"<p>{title}</p><p>{r.get('content', '')}</p>",
                        "time": datetime.now().strftime("%H:%M"),
                        "source": "国际",
                        "url": r.get('url', ''),
                        "image": ''
                    })
                break  # 只搜一次
            
    except Exception as e:
        print(f"获取国际新闻失败: {e}")
    
    return news_list[:5]

def classify_news(title):
    """根据关键词智能判断新闻分类"""
    title_lower = title.lower()
    
    # AI相关关键词
    ai_keywords = ['ai', '人工智能', 'chatgpt', 'gpt', '大模型', '算法', '深度学习', '机器学习', '神经网络', 'openai', 'claude', '文心一言', '通义千问', '讯飞', '生成式ai', 'aigc', 'ai生成', 'deepseek', 'kimi', '豆包']
    
    # 军事相关关键词
    military_keywords = ['军事', '战争', '军队', '导弹', '战机', '航母', '坦克', '国防', '武器', '部队', '演习', '冲突', '伊朗', '美军', '海军', '空军', '陆军', '北约', '俄罗斯', '乌克兰', '以色列', '哈马斯', '朝鲜', '韩国', '台湾', '台海', '南海', '东海', '钓鱼岛', '中印', '边境', '阅兵', '军费', '核', '潜艇', '驱逐舰', '护卫舰']
    
    # 科技相关关键词
    tech_keywords = ['科技', '手机', '电脑', '芯片', '半导体', '5g', '6g', '互联网', '华为', '苹果', '小米', '腾讯', '阿里', '百度', '字节', '抖音', '快手', '电动车', '新能源汽车', '特斯拉', '比亚迪', '蔚来', '小鹏', '理想', '航天', '卫星', '火箭', '太空', '量子', '区块链', '元宇宙', 'vr', 'ar', '云计算', '大数据']
    
    for kw in ai_keywords:
        if kw in title_lower or kw in title:
            return 'ai'
    
    for kw in military_keywords:
        if kw in title:
            return 'military'
    
    for kw in tech_keywords:
        if kw in title_lower or kw in title:
            return 'tech'
    
    return 'life'

def get_category_name(category):
    """获取分类中文名"""
    names = {
        'ai': 'AI',
        'military': '军事',
        'tech': '科技',
        'life': '生活',
        'international': '国际'
    }
    return names.get(category, '生活')

def merge_news(all_news):
    """合并去重新闻"""
    seen = set()
    merged = []
    
    for news in all_news:
        # 用标题去重（忽略一些符号）
        key = news['title'].replace('#', '').replace(' ', '')[:20]
        if key not in seen and news['title']:
            seen.add(key)
            merged.append(news)
    
    # 重新编号
    for i, news in enumerate(merged, 1):
        news['id'] = i
    
    return merged[:20]  # 最多20条

def update_news_file():
    """更新新闻数据文件"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    news_file = os.path.join(script_dir, 'news-data.json')
    
    print("正在获取热门新闻...")
    all_news = []
    
    # 1. 百度热搜
    print("📱 抓取百度热搜...")
    baidu_news = fetch_baidu_hot_news()
    all_news.extend(baidu_news)
    time.sleep(1)
    
    # 2. 微博热搜
    print("📱 抓取微博热搜...")
    weibo_news = fetch_weibo_hot_news()
    all_news.extend(weibo_news)
    time.sleep(1)
    
    # 3. 知乎热门
    print("📱 抓取知乎热门...")
    zhihu_news = fetch_zhihu_hot_news()
    all_news.extend(zhihu_news)
    time.sleep(1)
    
    # 4. 国际新闻
    print("🌍 抓取国际新闻...")
    intl_news = fetch_international_news()
    all_news.extend(intl_news)
    
    # 合并去重
    news_list = merge_news(all_news)
    
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
        "git add news-data.json update_news.py",
        f'git commit -m "升级快讯: Tavily搜索+多新闻源+图片 - {datetime.now().strftime("%Y-%m-%d %H:%M")}"',
        "git push origin main"
    ]
    
    try:
        for cmd in commands:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            if result.returncode != 0 and "nothing to commit" not in result.stdout:
                print(f"命令: {cmd}")
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
    print(f"📰 每日快讯自动更新 (多新闻源版)")
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
