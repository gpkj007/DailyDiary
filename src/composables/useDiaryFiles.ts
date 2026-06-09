import { ref } from 'vue'
import { parseEntry } from '@/utils/markdown'
import type { DiaryEntry, ScanResult, AppSettings } from '@/types/diary'

const diaryDir = ref<string>('')

export async function loadSettings(): Promise<AppSettings> {
  console.log('[useDiaryFiles] loadSettings')
  return window.electronAPI.getSettings()
}

export async function initDiaryDir(): Promise<string> {
  console.log('[useDiaryFiles] initDiaryDir')
  diaryDir.value = await window.electronAPI.getDiaryDir()
  console.log('[useDiaryFiles] initDiaryDir ->', diaryDir.value)
  return diaryDir.value
}

export function getDiaryDir(): string {
  return diaryDir.value
}

export async function setDiaryDir(dirPath: string): Promise<boolean> {
  const ok = await window.electronAPI.setDiaryDir(dirPath)
  if (ok) {
    diaryDir.value = dirPath
  }
  return ok
}

export async function selectDiaryDir(): Promise<string | null> {
  return window.electronAPI.selectDir()
}

export async function scanDiaryFiles(): Promise<DiaryEntry[]> {
  const dir = diaryDir.value || await initDiaryDir()
  console.log('[useDiaryFiles] scanDiaryFiles dir:', dir)
  const results: ScanResult[] = await window.electronAPI.scanDiary(dir)
  console.log('[useDiaryFiles] scanDiaryFiles raw results:', results.length)
  const entries: DiaryEntry[] = []
  for (const r of results) {
    try {
      const raw = await window.electronAPI.readDiary(r.path)
      const { frontmatter, body } = parseEntry(raw)
      if (!frontmatter.date) {
        frontmatter.date = r.name.replace('.md', '')
      }
      entries.push({
        path: r.path,
        name: r.name,
        mtime: r.mtime,
        frontmatter,
        body,
        raw
      })
    } catch (err: any) {
      console.error('[useDiaryFiles] scanDiaryFiles parse error for', r.path, err?.message || err)
    }
  }
  entries.sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date))
  console.log('[useDiaryFiles] scanDiaryFiles parsed entries:', entries.length)
  return entries
}

export async function readDiaryFile(filePath: string): Promise<DiaryEntry | null> {
  console.log('[useDiaryFiles] readDiaryFile', filePath)
  try {
    const raw = await window.electronAPI.readDiary(filePath)
    const { frontmatter, body } = parseEntry(raw)
    const name = filePath.split(/[\\/]/).pop() || ''
    if (!frontmatter.date) {
      frontmatter.date = name.replace('.md', '')
    }
    const entry = {
      path: filePath,
      name,
      mtime: Date.now(),
      frontmatter,
      body,
      raw
    }
    console.log('[useDiaryFiles] readDiaryFile success:', entry.name, 'date:', entry.frontmatter.date)
    return entry
  } catch (err: any) {
    console.error('[useDiaryFiles] readDiaryFile error:', filePath, err?.message || err)
    return null
  }
}

export async function saveDiaryFile(filePath: string, raw: string): Promise<boolean> {
  return window.electronAPI.writeDiary(filePath, raw)
}

export async function deleteDiaryFile(filePath: string): Promise<boolean> {
  return window.electronAPI.deleteDiary(filePath)
}

export async function createDiaryFile(dateStr: string): Promise<{ success: boolean; path: string; exists: boolean }> {
  const dir = diaryDir.value || await initDiaryDir()
  console.log('[useDiaryFiles] createDiaryFile', dir, dateStr)
  const result = await window.electronAPI.createDiary(dir, dateStr)
  console.log('[useDiaryFiles] createDiaryFile result:', result)
  return result
}
