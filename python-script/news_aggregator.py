import os
import json
import logging
import asyncio
from typing import List, Dict, Any
from datetime import datetime

import requests
from dotenv import load_dotenv
from telethon import TelegramClient
from telethon.errors import SessionPasswordNeededError

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Загрузка переменных окружения
load_dotenv()

# Ключи API
NEWSAPI_KEY = os.getenv('NEWSAPI_KEY')
TG_API_ID = int(os.getenv('TG_API_ID', 0))
TG_API_HASH = os.getenv('TG_API_HASH')
TG_PHONE = os.getenv('TG_PHONE')

# Темы для поиска через NewsAPI (keywords)
NEWSAPI_TOPICS = {
    "IT & AI": "artificial intelligence OR software development OR IT industry",
    "Politics": "politics OR government",
    "Auto": "automotive OR cars OR electric vehicles",
    "HR Analytics": "HR analytics OR human resources trends OR recruitment",
    "Rock/Metal": "rock music OR metal music OR heavy metal",
    "Retail & Gas": "retail OR gas station OR fuel market"
}

# Telegram каналы по темам (укажите реальные username каналов)
TELEGRAM_CHANNELS = [
    'it_news_channel',      # Пример: IT & AI
    'politics_channel_ru',  # Пример: Политика
    'auto_news_ru',         # Пример: Авто
    'hr_trends_ru',         # Пример: HR
    'rock_metal_news',      # Пример: Рок/Метал
    'retail_neft'           # Пример: Ритейл и АЗС
]

class NewsAggregator:
    def __init__(self):
        self.news_items = []
        
    def fetch_news_api(self):
        """Сбор новостей через NewsAPI"""
        logger.info("Запуск сбора новостей через NewsAPI...")
        base_url = "https://newsapi.org/v2/everything"
        
        for category, query in NEWSAPI_TOPICS.items():
            try:
                params = {
                    'q': query,
                    'language': 'ru', # Можно изменить на 'en' для международных новостей
                    'sortBy': 'publishedAt',
                    'pageSize': 3,
                    'apiKey': NEWSAPI_KEY
                }
                response = requests.get(base_url, params=params)
                response.raise_for_status()
                data = response.json()
                
                for article in data.get('articles', []):
                    if article['title'] and article['description']:
                        self.news_items.append({
                            'source': f"NewsAPI ({article['source']['name']})",
                            'category': category,
                            'title': article['title'],
                            'description': article['description'],
                            'url': article['url'],
                            'date': article['publishedAt'],
                            'score': 10 # Базовый скор для сортировки
                        })
            except Exception as e:
                logger.error(f"Ошибка при получении новостей для категории {category}: {e}")

    async def fetch_telegram_news(self):
        """Сбор новостей из Telegram-каналов через Telethon"""
        if not TG_API_ID or not TG_API_HASH:
            logger.warning("Telegram API ID или Hash не заданы. Пропуск Telegram.")
            return

        logger.info("Запуск сбора новостей из Telegram...")
        client = TelegramClient('news_session', TG_API_ID, TG_API_HASH)
        
        await client.connect()
        if not await client.is_user_authorized():
            logger.info("Требуется авторизация в Telegram...")
            await client.send_code_request(TG_PHONE)
            code = input('Введите код из Telegram: ')
            try:
                await client.sign_in(TG_PHONE, code)
            except SessionPasswordNeededError:
                password = input('Введите пароль 2FA: ')
                await client.sign_in(password=password)
                
        for channel in TELEGRAM_CHANNELS:
            try:
                # Получаем последние 5 постов из канала
                async for message in client.iter_messages(channel, limit=5):
                    if message.text:
                        # Простая эвристика: берем первую строку как заголовок
                        lines = message.text.strip().split('\n')
                        title = lines[0][:100] + '...' if len(lines[0]) > 100 else lines[0]
                        description = message.text[:200] + '...'
                        
                        self.news_items.append({
                            'source': f"Telegram (@{channel})",
                            'category': 'Telegram Feed',
                            'title': title,
                            'description': description,
                            'url': f"https://t.me/{channel}/{message.id}",
                            'date': message.date.isoformat(),
                            'score': 15 # Telegram посты могут иметь больший вес
                        })
            except Exception as e:
                logger.error(f"Ошибка чтения канала {channel}: {e}")
                
        await client.disconnect()

    def rank_and_filter_news(self) -> List[Dict[Any, Any]]:
        """Простая система ранжирования для формирования Топ-10"""
        # Сортируем по дате (в реальности здесь может быть сложный AI-алгоритм)
        sorted_news = sorted(self.news_items, key=lambda x: x['date'], reverse=True)
        
        # Убираем дубликаты по заголовку
        seen_titles = set()
        unique_news = []
        for item in sorted_news:
            if item['title'] not in seen_titles:
                seen_titles.add(item['title'])
                unique_news.append(item)
                
        return unique_news[:10]

    def export_to_json(self, top_news, filename="top_10_news.json"):
        """Экспорт новостей для сайта (например, frontend React сможет его прочитать)"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(top_news, f, ensure_ascii=False, indent=4)
        logger.info(f"Дайджест сохранен в {filename}")

async def main():
    aggregator = NewsAggregator()
    
    # Сбор из REST API (синхронно)
    aggregator.fetch_news_api()
    
    # Сбор из Telegram (асинхронно)
    await aggregator.fetch_telegram_news()
    
    # Формирование Топ-10
    top_10 = aggregator.rank_and_filter_news()
    
    logger.info("=== ТОП-10 НОВОСТЕЙ ===")
    for i, news in enumerate(top_10, 1):
        logger.info(f"{i}. [{news['category']}] {news['title']} ({news['source']})")
        
    # Сохраняем в JSON для загрузки на сайт
    aggregator.export_to_json(top_10, "public/news_digest.json")

if __name__ == "__main__":
    asyncio.run(main())
