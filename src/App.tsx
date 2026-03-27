import { useEffect, useMemo, useState } from 'react';
import {
  Newspaper,
  Terminal,
  Cpu,
  Car,
  Landmark,
  Users,
  Music,
  Fuel,
  ExternalLink,
  Clock,
  X,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsItem {
  source: string;
  sourceType?: 'newsapi' | 'telegram';
  category: string;
  title: string;
  description: string;
  content?: string;
  url: string;
  date: string;
  score: number;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'IT & AI':
      return <Cpu className="w-5 h-5 text-blue-500" />;
    case 'Politics':
      return <Landmark className="w-5 h-5 text-gray-600" />;
    case 'Automotive':
    case 'Auto':
      return <Car className="w-5 h-5 text-red-500" />;
    case 'HR Analytics':
      return <Users className="w-5 h-5 text-indigo-500" />;
    case 'Rock & Metal':
    case 'Rock/Metal':
      return <Music className="w-5 h-5 text-purple-500" />;
    case 'Retail & Gas Stations':
    case 'Retail & Gas':
      return <Fuel className="w-5 h-5 text-orange-500" />;
    default:
      return <Newspaper className="w-5 h-5 text-emerald-500" />;
  }
};

const CATEGORY_LABELS: Record<string, string> = {
  'IT & AI': 'ИТ и ИИ',
  Politics: 'Политика',
  Automotive: 'Авто',
  Auto: 'Авто',
  'HR Analytics': 'HR-аналитика',
  'Rock & Metal': 'Рок и металл',
  'Rock/Metal': 'Рок и металл',
  'Retail & Gas Stations': 'Ритейл и АЗС',
  'Retail & Gas': 'Ритейл и АЗС',
  'Telegram Feed': 'Лента Telegram',
};

const getCategoryLabel = (category: string) => CATEGORY_LABELS[category] ?? category;

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const getSourceType = (item: NewsItem): 'newsapi' | 'telegram' => {
  if (item.sourceType) {
    return item.sourceType;
  }

  return item.source.toLowerCase().includes('telegram') ? 'telegram' : 'newsapi';
};

const SOURCE_FILTERS = [
  { value: 'all', label: 'Все источники' },
  { value: 'newsapi', label: 'Только NewsAPI' },
  { value: 'telegram', label: 'Только Telegram' },
] as const;

type SourceFilter = (typeof SOURCE_FILTERS)[number]['value'];

export default function App() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('Все');
  const [activeSourceFilter, setActiveSourceFilter] = useState<SourceFilter>('all');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'env' | 'readme'>('script');

  useEffect(() => {
    const newsUrl = `${import.meta.env.BASE_URL}news_digest.json`;

    fetch(newsUrl)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} while loading ${newsUrl}`);
        }
        return res.json();
      })
      .then(data => {
        setNews(data);
        setLoadError(null);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load news', err);
        setLoadError(`Не удалось загрузить данные: ${newsUrl}`);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => ['Все', ...Array.from(new Set(news.map(n => n.category)))], [news]);

  const filteredNews = useMemo(
    () =>
      news.filter(item => {
        const categoryMatches = activeFilter === 'Все' || item.category === activeFilter;
        const sourceType = getSourceType(item);
        const sourceMatches = activeSourceFilter === 'all' || sourceType === activeSourceFilter;

        return categoryMatches && sourceMatches;
      }),
    [news, activeFilter, activeSourceFilter],
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
      <nav className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Newspaper className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">
                Nexus<span className="text-blue-600">Feed</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowScriptModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <Terminal className="w-4 h-4" />
                <span className="hidden sm:inline">Открыть Python-скрипт</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10 text-center sm:text-left sm:flex sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Ежедневный дайджест: топ новостей
            </h1>
            <p className="mt-2 text-lg text-slate-600 max-w-2xl">
              Подборка новостей из NewsAPI и Telegram. Можно фильтровать источник и открывать полную статью внутри сайта.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm inline-flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Обновлено: сегодня, 10:30
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === cat
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat === 'Все' ? 'Все темы' : getCategoryLabel(cat)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {SOURCE_FILTERS.map(filter => (
              <button
                key={filter.value}
                onClick={() => setActiveSourceFilter(filter.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeSourceFilter === filter.value
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl h-64 border border-slate-100 shadow-sm" />
            ))}
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 text-red-900 p-6">
            <h2 className="text-lg font-bold mb-2">Ошибка загрузки данных</h2>
            <p className="text-sm mb-3">{loadError}</p>
            <p className="text-sm">
              Проверь, что в деплое есть файл <code>news_digest.json</code> и GitHub Pages настроен на{' '}
              <strong>GitHub Actions</strong>, а не на <strong>Deploy from a branch</strong>.
            </p>
          </div>
        ) : (
          <>
            <div className="text-sm text-slate-500 mb-4">
              Найдено новостей: <span className="font-semibold text-slate-700">{filteredNews.length}</span>
            </div>
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredNews.map((item, index) => (
                  <motion.article
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    key={item.title + index}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-shadow flex flex-col h-full overflow-hidden group"
                  >
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center justify-between mb-4 gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-100">
                          {getCategoryIcon(item.category)}
                          {getCategoryLabel(item.category)}
                        </span>
                        <span className="text-xs font-medium text-slate-400">{formatDate(item.date)}</span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug group-hover:text-blue-600 transition-colors line-clamp-3">
                        <button onClick={() => setSelectedNews(item)} className="text-left hover:underline">
                          {item.title}
                        </button>
                      </h3>

                      <p className="text-slate-600 text-sm flex-grow line-clamp-4 mb-6">{item.description}</p>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto gap-2">
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          {item.source}
                        </span>
                        <button
                          onClick={() => setSelectedNews(item)}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Читать внутри <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </main>

      <AnimatePresence>
        {selectedNews && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
              onClick={() => setSelectedNews(null)}
            />
            <motion.article
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
            >
              <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-200">
                <div>
                  <div className="text-xs text-slate-500 mb-2">{formatDate(selectedNews.date)}</div>
                  <h2 className="text-2xl font-bold text-slate-900 leading-tight">{selectedNews.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedNews(null)}
                  className="shrink-0 p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap gap-2 items-center">
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                  {selectedNews.source}
                </span>
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                  {getCategoryLabel(selectedNews.category)}
                </span>
              </div>

              <div className="p-6 overflow-y-auto space-y-4">
                <p className="text-slate-800 leading-7 whitespace-pre-line">
                  {selectedNews.content || selectedNews.description || 'Текст статьи не передан агрегатором.'}
                </p>
              </div>

              <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end">
                <a
                  href={selectedNews.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  Открыть оригинал <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.article>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScriptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowScriptModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative bg-slate-900 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/80">
                <div className="flex items-center gap-6 overflow-x-auto">
                  <div className="flex gap-1.5 hidden sm:flex">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setActiveTab('script')}
                      className={`px-4 py-2 rounded-t-lg font-mono text-sm transition-colors ${
                        activeTab === 'script'
                          ? 'bg-[#0d1117] text-white border-t border-x border-slate-700'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      news_aggregator.py
                    </button>
                    <button
                      onClick={() => setActiveTab('env')}
                      className={`px-4 py-2 rounded-t-lg font-mono text-sm transition-colors ${
                        activeTab === 'env'
                          ? 'bg-[#0d1117] text-white border-t border-x border-slate-700'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      .env.example
                    </button>
                    <button
                      onClick={() => setActiveTab('readme')}
                      className={`px-4 py-2 rounded-t-lg font-mono text-sm transition-colors ${
                        activeTab === 'readme'
                          ? 'bg-[#0d1117] text-white border-t border-x border-slate-700'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      README.md
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowScriptModal(false)}
                  className="text-slate-400 hover:text-white transition-colors text-sm font-medium px-3 py-1 bg-slate-800 rounded-md"
                >
                  Закрыть
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar bg-[#0d1117] text-slate-300 font-mono text-sm leading-relaxed min-h-[50vh]">
                <pre>
                  <code>
                    {activeTab === 'script' && PYTHON_SCRIPT_CODE}
                    {activeTab === 'env' && ENV_CODE}
                    {activeTab === 'readme' && README_CODE}
                  </code>
                </pre>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0d1117;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #30363d;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #484f58;
        }
      `}</style>
    </div>
  );
}

const PYTHON_SCRIPT_CODE = `См. файл python-script/news_aggregator.py для актуальной версии скрипта.`;

const ENV_CODE = `# NewsAPI
NEWSAPI_KEY=your_news_api_key_here

# Telegram (Telethon)
TG_API_ID=your_api_id_here
TG_API_HASH=your_api_hash_here
TG_SESSION=your_string_session_here`;

const README_CODE = `Документация по агрегатору: python-script/README.md`;
