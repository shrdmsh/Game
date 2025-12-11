# Digital Feudalism Quiz — GitHub Pages + Firebase

## Описание
Интерактивная викторина. Игроки заходят по QR-коду, отвечают со смартфонов, результаты отображаются у ведущего в реальном времени.

## Файлы проекта
index.html  
player.html  
firebase.js  
script-host.js  
script-player.js  
questions.json  
styles.css  
README.md

## Настройка Firebase
1. В Firebase Console → Realtime Database → Create Database
2. Вкладка Rules:
```
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

## Запуск на GitHub Pages
1. Создать репозиторий на GitHub  
2. Загрузить все файлы в корень  
3. Settings → Pages →  
   Branch: main  
   Folder: /(root)

После публикации URL будет вида:
```
https://username.github.io/repository/
```

## Использование
Открыть:
```
https://.../index.html
```
Игроки сканируют QR и попадают в:
```
player.html?game=<ID>
```

## Изменение вопросов
Редактировать файл:
```
questions.json
```

## После презентации
Отключить открытые правила базы:
```
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```
