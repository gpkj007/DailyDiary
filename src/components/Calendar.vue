<template>
  <div class="calendar">
    <div class="calendar-header" @click="toggleCollapse">
      <span class="calendar-title">日历</span>
      <span class="collapse-icon" :class="{ collapsed: isCollapsed }">▼</span>
    </div>
    <div v-if="!isCollapsed" class="calendar-body">
      <div class="calendar-nav">
        <button class="nav-btn" @click="prevMonth">◀</button>
        <span class="nav-label">{{ navLabel }}</span>
        <button class="nav-btn" @click="nextMonth">▶</button>
      </div>
      <div class="calendar-grid">
        <div class="weekday-label" v-for="d in weekdays" :key="d">{{ d }}</div>
        <div
          v-for="(cell, idx) in calendarDays"
          :key="idx"
          class="calendar-day"
          :class="{
            'other-month': !cell.currentMonth,
            'has-entry': cell.hasEntry,
            'is-today': cell.isToday
          }"
          @click="onDayClick(cell)"
        >
          {{ cell.day }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DiaryEntry } from '@/types/diary'

const props = defineProps<{
  entries: DiaryEntry[]
}>()

const emit = defineEmits<{
  (e: 'select', dateStr: string): void
}>()

const isCollapsed = ref(false)
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth()) // 0-11

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const navLabel = computed(() => {
  return `${currentYear.value}年${currentMonth.value + 1}月`
})

const entryDates = computed(() => {
  const set = new Set<string>()
  for (const entry of props.entries) {
    if (entry.frontmatter.date) {
      set.add(entry.frontmatter.date)
    }
  }
  return set
})

interface CalendarCell {
  day: number
  currentMonth: boolean
  dateStr: string
  hasEntry: boolean
  isToday: boolean
}

const calendarDays = computed<CalendarCell[]>(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startWeekday = firstDay.getDay()

  const days: CalendarCell[] = []
  const todayStr = formatDateStr(new Date())

  // prev month padding
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i
    const dateStr = formatDateStr(new Date(year, month - 1, d))
    days.push({ day: d, currentMonth: false, dateStr, hasEntry: entryDates.value.has(dateStr), isToday: dateStr === todayStr })
  }

  // current month
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = formatDateStr(new Date(year, month, i))
    days.push({ day: i, currentMonth: true, dateStr, hasEntry: entryDates.value.has(dateStr), isToday: dateStr === todayStr })
  }

  // next month padding
  const remaining = (7 - (days.length % 7)) % 7
  for (let i = 1; i <= remaining; i++) {
    const dateStr = formatDateStr(new Date(year, month + 1, i))
    days.push({ day: i, currentMonth: false, dateStr, hasEntry: entryDates.value.has(dateStr), isToday: dateStr === todayStr })
  }

  return days
})

function formatDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function onDayClick(cell: CalendarCell) {
  emit('select', cell.dateStr)
}
</script>

<style scoped>
.calendar {
  border-top: 1px solid #3e3e3e;
  background: #2e2e2e;
  user-select: none;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 13px;
  color: #bbb;
  transition: background 0.15s;
}

.calendar-header:hover {
  background: #3a3a3a;
}

.calendar-title {
  font-weight: 500;
}

.collapse-icon {
  font-size: 10px;
  transition: transform 0.2s;
}

.collapse-icon.collapsed {
  transform: rotate(-90deg);
}

.calendar-body {
  padding: 0 12px 12px;
}

.calendar-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 0 4px;
}

.nav-btn {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 3px;
  transition: all 0.15s;
}

.nav-btn:hover {
  background: #3e3e3e;
  color: #fff;
}

.nav-label {
  font-size: 13px;
  color: #ddd;
  font-weight: 500;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.weekday-label {
  text-align: center;
  font-size: 11px;
  color: #888;
  padding: 4px 0;
}

.calendar-day {
  text-align: center;
  font-size: 12px;
  padding: 5px 0;
  border-radius: 3px;
  cursor: pointer;
  color: #ddd;
  transition: all 0.15s;
}

.calendar-day:hover {
  background: #3e3e3e;
}

.calendar-day.other-month {
  color: #666;
}

.calendar-day.has-entry {
  color: #07c160;
  font-weight: 600;
}

.calendar-day.is-today {
  background: #07c160;
  color: #fff;
}

.calendar-day.is-today.has-entry {
  background: #07c160;
  color: #fff;
}
</style>
