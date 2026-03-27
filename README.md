# news_helper

React + Vite сайт со статической сборкой, готовый к деплою на GitHub Pages.

## Что нужно, чтобы сайт работал через GitHub

1. **Репозиторий на GitHub** (код уже в `main`).
2. **GitHub Actions workflow** для сборки и деплоя (файл `.github/workflows/deploy-pages.yml`).
3. **GitHub Pages включён в настройках репозитория**:
   - `Settings` → `Pages`
   - `Source`: **GitHub Actions**
4. После push в `main` сайт соберётся и задеплоится автоматически.

## Локальный запуск

```bash
npm ci
npm run dev
```

Открой `http://localhost:5173`.

## Локальная проверка прод-сборки

```bash
npm run build
npm run preview
```

## Как проверить деплой на GitHub

1. Сделай `git push` в ветку `main`.
2. Открой вкладку `Actions` и дождись успешного workflow **Deploy to GitHub Pages**.
3. В `Settings → Pages` появится URL сайта.

## Примечание по путям

В workflow используется `npm run build -- --base=./`, чтобы ассеты корректно работали на GitHub Pages независимо от имени репозитория.
