'use client'
import { useState, useRef, useEffect, useMemo } from 'react'
import { AppData, EditDraft, ItemKind } from '@/lib/adapter'
import {
  IconBookmark, IconFolder, IconLayers, IconX, IconStar, IconChevronDown,
} from '../icons'
import Overlay from '../Overlay'
import IconSelectorModal from '../IconSelectorModal'
import IconRenderer from '../IconRenderer'

const TYPE_TABS: { id: ItemKind; label: string; icon: React.ReactNode }[] = [
  { id: 'bookmark',  label: 'Bookmark',  icon: <IconBookmark size={15} /> },
  { id: 'folder',    label: 'Folder',    icon: <IconFolder size={15} /> },
  { id: 'category',  label: 'Category',  icon: <IconLayers size={15} /> },
]
const CAT_HUES = [33, 250, 160, 200, 320, 90, 0, 280]

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  )
}

interface EditModalProps {
  data: AppData
  draft: EditDraft
  onClose: () => void
  onSave: (kind: ItemKind, form: EditDraft) => void
}

function IconPickField({ icon, onChange }: { icon?: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="icon-pick-row">
        <div className="icon-pick-preview">
          {icon
            ? (icon.startsWith('fa-') || icon.startsWith('hero-') || icon.startsWith('drive-'))
              ? <IconRenderer icon={icon} style={{ width: 20, height: 20 }} />
              : <span style={{ fontSize: 20 }}>{icon}</span>
            : <span style={{ color: 'var(--text-4)', fontSize: 12 }}>None</span>
          }
        </div>
        <button type="button" className="btn btn-ghost" onClick={() => setOpen(true)}>Pick icon</button>
        {icon && <button type="button" className="btn btn-ghost" onClick={() => onChange('')}>Clear</button>}
      </div>
      {open && (
        <IconSelectorModal
          isOpen
          onClose={() => setOpen(false)}
          onSelectIcon={(ic) => { onChange(ic); setOpen(false) }}
        />
      )}
    </>
  )
}

export default function EditModal({ data, draft, onClose, onSave }: EditModalProps) {
  const isEdit = !!draft.id
  const [kind, setKind] = useState<ItemKind>(draft.kind)
  const [form, setForm] = useState<EditDraft>(draft)
  const [fetchingTitle, setFetchingTitle] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 60) }, [])

  const upd = (k: keyof EditDraft, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  // Auto-fetch page title when URL is entered and title is empty
  useEffect(() => {
    if (kind !== 'bookmark' || isEdit) return
    const url = form.url?.trim()
    if (!url || !url.includes('.')) return
    if (form.title) return

    const fullUrl = url.startsWith('http') ? url : `https://${url}`
    const timer = setTimeout(async () => {
      setFetchingTitle(true)
      try {
        const res = await fetch(`/api/page-title?url=${encodeURIComponent(fullUrl)}`)
        if (res.ok) {
          const { title } = await res.json()
          if (title) upd('title', title)
        }
      } finally {
        setFetchingTitle(false)
      }
    }, 700)
    return () => clearTimeout(timer)
  }, [form.url, kind, isEdit]) // form.title intentionally omitted to avoid re-fetch loop

  // Duplicate URL detection
  const dupBookmark = useMemo(() => {
    if (kind !== 'bookmark' || isEdit || !form.url?.trim()) return null
    const normalize = (u: string) => {
      try {
        const full = u.startsWith('http') ? u : `https://${u}`
        return new URL(full).href.toLowerCase().replace(/\/$/, '')
      } catch { return u.toLowerCase().replace(/\/$/, '') }
    }
    const target = normalize(form.url)
    return data.bookmarks.find(b => normalize(b.url) === target) ?? null
  }, [kind, isEdit, form.url, data.bookmarks])

  const toggleTag = (tid: string) =>
    upd('tags', form.tags?.includes(tid)
      ? form.tags.filter((x) => x !== tid)
      : [...(form.tags ?? []), tid])

  const canSave = kind === 'bookmark'
    ? !!(form.url && form.url.trim())
    : !!(form.name && form.name.trim())

  const submit = () => { if (canSave) onSave(kind, form) }

  return (
    <Overlay onClose={onClose}>
      <div className="modal-head">
        <h2>{isEdit ? `Edit ${kind}` : 'New'}</h2>
        <button className="icon-btn" onClick={onClose}><IconX size={16} /></button>
      </div>

      {!isEdit && (
        <div className="type-tabs">
          {TYPE_TABS.map((t) => (
            <button
              key={t.id}
              className={'type-tab' + (kind === t.id ? ' on' : '')}
              onClick={() => { setKind(t.id); setForm({ ...draft, kind: t.id }) }}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      )}

      <div className="modal-body">
        {kind === 'bookmark' && (
          <>
            <Field label="URL">
              <input
                ref={inputRef}
                className="inp"
                value={form.url ?? ''}
                placeholder="https://…"
                onChange={(e) => upd('url', e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && form.title) submit() }}
              />
            </Field>
            {dupBookmark && (
              <div className="field-warn">
                Already saved: <a href={dupBookmark.url} target="_blank" rel="noopener noreferrer">{dupBookmark.title}</a>
              </div>
            )}
            <Field label={fetchingTitle ? 'Title — fetching…' : 'Title'}>
              <input
                className="inp"
                value={form.title ?? ''}
                placeholder="Name this bookmark"
                onChange={(e) => upd('title', e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
              />
            </Field>
            <Field label="Location" hint="Categories can hold bookmarks directly; folders are nested.">
              <div className="select-wrap">
                <select className="inp" value={form.parent ?? ''} onChange={(e) => upd('parent', e.target.value)}>
                  <option value="">No parent (loose)</option>
                  <optgroup label="Categories">
                    {data.categories.map((c) => (
                      <option key={c.id} value={`c:${c.id}`}>{c.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Folders">
                    {data.folders.map((f) => {
                      const c = data.categories.find((x) => x.id === f.categoryId)
                      return (
                        <option key={f.id} value={`f:${f.id}`}>
                          {c ? `${c.name} / ` : ''}{f.name}
                        </option>
                      )
                    })}
                  </optgroup>
                </select>
                <IconChevronDown size={14} className="select-caret" />
              </div>
            </Field>
            {data.tags.length > 0 && (
              <Field label="Tags">
                <div className="tag-picker">
                  {data.tags.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={'chip tag-toggle' + (form.tags?.includes(t.id) ? ' on' : '')}
                      style={{ '--chip-h': t.hue } as React.CSSProperties}
                      onClick={() => toggleTag(t.id)}
                    >
                      <span className="chip-dot" />{t.label}
                    </button>
                  ))}
                </div>
              </Field>
            )}
            <Field label="Icon" hint="Overrides the favicon. Leave empty to use the site favicon.">
              <IconPickField icon={form.icon} onChange={(v) => upd('icon', v)} />
            </Field>
            <label className="fav-toggle">
              <input
                type="checkbox"
                checked={!!form.fav}
                onChange={(e) => upd('fav', e.target.checked)}
              />
              <span className="fav-box"><IconStar size={13} filled={!!form.fav} /></span>
              Mark as favorite
            </label>
          </>
        )}

        {kind === 'folder' && (
          <>
            <Field label="Folder name">
              <input
                ref={inputRef}
                className="inp"
                value={form.name ?? ''}
                placeholder="e.g. Design Tools"
                onChange={(e) => upd('name', e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
              />
            </Field>
            <Field label="Icon">
              <IconPickField icon={form.icon} onChange={(v) => upd('icon', v)} />
            </Field>
            <Field label="Category" hint="Leave empty to keep this folder loose.">
              <div className="select-wrap">
                <select
                  className="inp"
                  value={form.categoryId ?? ''}
                  onChange={(e) => upd('categoryId', e.target.value)}
                >
                  <option value="">No category (loose folder)</option>
                  {data.categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <IconChevronDown size={14} className="select-caret" />
              </div>
            </Field>
          </>
        )}

        {kind === 'category' && (
          <>
            <Field label="Category name">
              <input
                ref={inputRef}
                className="inp"
                value={form.name ?? ''}
                placeholder="e.g. Research"
                onChange={(e) => upd('name', e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
              />
            </Field>
            <Field label="Icon">
              <IconPickField icon={form.icon} onChange={(v) => upd('icon', v)} />
            </Field>
            <Field label="Color">
              <div className="hue-picker">
                {CAT_HUES.map((h) => (
                  <button
                    key={h}
                    type="button"
                    className={'hue-dot' + ((form.color ?? 33) === h ? ' on' : '')}
                    style={{ background: `oklch(0.72 0.14 ${h})` }}
                    onClick={() => upd('color', h)}
                  />
                ))}
              </div>
            </Field>
          </>
        )}
      </div>

      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button
          className="btn btn-accent"
          disabled={!canSave}
          onClick={submit}
        >
          {isEdit ? 'Save changes' : 'Create'}
        </button>
      </div>
    </Overlay>
  )
}
