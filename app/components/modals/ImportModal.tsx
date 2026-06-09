'use client'
import { useState } from 'react'
import { AppCategory } from '@/lib/adapter'
import { parseBookmarkHtml, executeImport, ParsedImport } from '@/lib/import'
import { IconImport, IconChevron, IconCheck, IconChevronDown, IconX } from '../icons'
import Overlay from '../Overlay'

const SOURCES = [
  { id: 'chrome',  label: 'Google Chrome',  sub: 'Import from bookmarks HTML', color: 250 },
  { id: 'firefox', label: 'Mozilla Firefox', sub: 'Import from bookmarks HTML', color: 33 },
  { id: 'html',    label: 'Bookmarks file',  sub: 'Any browser export (.html)', color: 160 },
] as const

type Stage = 'pick' | 'paste' | 'importing' | 'done'

interface ImportModalProps {
  categories: AppCategory[]
  onClose: () => void
  onComplete: () => void
}

export default function ImportModal({ categories, onClose, onComplete }: ImportModalProps) {
  const [stage, setStage] = useState<Stage>('pick')
  const [srcLabel, setSrcLabel] = useState('')
  const [html, setHtml] = useState('')
  const [parsed, setParsed] = useState<ParsedImport | null>(null)
  const [categoryDbId, setCategoryDbId] = useState<number | null>(
    categories.length > 0 ? categories[0].dbId : null
  )
  const [progress, setProgress] = useState('')
  const [parseError, setParseError] = useState('')

  const handleHtmlChange = (value: string) => {
    setHtml(value)
    setParseError('')
    if (value.trim()) {
      try {
        setParsed(parseBookmarkHtml(value))
      } catch {
        setParsed(null)
        setParseError('Could not parse this file. Make sure it is a valid bookmarks HTML export.')
      }
    } else {
      setParsed(null)
    }
  }

  const handleImport = async () => {
    if (!parsed || !categoryDbId) return
    setStage('importing')
    try {
      await executeImport(parsed, categoryDbId, setProgress)
      setStage('done')
      onComplete()
    } catch {
      setProgress('Import failed. Please try again.')
      setStage('paste')
    }
  }

  const total = parsed ? parsed.folders.length + parsed.bookmarks.length : 0

  return (
    <Overlay onClose={onClose} wide>
      <div className="modal-head">
        <h2>Import bookmarks</h2>
        <button className="icon-btn" onClick={onClose}><IconX size={16} /></button>
      </div>

      <div className="modal-body">
        {stage === 'pick' && (
          <div className="import-list">
            {SOURCES.map((s) => (
              <button key={s.id} className="import-src" onClick={() => { setSrcLabel(s.label); setStage('paste') }}>
                <span className="import-ic" style={{
                  background: `oklch(0.7 0.14 ${s.color} / 0.16)`,
                  color: `oklch(0.78 0.14 ${s.color})`,
                }}>
                  <IconImport size={18} />
                </span>
                <span className="import-meta">
                  <span className="import-title">{s.label}</span>
                  <span className="import-sub">{s.sub}</span>
                </span>
                <IconChevron size={16} style={{ color: 'var(--text-4)' }} />
              </button>
            ))}
            <div className="import-drop">
              <IconImport size={20} style={{ color: 'var(--text-3)' }} />
              <span>Drop a bookmarks file here</span>
            </div>
          </div>
        )}

        {stage === 'paste' && (
          <>
            <label className="field">
              <span className="field-label">Paste your {srcLabel} bookmarks HTML</span>
              <textarea
                className="inp"
                style={{ height: 140, resize: 'vertical', padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: 12 }}
                value={html}
                onChange={(e) => handleHtmlChange(e.target.value)}
                placeholder="Paste the contents of your exported bookmarks HTML file here…"
                spellCheck={false}
              />
              {parseError && <span className="field-hint" style={{ color: 'oklch(0.7 0.16 25)' }}>{parseError}</span>}
              {parsed && (
                <span className="field-hint" style={{ color: 'oklch(0.75 0.13 160)' }}>
                  Found {parsed.folders.length} folders and {parsed.bookmarks.length} bookmarks
                </span>
              )}
            </label>
            <label className="field">
              <span className="field-label">Import into category</span>
              <div className="select-wrap">
                <select
                  className="inp"
                  value={categoryDbId ?? ''}
                  onChange={(e) => setCategoryDbId(Number(e.target.value))}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.dbId}>{c.name}</option>
                  ))}
                </select>
                <IconChevronDown size={14} className="select-caret" />
              </div>
            </label>
          </>
        )}

        {stage === 'importing' && (
          <div className="import-status">
            <div className="spinner" />
            <div className="import-status-title">Importing…</div>
            <div className="import-status-sub">{progress}</div>
          </div>
        )}

        {stage === 'done' && (
          <div className="import-status">
            <div className="import-check"><IconCheck size={26} /></div>
            <div className="import-status-title">Import complete</div>
            <div className="import-status-sub">{total} items added to your library.</div>
          </div>
        )}
      </div>

      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>
          {stage === 'done' ? 'Close' : 'Cancel'}
        </button>
        {stage === 'paste' && (
          <button
            className="btn btn-accent"
            disabled={!parsed || !categoryDbId}
            onClick={handleImport}
          >
            Import {total > 0 ? `${total} items` : ''}
          </button>
        )}
      </div>
    </Overlay>
  )
}
