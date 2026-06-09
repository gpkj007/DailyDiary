export interface Frontmatter {
  title: string
  date: string
  tags: string[]
}

export interface DiaryEntry {
  path: string
  name: string
  mtime: number
  frontmatter: Frontmatter
  body: string
  raw: string
}

export interface TreeNode {
  key: string
  label: string
  type: 'year' | 'month' | 'day'
  date?: string
  path?: string
  children?: TreeNode[]
}

export interface ScanResult {
  name: string
  path: string
  mtime: number
}

export interface CreateResult {
  success: boolean
  path: string
  exists: boolean
}

export interface AppSettings {
  diaryDir: string
}

declare global {
  interface Window {
    electronAPI: {
      getSettings: () => Promise<AppSettings>
      setDiaryDir: (dirPath: string) => Promise<boolean>
      selectDir: () => Promise<string | null>
      getDiaryDir: () => Promise<string>
      scanDiary: (dirPath: string) => Promise<ScanResult[]>
      readDiary: (filePath: string) => Promise<string>
      writeDiary: (filePath: string, content: string) => Promise<boolean>
      deleteDiary: (filePath: string) => Promise<boolean>
      createDiary: (dirPath: string, dateStr: string) => Promise<CreateResult>
    }
  }
}
