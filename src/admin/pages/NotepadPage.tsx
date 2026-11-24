import { useState, useMemo } from 'react'
import {
  HiOutlineBookOpen,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineStar,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineFolder,
  HiOutlineClipboardCopy,
  HiOutlineDownload,
} from 'react-icons/hi'

import { useAdminCollection } from '@/admin/hooks/useAdminData'
import { createItem, updateItem, deleteItem } from '@/admin/storage'
import { ConfirmDialog } from '@/admin/components/PageHeader'
import type { AdminNote, NoteCategory } from '@/admin/types'
import { UNIFIED_VENTURES_GST } from '@/config/gst'
import { cn } from '@/utils'
import { generateNotepadExcel } from '@/admin/utils/exportNotepadExcel'
import { generateNotepadWord } from '@/admin/utils/exportNotepadWord'
import { downloadBlob } from '@/admin/utils/shareDocument'

type FilterTab = 'all' | 'work' | 'personal' | 'pinned'

export function AdminNotepadPage() {
  const { items: notes, loading, refresh } = useAdminCollection('notes')

  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [previewMode, setPreviewMode] = useState<'split' | 'preview-only' | 'edit-only'>('split')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [copyFeedback, setCopyFeedback] = useState(false)
  const [downloadingFormat, setDownloadingFormat] = useState<'docx' | 'xlsx' | null>(null)

  // Editor form state
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    projectName: '',
    subject: '',
    date: new Date().toISOString().slice(0, 10),
    category: 'work' as NoteCategory,
    pinned: false,
    content: '',
  })

  // Selected note
  const selectedNote = useMemo(() => {
    if (!notes || notes.length === 0) return null
    if (selectedNoteId) {
      return notes.find((n) => n.id === selectedNoteId) || notes[0]
    }
    return notes[0]
  }, [notes, selectedNoteId])

  // Filtered notes
  const filteredNotes = useMemo(() => {
    if (!notes) return []
    return notes
      .filter((note) => {
        if (activeTab === 'work') return note.category === 'work'
        if (activeTab === 'personal') return note.category === 'personal'
        if (activeTab === 'pinned') return Boolean(note.pinned)
        return true
      })
      .filter((note) => {
        if (!searchQuery.trim()) return true
        const query = searchQuery.toLowerCase()
        return (
          note.title?.toLowerCase().includes(query) ||
          note.clientName?.toLowerCase().includes(query) ||
          note.projectName?.toLowerCase().includes(query) ||
          note.subject?.toLowerCase().includes(query) ||
          note.content?.toLowerCase().includes(query)
        )
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        return new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
      })
  }, [notes, activeTab, searchQuery])

  // Set form when editing an existing note
  const handleStartEdit = (note: AdminNote) => {
    setSelectedNoteId(note.id)
    setFormData({
      title: note.title,
      clientName: note.clientName,
      projectName: note.projectName,
      subject: note.subject || '',
      date: note.date || new Date().toISOString().slice(0, 10),
      category: note.category || 'work',
      pinned: Boolean(note.pinned),
      content: note.content || '',
    })
    setIsEditing(true)
  }

  // Set form for brand new note
  const handleStartNew = () => {
    setSelectedNoteId(null)
    setFormData({
      title: 'New Client Consultation',
      clientName: '',
      projectName: '',
      subject: 'Architectural Joinery & Material Specifications',
      date: new Date().toISOString().slice(0, 10),
      category: 'work',
      pinned: false,
      content: `1. Spatial Zoning:
- Maintain unobstructed sightlines with natural daylight priority.
- Floor-to-ceiling custom architectural joinery with concealed acoustic detailing.

2. Material Specifications:
- Natural brushed brass accents & tactile fluted timber.
- Italian marble / honed quartzite with warm cove illumination (2700K).

3. Immediate Action Items:
- Finalize preliminary schematic drawings.
- Sample verification with client on-site.`,
    })
    setIsEditing(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    try {
      if (selectedNoteId) {
        await updateItem('notes', selectedNoteId, {
          title: formData.title,
          clientName: formData.clientName,
          projectName: formData.projectName,
          subject: formData.subject,
          date: formData.date,
          category: formData.category,
          pinned: formData.pinned,
          content: formData.content,
        })
      } else {
        const created = await createItem('notes', {
          title: formData.title,
          clientName: formData.clientName,
          projectName: formData.projectName,
          subject: formData.subject,
          date: formData.date,
          category: formData.category,
          pinned: formData.pinned,
          content: formData.content,
        })
        setSelectedNoteId(created.id)
      }
      setIsEditing(false)
      await refresh()
    } catch (err) {
      console.error('Failed to save note:', err)
    }
  }

  const handleTogglePin = async (note: AdminNote, e?: React.MouseEvent) => {
    e?.stopPropagation()
    try {
      await updateItem('notes', note.id, { pinned: !note.pinned })
      await refresh()
    } catch (err) {
      console.error('Failed to toggle pin:', err)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return
    try {
      await deleteItem('notes', deleteTargetId)
      if (selectedNoteId === deleteTargetId) {
        setSelectedNoteId(null)
      }
      setDeleteTargetId(null)
      setIsEditing(false)
      await refresh()
    } catch (err) {
      console.error('Failed to delete note:', err)
    }
  }

  // Download Word (.docx) directly
  const handleDownloadWord = async (note: AdminNote) => {
    try {
      setDownloadingFormat('docx')
      const cleanTitle = (note.title || 'NOTEPAD').replace(/[^a-zA-Z0-9_-]/g, '_')
      const filename = `UNIFIED_VENTURES_INTERIOR_NOTEPAD_${cleanTitle}.docx`
      const blob = await generateNotepadWord(note)
      downloadBlob(blob, filename)
    } catch (err) {
      console.error('Failed to download notepad Word:', err)
    } finally {
      setDownloadingFormat(null)
    }
  }

  // Download Excel (.xlsx) directly
  const handleDownloadExcel = async (note: AdminNote) => {
    try {
      setDownloadingFormat('xlsx')
      const cleanTitle = (note.title || 'NOTEPAD').replace(/[^a-zA-Z0-9_-]/g, '_')
      const filename = `UNIFIED_VENTURES_INTERIOR_NOTEPAD_${cleanTitle}.xlsx`
      const blob = await generateNotepadExcel(note)
      downloadBlob(blob, filename)
    } catch (err) {
      console.error('Failed to download notepad Excel:', err)
    } finally {
      setDownloadingFormat(null)
    }
  }

  // Web Share API with Clipboard Fallback
  const handleShareDoc = async (note: AdminNote) => {
    const shareData = {
      title: `Unified Ventures: ${note.title}`,
      text: `${note.title} - ${note.projectName || 'Bengaluru'}\n\n${note.content}\n\nUnified Ventures Atelier Bengaluru`,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // Fallback to clipboard if user cancelled or failed
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(
        `UNIFIED VENTURES\n${note.title}\nClient: ${note.clientName}\nProject: ${note.projectName}\n\n${note.content}`,
      )
      setCopyFeedback(true)
      setTimeout(() => setCopyFeedback(false), 2500)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const activeDoc = isEditing ? (formData as unknown as AdminNote) : selectedNote

  return (
    <div className="relative min-h-[calc(100vh-6rem)]">
      {/* Print-Only Sheet Container */}
      <div className="hidden print:block print:w-full print:bg-white print:text-black print:p-0">
        {activeDoc && <LetterheadDocument note={activeDoc} />}
      </div>

      {/* Main UI (Hidden when printing) */}
      <div className="space-y-6 print:hidden">
        {/* Header Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-400/10 text-gold-600">
                <HiOutlineBookOpen className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-h3 font-serif text-charcoal-900 tracking-tight">
                  Branded Notepad
                </h1>
                <p className="text-body-sm text-charcoal-500">
                  Create, brand, manage and share official Unified Ventures memorandums & client notes.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleStartNew}
              className="inline-flex items-center gap-2 rounded-lg bg-charcoal-900 px-4 py-2.5 text-body-sm font-medium text-white shadow-sm transition-all hover:bg-charcoal-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gold-400"
            >
              <HiOutlinePlus className="h-4 w-4 text-gold-400" />
              <span>New Note</span>
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-xl border border-border/80 bg-white p-4 shadow-2xs">
            <p className="text-xs font-medium uppercase tracking-wider text-charcoal-500">Total Notes</p>
            <p className="mt-1 text-2xl font-serif font-semibold text-charcoal-900">
              {notes?.length ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-border/80 bg-white p-4 shadow-2xs">
            <p className="text-xs font-medium uppercase tracking-wider text-charcoal-500">Work Notes</p>
            <p className="mt-1 text-2xl font-serif font-semibold text-charcoal-900">
              {notes?.filter((n) => n.category === 'work').length ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-border/80 bg-white p-4 shadow-2xs">
            <p className="text-xs font-medium uppercase tracking-wider text-charcoal-500">Personal Notes</p>
            <p className="mt-1 text-2xl font-serif font-semibold text-charcoal-900">
              {notes?.filter((n) => n.category === 'personal').length ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-border/80 bg-white p-4 shadow-2xs">
            <p className="text-xs font-medium uppercase tracking-wider text-gold-600">Pinned / Priority</p>
            <p className="mt-1 text-2xl font-serif font-semibold text-gold-700">
              {notes?.filter((n) => n.pinned).length ?? 0}
            </p>
          </div>
        </div>

        {/* Main Work Area: Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Note Explorer & Filters (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Search and Filters */}
            <div className="rounded-xl border border-border bg-white p-4 shadow-2xs space-y-3">
              <div className="relative">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                <input
                  type="text"
                  placeholder="Search notes, clients, projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-border/80 bg-ivory-50/50 pl-9 pr-3 py-2 text-body-sm text-charcoal-900 placeholder-charcoal-400 focus:border-gold-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gold-400 transition"
                />
              </div>

              {/* Tabs */}
              <div className="flex rounded-lg bg-charcoal-100/60 p-1 text-body-xs font-medium text-charcoal-600">
                {(['all', 'work', 'personal', 'pinned'] as FilterTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'flex-1 rounded-md py-1.5 capitalize transition-all',
                      activeTab === tab
                        ? 'bg-white text-charcoal-900 shadow-2xs font-semibold'
                        : 'text-charcoal-500 hover:text-charcoal-900',
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Note List */}
            <div className="space-y-2.5 max-h-[70vh] overflow-y-auto overscroll-contain pr-1">
              {loading && (!notes || notes.length === 0) ? (
                <div className="rounded-xl border border-dashed border-border bg-white/50 p-8 text-center text-charcoal-400 text-body-sm">
                  Loading notes...
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-white/50 p-8 text-center text-charcoal-400 text-body-sm">
                  No notes match your criteria.
                </div>
              ) : (
                filteredNotes.map((note) => {
                  const isSelected = selectedNote?.id === note.id && !isEditing
                  return (
                    <div
                      key={note.id}
                      onClick={() => {
                        setSelectedNoteId(note.id)
                        setIsEditing(false)
                      }}
                      className={cn(
                        'group relative cursor-pointer rounded-xl border p-4 transition-all',
                        isSelected
                          ? 'border-gold-400 bg-gold-400/5 shadow-xs'
                          : 'border-border/80 bg-white hover:border-gold-300 hover:shadow-2xs',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'inline-block h-2 w-2 rounded-full',
                                note.category === 'work' ? 'bg-gold-500' : 'bg-charcoal-400',
                              )}
                            />
                            <h3 className="truncate text-body-sm font-semibold text-charcoal-900">
                              {note.title || 'Untitled Note'}
                            </h3>
                          </div>
                          {(note.clientName || note.projectName) && (
                            <p className="mt-1 truncate text-caption text-charcoal-500">
                              {note.clientName ? note.clientName : ''}
                              {note.clientName && note.projectName ? ' · ' : ''}
                              {note.projectName ? note.projectName : ''}
                            </p>
                          )}
                        </div>

                        {/* Pin Button */}
                        <button
                          type="button"
                          onClick={(e) => handleTogglePin(note, e)}
                          title={note.pinned ? 'Unpin note' : 'Pin note'}
                          className={cn(
                            'shrink-0 p-1 rounded transition',
                            note.pinned
                              ? 'text-gold-500 hover:text-gold-600'
                              : 'text-charcoal-300 opacity-0 group-hover:opacity-100 hover:text-charcoal-600',
                          )}
                        >
                          <HiOutlineStar className={cn('h-4 w-4', note.pinned && 'fill-gold-400')} />
                        </button>
                      </div>

                      <p className="mt-2 line-clamp-2 text-caption text-charcoal-600">
                        {note.content || 'No content...'}
                      </p>

                      <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-caption text-charcoal-400">
                        <span className="flex items-center gap-1">
                          <HiOutlineClock className="h-3.5 w-3.5" />
                          {note.date || note.createdAt.slice(0, 10)}
                        </span>
                        <span className="capitalize font-mono text-[11px] tracking-wide text-charcoal-500">
                          {note.category}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Right Column: Note Detail / Editor / Live Branded Document (8 cols on lg) */}
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-border bg-white shadow-xs overflow-hidden">
              {/* Document Header Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-ivory-50/70 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-body-xs font-medium uppercase tracking-wider text-charcoal-500">
                    {isEditing ? (selectedNoteId ? 'Editing Note' : 'Drafting Note') : 'Branded Letterhead Preview'}
                  </span>
                  {activeDoc?.category && (
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                        activeDoc.category === 'work'
                          ? 'bg-gold-400/20 text-gold-700'
                          : 'bg-charcoal-100 text-charcoal-700',
                      )}
                    >
                      {activeDoc.category}
                    </span>
                  )}
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center gap-2">
                  {!isEditing && selectedNote && (
                    <>
                      <button
                        onClick={() => handleStartEdit(selectedNote)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-caption font-medium text-charcoal-700 hover:bg-ivory-100 hover:text-charcoal-900 transition"
                        title="Edit note"
                      >
                        <HiOutlinePencilAlt className="h-4 w-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      <button
                        onClick={() => handleDownloadWord(selectedNote)}
                        disabled={downloadingFormat !== null}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-caption font-medium text-charcoal-700 hover:bg-ivory-100 hover:text-charcoal-900 transition cursor-pointer disabled:opacity-60"
                        title="Download Word (.docx)"
                      >
                        <HiOutlineDownload className="h-4 w-4 text-blue-600" />
                        <span className="hidden sm:inline">
                          {downloadingFormat === 'docx' ? 'Downloading...' : 'Download Word (.docx)'}
                        </span>
                      </button>

                      <button
                        onClick={() => handleDownloadExcel(selectedNote)}
                        disabled={downloadingFormat !== null}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-caption font-medium text-charcoal-700 hover:bg-ivory-100 hover:text-charcoal-900 transition cursor-pointer disabled:opacity-60"
                        title="Download Excel (.xlsx)"
                      >
                        <HiOutlineDownload className="h-4 w-4 text-emerald-600" />
                        <span className="hidden sm:inline">
                          {downloadingFormat === 'xlsx' ? 'Downloading...' : 'Download Excel (.xlsx)'}
                        </span>
                      </button>

                      <button
                        onClick={() => handleShareDoc(selectedNote)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-caption font-medium text-charcoal-700 hover:bg-ivory-100 hover:text-charcoal-900 transition"
                        title="Copy note summary"
                      >
                        {copyFeedback ? (
                          <>
                            <HiOutlineCheck className="h-4 w-4 text-emerald-600" />
                            <span className="hidden sm:inline text-emerald-600 font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <HiOutlineClipboardCopy className="h-4 w-4" />
                            <span className="hidden sm:inline">Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setDeleteTargetId(selectedNote.id)}
                        className="inline-flex items-center p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                        title="Delete note"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  {isEditing && (
                    <div className="flex items-center gap-2">
                      {/* View toggle in edit mode */}
                      <div className="flex rounded-md bg-charcoal-100 p-0.5 text-[11px] font-medium text-charcoal-600">
                        <button
                          type="button"
                          onClick={() => setPreviewMode('edit-only')}
                          className={cn(
                            'rounded px-2 py-1 transition',
                            previewMode === 'edit-only' ? 'bg-white font-semibold text-charcoal-900 shadow-2xs' : '',
                          )}
                        >
                          Editor
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewMode('split')}
                          className={cn(
                            'rounded px-2 py-1 transition',
                            previewMode === 'split' ? 'bg-white font-semibold text-charcoal-900 shadow-2xs' : '',
                          )}
                        >
                          Split
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewMode('preview-only')}
                          className={cn(
                            'rounded px-2 py-1 transition',
                            previewMode === 'preview-only' ? 'bg-white font-semibold text-charcoal-900 shadow-2xs' : '',
                          )}
                        >
                          Preview
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="rounded-lg border border-border bg-white px-3 py-1.5 text-caption font-medium text-charcoal-700 hover:bg-ivory-100"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Body Content */}
              {isEditing ? (
                <div className="p-6">
                  <div
                    className={cn(
                      'grid gap-6',
                      previewMode === 'split' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1',
                    )}
                  >
                    {/* Form Controls */}
                    {previewMode !== 'preview-only' && (
                      <form onSubmit={handleSave} className="space-y-4">
                        <div>
                          <label className="block text-caption font-medium text-charcoal-700 mb-1">
                            Note Title *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Living Pavilion Design Brief"
                            className="w-full rounded-lg border border-border px-3 py-2 text-body-sm text-charcoal-900 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-caption font-medium text-charcoal-700 mb-1">
                              Client Name
                            </label>
                            <div className="relative">
                              <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                              <input
                                type="text"
                                value={formData.clientName}
                                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                placeholder="e.g. Siddharth & Priya Rao"
                                className="w-full rounded-lg border border-border pl-9 pr-3 py-2 text-body-sm text-charcoal-900 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-caption font-medium text-charcoal-700 mb-1">
                              Project Name
                            </label>
                            <div className="relative">
                              <HiOutlineFolder className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                              <input
                                type="text"
                                value={formData.projectName}
                                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                                placeholder="e.g. Prestige Park Square"
                                className="w-full rounded-lg border border-border pl-9 pr-3 py-2 text-body-sm text-charcoal-900 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-caption font-medium text-charcoal-700 mb-1">
                              Optional Subject / Tagline
                            </label>
                            <input
                              type="text"
                              value={formData.subject}
                              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                              placeholder="e.g. Joinery & Material Specifications"
                              className="w-full rounded-lg border border-border px-3 py-2 text-body-sm text-charcoal-900 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-caption font-medium text-charcoal-700 mb-1">
                              Date
                            </label>
                            <input
                              type="date"
                              value={formData.date}
                              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                              className="w-full rounded-lg border border-border px-3 py-2 text-body-sm text-charcoal-900 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-b border-border/60 py-3">
                          <div className="flex items-center gap-4">
                            <label className="inline-flex items-center gap-2 text-body-sm text-charcoal-700 cursor-pointer">
                              <input
                                type="radio"
                                name="category"
                                value="work"
                                checked={formData.category === 'work'}
                                onChange={() => setFormData({ ...formData, category: 'work' })}
                                className="text-gold-500 focus:ring-gold-400"
                              />
                              <span>Work Note</span>
                            </label>
                            <label className="inline-flex items-center gap-2 text-body-sm text-charcoal-700 cursor-pointer">
                              <input
                                type="radio"
                                name="category"
                                value="personal"
                                checked={formData.category === 'personal'}
                                onChange={() => setFormData({ ...formData, category: 'personal' })}
                                className="text-gold-500 focus:ring-gold-400"
                              />
                              <span>Personal Note</span>
                            </label>
                          </div>

                          <label className="inline-flex items-center gap-2 text-body-sm text-charcoal-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.pinned}
                              onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                              className="rounded text-gold-500 focus:ring-gold-400"
                            />
                            <span>Pin Note</span>
                          </label>
                        </div>

                        {/* Content Area with quick formatting toolbar */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-caption font-medium text-charcoal-700">
                              Note Description / Content
                            </label>
                            <span className="text-caption text-charcoal-400">
                              {formData.content.length} characters
                            </span>
                          </div>

                          {/* Quick insertion toolbar */}
                          <div className="flex flex-wrap items-center gap-1.5 rounded-t-lg border border-b-0 border-border bg-ivory-50 px-2.5 py-1.5 text-xs text-charcoal-600">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, content: formData.content + '\n• ' })}
                              className="rounded px-2 py-1 font-mono hover:bg-charcoal-200/60"
                              title="Add Bullet Point"
                            >
                              • Bullet
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, content: formData.content + '\n1. ' })}
                              className="rounded px-2 py-1 font-mono hover:bg-charcoal-200/60"
                              title="Add Numbered List"
                            >
                              1. Numbered
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  content:
                                    formData.content +
                                    '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n',
                                })
                              }
                              className="rounded px-2 py-1 font-mono hover:bg-charcoal-200/60"
                              title="Add Divider Line"
                            >
                              ― Divider
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  content:
                                    formData.content +
                                    '\n[SPECIFICATION / REQUIREMENT]:\n',
                                })
                              }
                              className="rounded px-2 py-1 font-mono hover:bg-charcoal-200/60"
                              title="Add Section Header"
                            >
                              [Header]
                            </button>
                          </div>

                          <textarea
                            rows={12}
                            required
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Enter detailed architectural notes, client specifications, finishes, measurements, or action items..."
                            className="w-full rounded-b-lg border border-border px-3.5 py-2.5 text-body-sm text-charcoal-900 font-mono leading-relaxed focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="rounded-lg border border-border px-4 py-2 text-body-sm font-medium text-charcoal-600 hover:bg-ivory-100"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="rounded-lg bg-charcoal-900 px-5 py-2 text-body-sm font-medium text-white hover:bg-charcoal-800 shadow-sm"
                          >
                            Save Note
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Live Preview Pane */}
                    {previewMode !== 'edit-only' && (
                      <div className="border border-border/80 rounded-xl bg-ivory-50/40 p-4">
                        <LetterheadDocument note={formData as unknown as AdminNote} />
                      </div>
                    )}
                  </div>
                </div>
              ) : selectedNote ? (
                /* Read-Only Letterhead View */
                <div className="p-4 sm:p-6 bg-ivory-50/30">
                  <LetterheadDocument note={selectedNote} />
                </div>
              ) : (
                <div className="p-16 text-center text-charcoal-400">
                  <HiOutlineBookOpen className="mx-auto h-12 w-12 text-charcoal-300 stroke-1" />
                  <p className="mt-3 text-body-md font-medium text-charcoal-700">No Note Selected</p>
                  <p className="mt-1 text-body-sm text-charcoal-400">
                    Select a note from the left sidebar or draft a new branded document.
                  </p>
                  <button
                    onClick={handleStartNew}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-charcoal-900 px-4 py-2 text-body-sm font-medium text-white hover:bg-charcoal-800"
                  >
                    <HiOutlinePlus className="h-4 w-4 text-gold-400" />
                    <span>Create Note</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        title="Delete Branded Note?"
        message="Are you sure you want to delete this note? This action will permanently remove it from your records."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  )
}

/**
 * Branded Letterhead & A4 Print-Ready Document Component
 * Strictly styled to match Unified Ventures luxury interior design aesthetic.
 */
function LetterheadDocument({ note }: { note: Partial<AdminNote> }) {
  return (
    <div className="mx-auto w-full max-w-[800px] bg-white text-charcoal-900 border border-border/80 rounded-xl shadow-xs p-8 sm:p-12 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none">
      {/* Letterhead Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 pb-6 border-b-2 border-gold-400">
        <div>
          <div>
            <img
              src="/logo.png"
              alt="Unified Ventures Logo"
              className="h-10 sm:h-12 w-auto object-contain shrink-0 mb-2"
            />
          </div>
        </div>

        {/* Company Contact Details (Verified Bengaluru Location) */}
        <div className="text-left sm:text-right text-[11px] leading-relaxed text-charcoal-600 font-sans">
          <p className="font-semibold text-charcoal-900">Unified Ventures</p>
          <p>{UNIFIED_VENTURES_GST.address.building}</p>
          <p>{UNIFIED_VENTURES_GST.address.street}, {UNIFIED_VENTURES_GST.address.city}, {UNIFIED_VENTURES_GST.address.state} {UNIFIED_VENTURES_GST.address.pincode}, {UNIFIED_VENTURES_GST.address.country}.</p>
          <p className="mt-1 font-mono text-[10px] text-charcoal-700">
            Tel: +91 88 6772 5353
          </p>
          <p className="font-mono text-[10px] text-gold-700">
            support.unifiedventures@gmail.com
          </p>
        </div>
      </div>

      {/* Decorative Gold Accent Bar */}
      <div className="flex items-center justify-between py-2.5 px-3 my-4 bg-charcoal-900 text-ivory-100 rounded-md print:bg-charcoal-900 print:text-white">
        <span className="text-[11px] font-mono uppercase tracking-widest text-gold-400 font-semibold">
          Architectural Memorandum & Client Record
        </span>
        <span className="text-[11px] font-mono tracking-wider text-ivory-200">
          Ref: UV-{note.category?.toUpperCase() || 'WORK'}-{note.date?.replace(/-/g, '') || '2026'}
        </span>
      </div>

      {/* Document Metadata Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg bg-ivory-50/80 p-4 border border-border/60 text-xs my-6 print:bg-gray-50 print:border-gray-200">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">Client / Recipient</p>
          <p className="mt-0.5 font-serif text-sm font-semibold text-charcoal-900">
            {note.clientName || 'Private Residence Client'}
          </p>
          {note.projectName && (
            <p className="text-charcoal-600 font-sans mt-0.5">
              Project: <span className="font-medium text-charcoal-800">{note.projectName}</span>
            </p>
          )}
        </div>

        <div className="sm:text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">Date Issued</p>
          <p className="mt-0.5 font-mono text-sm font-semibold text-charcoal-900">
            {note.date || new Date().toISOString().slice(0, 10)}
          </p>
          {note.subject && (
            <p className="text-gold-700 font-serif italic mt-0.5">
              Subject: {note.subject}
            </p>
          )}
        </div>
      </div>

      {/* Document Title */}
      <div className="my-6">
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-charcoal-900 tracking-tight">
          {note.title || 'Untitled Document'}
        </h1>
        <div className="mt-2 h-0.5 w-16 bg-gold-400" />
      </div>

      {/* Main Document Body */}
      <div className="my-8 font-sans text-sm sm:text-base leading-relaxed text-charcoal-800 whitespace-pre-line min-h-[220px]">
        {note.content || 'No details specified.'}
      </div>

      {/* Professional Letterhead Sign-off & Footer */}
      <div className="mt-12 pt-8 border-t border-border/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="text-xs text-charcoal-600 leading-relaxed">
            <p className="font-serif font-medium text-charcoal-900">Executed by Unified Ventures Atelier</p>
            <p className="text-[11px] text-charcoal-500">
              Bengaluru, Karnataka, India · Authorized Client Brief
            </p>
            <p className="mt-1 font-mono text-[10px] text-charcoal-400">
              Confidential & Proprietary Design Document
            </p>
          </div>

          <div className="text-left sm:text-right">
            <div className="h-10 border-b border-charcoal-400 w-44 mb-1" />
            <p className="text-[11px] font-medium text-charcoal-900 uppercase tracking-wider">
              Principal Architect / Atelier Director
            </p>
            <p className="text-[10px] text-gold-600 font-serif">Unified Ventures</p>
          </div>
        </div>

        {/* Bottom Decorative Fine Line */}
        <div className="mt-8 text-center text-[10px] font-mono tracking-wider text-charcoal-400 border-t border-border/40 pt-3">
          Unified Ventures · Luxury Residential & Commercial Interior Architecture · Bengaluru, India
        </div>
      </div>
    </div>
  )
}

