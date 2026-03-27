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

## Если видишь белый экран на GitHub Pages

Самая частая причина: в `Settings → Pages` выбран `Deploy from a branch`, и GitHub отдает исходники (`src/main.tsx`) без Vite-сборки.

Нужно:
1. Открыть `Settings → Pages`.
2. В `Source` выбрать **GitHub Actions**.
3. Перезапустить workflow **Deploy to GitHub Pages** на вкладке `Actions`.

После этого открой URL вида `https://<user>.github.io/<repo>/`.

Если открываешь просто `https://<user>.github.io` (без `/<repo>/`), это уже другой сайт (user page), и он может быть пустым/старым.

Дополнительно: сборка настроена без inline JS/CSS, чтобы не упираться в возможные CSP-ограничения браузера/корпоративной сети.

## Примечание по путям

В workflow используется `npm run build -- --base=./`, чтобы ассеты корректно работали на GitHub Pages независимо от имени репозитория.
