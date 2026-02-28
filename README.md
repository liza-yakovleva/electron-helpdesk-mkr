#  Helpdesk / Ticketing System (Team 3)

Продакшн-орієнтований корпоративний інструмент для управління заявками, статусами та SLA. Виконано в межах МКР з дисципліни **"Розробка інтерфейсів користувача"**.

##  Наша команда

| Роль | Виконавець | Зона відповідальності |
| :--- | :--- | :--- |
| **Lead / Architect** | **Яковлева Єлизавета** | Архітектура, Electron Main process, IPC, CI/CD |
| **Backend Engineer** | **Роман Кривуця** | Сховище даних (JSON/SQLite), Audit Log logic |
| **UI/UX Master** | **Марія Марченко** | Глобальна стилізація, Dark/Light mode, Layout |
| **Feature Dev** | **Невиніцин Даніїл** | Kanban-дошка та логіка SLA-індикаторів |
| **Feature Dev** | **Пилипчук Дмитро** | Табличний список заявок, фільтри та пошук |
| **Feature Dev** | **Криворот Михайло** | Форми створення/редагування, валідація |
| **Feature Dev** | **Жученко Володимир** | Система шаблонів відповідей та коментарів |
| **QA / Analyst** | **Лазоренко Євгеній** | Тестування, UX-обґрунтування, документація |

##  Технічний стек

* **Core:** Electron (Main + Renderer + IPC)
* **Frontend:** Vue.js 3 (Composition API)
* **Build Tool:** Vite
* **Styling:** Tailwind CSS v4
* **Icons:** Lucide React

##  Функціональні можливості (Baseline)

1.  **Навігація:** Sidebar-меню з чіткою ієрархією екранів.
2.  **Управління даними:** Таблиця з пошуком, пагінацією та фільтрами.
3.  **Форми:** Валідація полів, інлайн-помилки, маски введення.
4.  **Async UX:** Стани Loading/Empty/Error з кнопкою Retry.
5.  **Безпека дій:** Confirm-діалоги для деструктивних операцій.
6.  **Audit Log:** Повний журнал подій (хто, що, коли змінив).
7.  **Personalization:** Підтримка Dark/Light тем із збереженням сесії.
8.  **Electron Native:** Tray icon та системні сповіщення.

##  Інструкція із запуску

```bash
# Клонування репозиторію
git clone [https://github.com/liza-yakovleva/electron-helpdesk-mkr.git](https://github.com/liza-yakovleva/electron-helpdesk-mkr.git)

# Встановлення залежностей
npm install

# Запуск у dev-режимі
npm run dev

# Збірка під Windows
npm run build:win
