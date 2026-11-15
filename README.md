# Tally — a habit journal

A habit tracker that looks and behaves like a dot-grid bullet journal. Plan habits for certain days, cross them off with an ink X, keep streaks as tally marks, and see your week and months at a glance.

Built by **Destiny Okoro** with React, React Router, Vite and Tailwind CSS.

## Features
- **Welcome guide** on first visit: a notebook cover, a "how it works" page with a live demo, then start fresh or explore example habits. Reopen it any time from *Guide*.
- **Today**: tap the circle when a habit is done; a progress line and a red-pen note confirm it. Streaks show as tally marks.
- **This week**: a bullet-journal habit-tracker spread. Every habit × every day, tappable to fix missed entries, with previous weeks.
- **Habits**: all habits with their last 7 days and streak; add, edit or delete.
- **Habit page**: days in a row, best run, 30-day percentage and a 4-month calendar.
- **Open-notebook layout**: on wider screens every tab is a two-page spread (e.g. today's list beside the week; habit list beside the selected habit; the form beside a live preview). On phones it folds to one page with a bottom bar.
- Saved in the browser (localStorage).

## Run it locally
```bash
npm install
npm run dev
```

## Project layout
```
src/
  App.jsx               routes: which URL shows which page
  pages/                one file per screen (Welcome, Today, Week, Habits, Habit, New/Edit)
  components/           shared pieces: Layout, Nav, Spread (two pages), WeekGrid, HabitDetail, HabitForm, Tally…
  lib/
    habitsStore.js      useHabits() — read habits from anywhere
    dates.js            date helpers (local "YYYY-MM-DD" keys)
    habits.js           scheduling, streaks and stats
    week.js             week helpers (dates of a week, totals)
    sample.js           example notebook
```

Deploying: `vercel.json` (Vercel) and `public/_redirects` (Netlify) make page URLs like `/week` work on refresh.
