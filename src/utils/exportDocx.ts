import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'
import type { DiaryEntry } from '@/types/diary'

function parseInline(text: string): TextRun[] {
  const runs: TextRun[] = []
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      runs.push(new TextRun({ text: text.slice(lastIndex, match.index) }))
    }
    const matched = match[0]
    if (matched.startsWith('**') && matched.endsWith('**')) {
      runs.push(new TextRun({ text: matched.slice(2, -2), bold: true }))
    } else if (matched.startsWith('*') && matched.endsWith('*')) {
      runs.push(new TextRun({ text: matched.slice(1, -1), italics: true }))
    } else if (matched.startsWith('`') && matched.endsWith('`')) {
      runs.push(new TextRun({ text: matched.slice(1, -1), font: 'Courier New' }))
    }
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) {
    runs.push(new TextRun({ text: text.slice(lastIndex) }))
  }
  if (runs.length === 0) {
    runs.push(new TextRun({ text }))
  }
  return runs
}

function linesToDocx(lines: string[]): Paragraph[] {
  const paragraphs: Paragraph[] = []
  let inCodeBlock = false

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()

    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }

    if (inCodeBlock) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: line, font: 'Courier New', size: 20 })]
      }))
      continue
    }

    if (!line.trim()) {
      paragraphs.push(new Paragraph({ text: '' }))
      continue
    }

    if (line.startsWith('# ')) {
      paragraphs.push(new Paragraph({
        children: parseInline(line.slice(2)),
        heading: HeadingLevel.HEADING_1
      }))
    } else if (line.startsWith('## ')) {
      paragraphs.push(new Paragraph({
        children: parseInline(line.slice(3)),
        heading: HeadingLevel.HEADING_2
      }))
    } else if (line.startsWith('### ')) {
      paragraphs.push(new Paragraph({
        children: parseInline(line.slice(4)),
        heading: HeadingLevel.HEADING_3
      }))
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: '\u2022 ' }), ...parseInline(line.slice(2))],
        indent: { left: 360 }
      }))
    } else if (/^\d+\.\s/.test(line)) {
      const text = line.replace(/^\d+\.\s/, '')
      paragraphs.push(new Paragraph({
        children: parseInline(text),
        indent: { left: 360 }
      }))
    } else if (line.startsWith('> ')) {
      paragraphs.push(new Paragraph({
        children: parseInline(line.slice(2)),
        indent: { left: 360 }
      }))
    } else {
      paragraphs.push(new Paragraph({ children: parseInline(line) }))
    }
  }

  return paragraphs
}

export async function exportDiaryToDocx(entry: DiaryEntry) {
  const lines = entry.body.split('\n')
  const children = linesToDocx(lines)

  const meta: Paragraph[] = []
  if (entry.frontmatter.title) {
    meta.push(new Paragraph({
      text: entry.frontmatter.title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER
    }))
  }
  meta.push(new Paragraph({
    text: `日期: ${entry.frontmatter.date}`,
    alignment: AlignmentType.CENTER
  }))
  if (entry.frontmatter.tags.length) {
    meta.push(new Paragraph({
      text: `标签: ${entry.frontmatter.tags.join(', ')}`,
      alignment: AlignmentType.CENTER
    }))
  }
  meta.push(new Paragraph({ text: '' }))

  const doc = new Document({
    sections: [{
      properties: {},
      children: [...meta, ...children]
    }]
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${entry.frontmatter.date}.docx`
  a.click()
  URL.revokeObjectURL(url)
}
