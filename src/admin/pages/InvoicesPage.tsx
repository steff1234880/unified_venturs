import { useState, useMemo } from 'react'
import {
  HiOutlineDocumentReport,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlinePencilAlt,
  HiOutlineTrash,
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
import type { AdminInvoice, InvoiceItem, InvoiceStatus } from '@/admin/types'
import { UNIFIED_VENTURES_GST } from '@/config/gst'
import { numberToIndianWords, formatINR } from '@/admin/utils/invoice'
import { cn } from '@/utils'
import { generateInvoiceExcel } from '@/admin/utils/exportInvoiceExcel'
import { generateInvoiceWord } from '@/admin/utils/exportInvoiceWord'
import { downloadBlob } from '@/admin/utils/shareDocument'

type FilterStatus = 'all' | 'issued' | 'paid' | 'draft' | 'cancelled'

const INDIAN_STATES = [
  { code: '29', name: 'Karnataka' },
  { code: '27', name: 'Maharashtra' },
  { code: '07', name: 'Delhi' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '36', name: 'Telangana' },
  { code: '32', name: 'Kerala' },
  { code: '24', name: 'Gujarat' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '19', name: 'West Bengal' },
  { code: '08', name: 'Rajasthan' },
  { code: '06', name: 'Haryana' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '21', name: 'Odisha' },
  { code: '10', name: 'Bihar' },
  { code: '03', name: 'Punjab' },
  { code: '30', name: 'Goa' },
  { code: '37', name: 'Andhra Pradesh' },
]

export function AdminInvoicesPage() {
  const { items: invoices, loading, refresh } = useAdminCollection('invoices')

  const [activeTab, setActiveTab] = useState<FilterStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editTab, setEditTab] = useState<'form' | 'preview'>('form')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [copyFeedback, setCopyFeedback] = useState(false)
  const [downloadingFormat, setDownloadingFormat] = useState<'xlsx' | 'docx' | null>(null)

  // Editor Form state
  const [formData, setFormData] = useState<Omit<AdminInvoice, 'id' | 'createdAt' | 'updatedAt'>>({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
    status: 'issued',
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientGstin: '',
    clientState: 'Karnataka',
    clientStateCode: '29',
    placeOfSupply: 'Karnataka (29)',
    placeOfSupplyStateCode: '29',
    isInterState: false,
    projectName: '',
    poNumber: '',
    items: [],
    taxableSubtotal: 0,
    totalCgst: 0,
    totalSgst: 0,
    totalIgst: 0,
    grandTotal: 0,
    roundOff: 0,
    amountInWords: '',
    notes: 'Payment terms: 50% mobilization advance along with purchase order, balance payable upon milestone sign-off. Interest @ 18% p.a. will be levied for delayed payments beyond the due date.',
    bankDetails: {
      bankName: UNIFIED_VENTURES_GST.bank.bankName,
      accountName: UNIFIED_VENTURES_GST.bank.accountName,
      accountNumber: UNIFIED_VENTURES_GST.bank.accountNumber,
      ifscCode: UNIFIED_VENTURES_GST.bank.ifscCode,
      branch: UNIFIED_VENTURES_GST.bank.branch,
      upiId: UNIFIED_VENTURES_GST.bank.upiId,
    },
  })

  // Selected Invoice
  const selectedInvoice = useMemo(() => {
    if (!invoices || invoices.length === 0) return null
    if (selectedInvoiceId) {
      return invoices.find((inv) => inv.id === selectedInvoiceId) || invoices[0]
    }
    return invoices[0]
  }, [invoices, selectedInvoiceId])

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    if (!invoices) return []
    return invoices
      .filter((inv) => {
        if (activeTab === 'all') return true
        return inv.status === activeTab
      })
      .filter((inv) => {
        if (!searchQuery.trim()) return true
        const q = searchQuery.toLowerCase()
        return (
          inv.invoiceNumber?.toLowerCase().includes(q) ||
          inv.clientName?.toLowerCase().includes(q) ||
          inv.clientCompany?.toLowerCase().includes(q) ||
          inv.clientGstin?.toLowerCase().includes(q) ||
          inv.projectName?.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime())
  }, [invoices, activeTab, searchQuery])

  // Financial Summary Stats
  const stats = useMemo(() => {
    const list = invoices || []
    const totalRevenue = list.reduce((acc, curr) => acc + (curr.grandTotal || 0), 0)
    const totalTax = list.reduce(
      (acc, curr) => acc + (curr.totalCgst || 0) + (curr.totalSgst || 0) + (curr.totalIgst || 0),
      0,
    )
    const paidCount = list.filter((i) => i.status === 'paid').length
    const pendingCount = list.filter((i) => i.status === 'issued').length

    return {
      totalCount: list.length,
      totalRevenue,
      totalTax,
      paidCount,
      pendingCount,
    }
  }, [invoices])

  // Recalculate totals for invoice items
  const recalculateInvoice = (
    items: InvoiceItem[],
    isInterState: boolean,
  ) => {
    let taxableSubtotal = 0
    let totalCgst = 0
    let totalSgst = 0
    let totalIgst = 0

    const updatedItems = items.map((item) => {
      const taxable = Number((item.quantity * item.rate).toFixed(2))
      taxableSubtotal += taxable

      let cgst = 0
      let sgst = 0
      let igst = 0

      if (isInterState) {
        igst = Number(((taxable * item.gstRate) / 100).toFixed(2))
        totalIgst += igst
      } else {
        cgst = Number(((taxable * (item.gstRate / 2)) / 100).toFixed(2))
        sgst = Number(((taxable * (item.gstRate / 2)) / 100).toFixed(2))
        totalCgst += cgst
        totalSgst += sgst
      }

      const total = Number((taxable + cgst + sgst + igst).toFixed(2))

      return {
        ...item,
        taxableAmount: taxable,
        cgstAmount: cgst,
        sgstAmount: sgst,
        igstAmount: igst,
        totalAmount: total,
      }
    })

    const rawGrandTotal = taxableSubtotal + totalCgst + totalSgst + totalIgst
    const roundedGrandTotal = Math.round(rawGrandTotal)
    const roundOff = Number((roundedGrandTotal - rawGrandTotal).toFixed(2))

    return {
      items: updatedItems,
      taxableSubtotal: Number(taxableSubtotal.toFixed(2)),
      totalCgst: Number(totalCgst.toFixed(2)),
      totalSgst: Number(totalSgst.toFixed(2)),
      totalIgst: Number(totalIgst.toFixed(2)),
      grandTotal: roundedGrandTotal,
      roundOff,
      amountInWords: numberToIndianWords(roundedGrandTotal),
    }
  }

  // Generate next automatic invoice number
  const getNextInvoiceNumber = () => {
    const fiscalYear = '2026-27'
    const count = (invoices?.length ?? 0) + 1
    const padNum = String(count).padStart(3, '0')
    return `UV/${fiscalYear}/${padNum}`
  }

  // Create new invoice
  const handleStartNew = () => {
    setSelectedInvoiceId(null)
    const initialItem: InvoiceItem = {
      id: Math.random().toString(36).slice(2, 9),
      description: 'Comprehensive Interior Architecture & Living Space Planning Services',
      sacHsn: UNIFIED_VENTURES_GST.defaultSac,
      quantity: 1,
      unit: 'LS',
      rate: 150000,
      taxableAmount: 150000,
      gstRate: 18,
      cgstAmount: 13500,
      sgstAmount: 13500,
      igstAmount: 0,
      totalAmount: 177000,
    }

    const calculated = recalculateInvoice([initialItem], false)

    setFormData({
      invoiceNumber: getNextInvoiceNumber(),
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      status: 'issued',
      clientName: '',
      clientCompany: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      clientGstin: '',
      clientState: 'Karnataka',
      clientStateCode: '29',
      placeOfSupply: 'Karnataka (29)',
      placeOfSupplyStateCode: '29',
      isInterState: false,
      projectName: '',
      poNumber: '',
      ...calculated,
      notes: 'Payment terms: 50% mobilization advance along with purchase order, balance payable upon milestone sign-off. Interest @ 18% p.a. will be levied for delayed payments beyond the due date.',
      bankDetails: {
        bankName: UNIFIED_VENTURES_GST.bank.bankName,
        accountName: UNIFIED_VENTURES_GST.bank.accountName,
        accountNumber: UNIFIED_VENTURES_GST.bank.accountNumber,
        ifscCode: UNIFIED_VENTURES_GST.bank.ifscCode,
        branch: UNIFIED_VENTURES_GST.bank.branch,
        upiId: UNIFIED_VENTURES_GST.bank.upiId,
      },
    })
    setEditTab('form')
    setIsEditing(true)
  }

  // Edit an existing invoice
  const handleStartEdit = (inv: AdminInvoice) => {
    setSelectedInvoiceId(inv.id)
    setFormData({
      invoiceNumber: inv.invoiceNumber,
      invoiceDate: inv.invoiceDate,
      dueDate: inv.dueDate || '',
      status: inv.status,
      clientName: inv.clientName,
      clientCompany: inv.clientCompany || '',
      clientEmail: inv.clientEmail || '',
      clientPhone: inv.clientPhone || '',
      clientAddress: inv.clientAddress || '',
      clientGstin: inv.clientGstin || '',
      clientState: inv.clientState || 'Karnataka',
      clientStateCode: inv.clientStateCode || '29',
      placeOfSupply: inv.placeOfSupply || 'Karnataka (29)',
      placeOfSupplyStateCode: inv.placeOfSupplyStateCode || '29',
      isInterState: Boolean(inv.isInterState),
      projectName: inv.projectName || '',
      poNumber: inv.poNumber || '',
      items: inv.items || [],
      taxableSubtotal: inv.taxableSubtotal,
      totalCgst: inv.totalCgst,
      totalSgst: inv.totalSgst,
      totalIgst: inv.totalIgst,
      grandTotal: inv.grandTotal,
      roundOff: inv.roundOff || 0,
      amountInWords: inv.amountInWords || numberToIndianWords(inv.grandTotal),
      notes: inv.notes || '',
      bankDetails: inv.bankDetails || {
        bankName: UNIFIED_VENTURES_GST.bank.bankName,
        accountName: UNIFIED_VENTURES_GST.bank.accountName,
        accountNumber: UNIFIED_VENTURES_GST.bank.accountNumber,
        ifscCode: UNIFIED_VENTURES_GST.bank.ifscCode,
        branch: UNIFIED_VENTURES_GST.bank.branch,
        upiId: UNIFIED_VENTURES_GST.bank.upiId,
      },
    })
    setEditTab('form')
    setIsEditing(true)
  }

  // Save Invoice (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.invoiceNumber.trim() || !formData.clientName.trim()) return

    try {
      if (selectedInvoiceId) {
        await updateItem('invoices', selectedInvoiceId, formData)
      } else {
        const created = await createItem('invoices', formData)
        setSelectedInvoiceId(created.id)
      }
      setIsEditing(false)
      await refresh()
    } catch (err) {
      console.error('Failed to save invoice:', err)
    }
  }

  // Delete invoice
  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return
    try {
      await deleteItem('invoices', deleteTargetId)
      if (selectedInvoiceId === deleteTargetId) {
        setSelectedInvoiceId(null)
      }
      setDeleteTargetId(null)
      setIsEditing(false)
      await refresh()
    } catch (err) {
      console.error('Failed to delete invoice:', err)
    }
  }

  // Change Item Fields
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...formData.items]
    const current = updated[index]
    if (!current) return
    updated[index] = { ...current, [field]: value }

    const recalculated = recalculateInvoice(updated, formData.isInterState)
    setFormData((prev) => ({
      ...prev,
      ...recalculated,
    }))
  }

  // Add Item Line
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Math.random().toString(36).slice(2, 9),
      description: 'Bespoke Interior Woodwork & Architectural Fit-out Works',
      sacHsn: '995471',
      quantity: 1,
      unit: 'LS',
      rate: 50000,
      taxableAmount: 50000,
      gstRate: 18,
      cgstAmount: 4500,
      sgstAmount: 4500,
      igstAmount: 0,
      totalAmount: 59000,
    }
    const updated = [...formData.items, newItem]
    const recalculated = recalculateInvoice(updated, formData.isInterState)
    setFormData((prev) => ({ ...prev, ...recalculated }))
  }

  // Remove Item Line
  const handleRemoveItem = (index: number) => {
    if (formData.items.length <= 1) return
    const updated = formData.items.filter((_, i) => i !== index)
    const recalculated = recalculateInvoice(updated, formData.isInterState)
    setFormData((prev) => ({ ...prev, ...recalculated }))
  }

  // Handle State Change (detect if inter-state or intra-state)
  const handleClientStateChange = (stateCode: string) => {
    const stateObj = INDIAN_STATES.find((s) => s.code === stateCode)
    const isInter = stateCode !== UNIFIED_VENTURES_GST.stateCode
    const recalculated = recalculateInvoice(formData.items, isInter)

    setFormData((prev) => ({
      ...prev,
      clientStateCode: stateCode,
      clientState: stateObj?.name || 'Karnataka',
      placeOfSupply: `${stateObj?.name || 'Karnataka'} (${stateCode})`,
      placeOfSupplyStateCode: stateCode,
      isInterState: isInter,
      ...recalculated,
    }))
  }

  // Direct Download Excel (.xlsx)
  const handleDownloadExcel = async (inv: AdminInvoice) => {
    try {
      setDownloadingFormat('xlsx')
      const cleanInvNumber = (inv.invoiceNumber || 'INVOICE').replace(/[^a-zA-Z0-9_-]/g, '_')
      const filename = `UNIFIED_VENTURES_GST_INVOICE_${cleanInvNumber}.xlsx`
      const blob = await generateInvoiceExcel(inv)
      downloadBlob(blob, filename)
    } catch (err) {
      console.error('Failed to download invoice Excel:', err)
    } finally {
      setDownloadingFormat(null)
    }
  }

  // Direct Download Word (.docx)
  const handleDownloadWord = async (inv: AdminInvoice) => {
    try {
      setDownloadingFormat('docx')
      const cleanInvNumber = (inv.invoiceNumber || 'INVOICE').replace(/[^a-zA-Z0-9_-]/g, '_')
      const filename = `UNIFIED_VENTURES_GST_INVOICE_${cleanInvNumber}.docx`
      const blob = await generateInvoiceWord(inv)
      downloadBlob(blob, filename)
    } catch (err) {
      console.error('Failed to download invoice Word:', err)
    } finally {
      setDownloadingFormat(null)
    }
  }

  // Copy Summary
  const handleCopySummary = async (inv: AdminInvoice) => {
    const text = `UNIFIED VENTURES - TAX INVOICE\nInvoice: ${inv.invoiceNumber}\nClient: ${inv.clientName}\nGrand Total: ${formatINR(inv.grandTotal)}\nGSTIN: ${UNIFIED_VENTURES_GST.gstin}`
    try {
      await navigator.clipboard.writeText(text)
      setCopyFeedback(true)
      setTimeout(() => setCopyFeedback(false), 2500)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const activeInvoice = isEditing ? (formData as unknown as AdminInvoice) : selectedInvoice

  return (
    <div className="relative min-h-full w-full max-w-full">
      {/* Print-Only Document Container */}
      <div className="hidden print:block print:w-full print:bg-white print:text-black print:p-0">
        {activeInvoice && <GstTaxInvoiceDocument invoice={activeInvoice} />}
      </div>

      {/* Main UI (Hidden when printing) */}
      <div className="space-y-6 print:hidden">
        {/* Header Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-400/10 text-gold-600">
                <HiOutlineDocumentReport className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-h3 font-serif text-charcoal-900 tracking-tight">
                  GST Invoices
                </h1>
                <p className="text-body-sm text-charcoal-500">
                  Generate, track, print and issue official GST-compliant tax invoices for Unified Ventures.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleStartNew}
              className="inline-flex items-center gap-2 rounded-lg bg-charcoal-900 px-4 py-2.5 text-body-sm font-medium text-white shadow-sm transition-all hover:bg-charcoal-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gold-400 cursor-pointer"
            >
              <HiOutlinePlus className="h-4 w-4 text-gold-400" />
              <span>Create GST Invoice</span>
            </button>
          </div>
        </div>

        {/* Financial Stat Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-xl border border-border/80 bg-white p-4 shadow-2xs">
            <p className="text-xs font-medium uppercase tracking-wider text-charcoal-500">Total Billed</p>
            <p className="mt-1 text-lg sm:text-2xl font-serif font-bold text-charcoal-900 truncate">
              {formatINR(stats.totalRevenue)}
            </p>
            <p className="mt-1 text-[11px] text-charcoal-400">{stats.totalCount} Invoices Total</p>
          </div>

          <div className="rounded-xl border border-border/80 bg-white p-4 shadow-2xs">
            <p className="text-xs font-medium uppercase tracking-wider text-charcoal-500">Total GST Collected</p>
            <p className="mt-1 text-lg sm:text-2xl font-serif font-bold text-charcoal-900 truncate">
              {formatINR(stats.totalTax)}
            </p>
            <p className="mt-1 text-[11px] text-charcoal-400">CGST + SGST + IGST</p>
          </div>

          <div className="rounded-xl border border-border/80 bg-white p-4 shadow-2xs">
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-600">Paid Invoices</p>
            <p className="mt-1 text-lg sm:text-2xl font-serif font-bold text-emerald-700">
              {stats.paidCount}
            </p>
            <p className="mt-1 text-[11px] text-charcoal-400">Settled to Bank</p>
          </div>

          <div className="rounded-xl border border-border/80 bg-white p-4 shadow-2xs">
            <p className="text-xs font-medium uppercase tracking-wider text-gold-600">Pending / Issued</p>
            <p className="mt-1 text-lg sm:text-2xl font-serif font-bold text-gold-700">
              {stats.pendingCount}
            </p>
            <p className="mt-1 text-[11px] text-charcoal-400">Awaiting Settlement</p>
          </div>
        </div>

        {/* GST Registered Header Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold-300/60 bg-gold-400/5 px-4 py-3 text-xs text-charcoal-700">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-charcoal-900">GSTIN: {UNIFIED_VENTURES_GST.gstin}</span>
            <span className="hidden sm:inline text-charcoal-300">|</span>
            <span>State: {UNIFIED_VENTURES_GST.state} ({UNIFIED_VENTURES_GST.stateCode})</span>
            <span className="hidden sm:inline text-charcoal-300">|</span>
            <span>Default SAC: {UNIFIED_VENTURES_GST.defaultSac}</span>
          </div>
          <span className="font-mono text-[11px] text-gold-800">
            Registered: 1&2, Site 1, Khata 164P, Kommasandra, Sarjapura, Bengaluru, Bengaluru Urban, Karnataka - 562125, India
          </span>
        </div>

        {/* Main Work Area: 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Column: Invoice List & Search (4 cols on xl, full width on mobile/tablet) */}
          <div className="xl:col-span-4 space-y-4">
            <div className="rounded-xl border border-border bg-white p-4 shadow-2xs space-y-3">
              <div className="relative">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                <input
                  type="text"
                  placeholder="Search invoice #, client, GSTIN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-border/80 bg-ivory-50/50 pl-9 pr-3 py-2 text-body-sm text-charcoal-900 placeholder-charcoal-400 focus:border-gold-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gold-400 transition"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex rounded-lg bg-charcoal-100/60 p-1 text-body-xs font-medium text-charcoal-600">
                {(['all', 'issued', 'paid', 'draft', 'cancelled'] as FilterStatus[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'flex-1 rounded-md py-1.5 capitalize transition-all cursor-pointer',
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

            {/* Invoices List */}
            <div className="space-y-2.5 max-h-[70vh] overflow-y-auto overscroll-contain pr-1">
              {loading && (!invoices || invoices.length === 0) ? (
                <div className="rounded-xl border border-dashed border-border bg-white/50 p-8 text-center text-charcoal-400 text-body-sm">
                  Loading invoices...
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-white/50 p-8 text-center text-charcoal-400 text-body-sm">
                  No invoices found.
                </div>
              ) : (
                filteredInvoices.map((inv) => {
                  const isSelected = selectedInvoice?.id === inv.id && !isEditing
                  return (
                    <div
                      key={inv.id}
                      onClick={() => {
                        setSelectedInvoiceId(inv.id)
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
                            <span className="font-mono text-xs font-bold text-charcoal-900">
                              {inv.invoiceNumber}
                            </span>
                            <span
                              className={cn(
                                'rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                                inv.status === 'paid' && 'bg-emerald-100 text-emerald-800',
                                inv.status === 'issued' && 'bg-gold-100 text-gold-800',
                                inv.status === 'draft' && 'bg-charcoal-100 text-charcoal-700',
                                inv.status === 'cancelled' && 'bg-rose-100 text-rose-800',
                              )}
                            >
                              {inv.status}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-body-sm font-semibold text-charcoal-900">
                            {inv.clientName}
                          </p>
                          {inv.projectName && (
                            <p className="truncate text-caption text-charcoal-500">
                              {inv.projectName}
                            </p>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-serif font-bold text-sm text-charcoal-900">
                            {formatINR(inv.grandTotal)}
                          </p>
                          <p className="text-[10px] text-charcoal-400">
                            GST: {formatINR(inv.totalCgst + inv.totalSgst + inv.totalIgst)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-caption text-charcoal-400">
                        <span className="flex items-center gap-1">
                          <HiOutlineClock className="h-3.5 w-3.5" />
                          {inv.invoiceDate}
                        </span>
                        <span className="font-mono text-[11px] text-charcoal-500">
                          {inv.isInterState ? 'IGST (Inter)' : 'CGST+SGST (Intra)'}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Right Column: Invoice Detail / Form / Live Tax Invoice Preview (8 cols on xl) */}
          <div className="xl:col-span-8 min-w-0">
            <div className="rounded-2xl border border-border bg-white shadow-xs overflow-hidden">
              {/* Document Header Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-ivory-50/70 px-4 sm:px-6 py-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-body-xs font-medium uppercase tracking-wider text-charcoal-500">
                    {isEditing
                      ? selectedInvoiceId
                        ? 'Editing GST Invoice'
                        : 'New GST Invoice'
                      : 'GST Tax Invoice Document'}
                  </span>
                  {activeInvoice?.status && (
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                        activeInvoice.status === 'paid' && 'bg-emerald-100 text-emerald-800',
                        activeInvoice.status === 'issued' && 'bg-gold-100 text-gold-800',
                        activeInvoice.status === 'draft' && 'bg-charcoal-100 text-charcoal-700',
                        activeInvoice.status === 'cancelled' && 'bg-rose-100 text-rose-800',
                      )}
                    >
                      {activeInvoice.status}
                    </span>
                  )}
                </div>

                {/* Actions Toolbar */}
                <div className="flex flex-wrap items-center gap-2">
                  {!isEditing && selectedInvoice && (
                    <>
                      <button
                        onClick={() => handleStartEdit(selectedInvoice)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-caption font-medium text-charcoal-700 hover:bg-ivory-100 hover:text-charcoal-900 transition cursor-pointer"
                        title="Edit Invoice"
                      >
                        <HiOutlinePencilAlt className="h-4 w-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      <button
                        onClick={() => handleDownloadExcel(selectedInvoice)}
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
                        onClick={() => handleDownloadWord(selectedInvoice)}
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
                        onClick={() => handleCopySummary(selectedInvoice)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-caption font-medium text-charcoal-700 hover:bg-ivory-100 hover:text-charcoal-900 transition cursor-pointer"
                        title="Copy Summary"
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
                        onClick={() => setDeleteTargetId(selectedInvoice.id)}
                        className="inline-flex items-center p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Invoice"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  {isEditing && (
                    <div className="flex items-center gap-2">
                      <div className="flex rounded-md bg-charcoal-100 p-0.5 text-xs font-medium text-charcoal-600">
                        <button
                          type="button"
                          onClick={() => setEditTab('form')}
                          className={cn(
                            'rounded px-3 py-1 transition cursor-pointer',
                            editTab === 'form' ? 'bg-white font-semibold text-charcoal-900 shadow-2xs' : '',
                          )}
                        >
                          Invoice Form
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditTab('preview')}
                          className={cn(
                            'rounded px-3 py-1 transition cursor-pointer',
                            editTab === 'preview' ? 'bg-white font-semibold text-charcoal-900 shadow-2xs' : '',
                          )}
                        >
                          Live Tax Invoice
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="rounded-lg border border-border bg-white px-3 py-1 text-caption font-medium text-charcoal-700 hover:bg-ivory-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Body Content */}
              {isEditing ? (
                <div className="p-4 sm:p-6">
                  {editTab === 'form' ? (
                    /* Invoice Editor Form */
                    <form onSubmit={handleSave} className="space-y-6">
                      {/* 1. Header Information */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-caption font-medium text-charcoal-700 mb-1">
                            Invoice Number *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.invoiceNumber}
                            onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                            placeholder="e.g. UV/2026-27/001"
                            className="w-full rounded-lg border border-border px-3 py-2 text-body-sm font-mono text-charcoal-900 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-caption font-medium text-charcoal-700 mb-1">
                            Invoice Date *
                          </label>
                          <input
                            type="date"
                            required
                            value={formData.invoiceDate}
                            onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                            className="w-full rounded-lg border border-border px-3 py-2 text-body-sm text-charcoal-900 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-caption font-medium text-charcoal-700 mb-1">
                            Payment Due Date
                          </label>
                          <input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            className="w-full rounded-lg border border-border px-3 py-2 text-body-sm text-charcoal-900 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none"
                          />
                        </div>
                      </div>

                      {/* 2. Status & Project */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-caption font-medium text-charcoal-700 mb-1">
                            Invoice Status
                          </label>
                          <select
                            value={formData.status}
                            onChange={(e) =>
                              setFormData({ ...formData, status: e.target.value as InvoiceStatus })
                            }
                            className="w-full rounded-lg border border-border px-3 py-2 text-body-sm text-charcoal-900 focus:border-gold-400 outline-none"
                          >
                            <option value="issued">Issued / Unpaid</option>
                            <option value="paid">Paid</option>
                            <option value="draft">Draft</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-caption font-medium text-charcoal-700 mb-1">
                            Project Reference
                          </label>
                          <div className="relative">
                            <HiOutlineFolder className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                            <input
                              type="text"
                              value={formData.projectName}
                              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                              placeholder="e.g. Prestige Park Square"
                              className="w-full rounded-lg border border-border pl-9 pr-3 py-2 text-body-sm text-charcoal-900 focus:border-gold-400 outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-caption font-medium text-charcoal-700 mb-1">
                            Client PO / Ref Number
                          </label>
                          <input
                            type="text"
                            value={formData.poNumber}
                            onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                            placeholder="e.g. PO-2026-004"
                            className="w-full rounded-lg border border-border px-3 py-2 text-body-sm text-charcoal-900 focus:border-gold-400 outline-none"
                          />
                        </div>
                      </div>

                      {/* 3. Customer Billing Details */}
                      <div className="rounded-xl border border-border/80 bg-ivory-50/50 p-4 sm:p-5 space-y-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-charcoal-700">
                          Customer / Billed To Details
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-caption font-medium text-charcoal-600 mb-1">
                              Client / Customer Name *
                            </label>
                            <div className="relative">
                              <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                              <input
                                type="text"
                                required
                                value={formData.clientName}
                                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                placeholder="e.g. Siddharth Rao"
                                className="w-full rounded-lg border border-border pl-9 pr-3 py-2 text-body-sm text-charcoal-900 focus:border-gold-400 outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-caption font-medium text-charcoal-600 mb-1">
                              Company / Entity Name (Optional)
                            </label>
                            <input
                              type="text"
                              value={formData.clientCompany}
                              onChange={(e) => setFormData({ ...formData, clientCompany: e.target.value })}
                              placeholder="e.g. Rao Heritage Trust"
                              className="w-full rounded-lg border border-border px-3 py-2 text-body-sm text-charcoal-900 focus:border-gold-400 outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-caption font-medium text-charcoal-600 mb-1">
                              Client GSTIN (Optional)
                            </label>
                            <input
                              type="text"
                              value={formData.clientGstin}
                              onChange={(e) => setFormData({ ...formData, clientGstin: e.target.value.toUpperCase() })}
                              placeholder="e.g. 29ABCDE1234F1Z5"
                              className="w-full rounded-lg border border-border px-3 py-2 text-body-sm font-mono text-charcoal-900 uppercase focus:border-gold-400 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-caption font-medium text-charcoal-600 mb-1">
                              Client State & Code *
                            </label>
                            <select
                              value={formData.clientStateCode}
                              onChange={(e) => handleClientStateChange(e.target.value)}
                              className="w-full rounded-lg border border-border px-3 py-2 text-body-sm text-charcoal-900 focus:border-gold-400 outline-none"
                            >
                              {INDIAN_STATES.map((st) => (
                                <option key={st.code} value={st.code}>
                                  {st.name} ({st.code})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-caption font-medium text-charcoal-600 mb-1">
                              Tax Treatment
                            </label>
                            <div className="rounded-lg border border-border/80 bg-white px-3 py-2 text-body-xs font-mono text-charcoal-700">
                              {formData.isInterState ? 'IGST Applicable (Inter-State)' : 'CGST + SGST (Intra-State)'}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-caption font-medium text-charcoal-600 mb-1">
                              Client Phone
                            </label>
                            <input
                              type="text"
                              value={formData.clientPhone}
                              onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                              placeholder="+91 98450 12345"
                              className="w-full rounded-lg border border-border px-3 py-2 text-body-sm text-charcoal-900 focus:border-gold-400 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-caption font-medium text-charcoal-600 mb-1">
                              Client Email
                            </label>
                            <input
                              type="email"
                              value={formData.clientEmail}
                              onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                              placeholder="client@example.com"
                              className="w-full rounded-lg border border-border px-3 py-2 text-body-sm text-charcoal-900 focus:border-gold-400 outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-caption font-medium text-charcoal-600 mb-1">
                            Client Full Address & Site Location *
                          </label>
                          <textarea
                            rows={2}
                            value={formData.clientAddress}
                            onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                            placeholder="e.g. Apt 1402, Prestige Park Square, Gottigere, Bengaluru 560083"
                            className="w-full rounded-lg border border-border px-3 py-2 text-body-sm text-charcoal-900 focus:border-gold-400 outline-none"
                          />
                        </div>
                      </div>

                      {/* 4. Line Items Table */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-caption font-bold uppercase tracking-wider text-charcoal-700">
                            Invoice Line Items ({formData.items.length})
                          </label>
                          <button
                            type="button"
                            onClick={handleAddItem}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:text-gold-900 cursor-pointer"
                          >
                            <HiOutlinePlus className="h-3.5 w-3.5" />
                            Add Item Line
                          </button>
                        </div>

                        <div className="space-y-3">
                          {formData.items.map((item, index) => (
                            <div
                              key={item.id}
                              className="rounded-xl border border-border/80 bg-white p-4 shadow-2xs space-y-3"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-mono text-xs font-semibold text-charcoal-400">
                                  Line Item #{index + 1}
                                </span>
                                {formData.items.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    className="text-rose-500 hover:text-rose-700 p-1 text-xs cursor-pointer"
                                    title="Remove item"
                                  >
                                    <HiOutlineTrash className="h-4 w-4" />
                                  </button>
                                )}
                              </div>

                              <div>
                                <label className="block text-caption font-medium text-charcoal-600 mb-1">
                                  Item Description & Scope of Work *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={item.description}
                                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                  placeholder="e.g. Interior Design Services / Living Room Joinery Works"
                                  className="w-full rounded-lg border border-border px-3 py-2 text-body-sm text-charcoal-900 focus:border-gold-400 outline-none"
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
                                <div>
                                  <label className="block text-[11px] font-medium text-charcoal-600 mb-1">
                                    SAC / HSN
                                  </label>
                                  <input
                                    type="text"
                                    value={item.sacHsn}
                                    onChange={(e) => handleItemChange(index, 'sacHsn', e.target.value)}
                                    className="w-full rounded-lg border border-border px-2.5 py-1.5 text-xs font-mono text-charcoal-900 outline-none"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[11px] font-medium text-charcoal-600 mb-1">
                                    Quantity & Unit
                                  </label>
                                  <div className="flex gap-1.5">
                                    <input
                                      type="number"
                                      min="0.1"
                                      step="any"
                                      value={item.quantity}
                                      onChange={(e) =>
                                        handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)
                                      }
                                      className="w-full rounded-lg border border-border px-2 py-1.5 text-xs text-charcoal-900 outline-none"
                                    />
                                    <input
                                      type="text"
                                      value={item.unit}
                                      onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                      className="w-16 shrink-0 rounded-lg border border-border px-2 py-1.5 text-xs text-charcoal-900 outline-none uppercase"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[11px] font-medium text-charcoal-600 mb-1">
                                    Rate (₹)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={item.rate}
                                    onChange={(e) =>
                                      handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)
                                    }
                                    className="w-full rounded-lg border border-border px-2.5 py-1.5 text-xs text-charcoal-900 outline-none"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[11px] font-medium text-charcoal-600 mb-1">
                                    GST %
                                  </label>
                                  <select
                                    value={item.gstRate}
                                    onChange={(e) =>
                                      handleItemChange(index, 'gstRate', parseFloat(e.target.value) || 0)
                                    }
                                    className="w-full rounded-lg border border-border px-2 py-1.5 text-xs text-charcoal-900 outline-none"
                                  >
                                    <option value="18">18% (Services)</option>
                                    <option value="12">12%</option>
                                    <option value="5">5%</option>
                                    <option value="28">28%</option>
                                    <option value="0">0% (Nil)</option>
                                  </select>
                                </div>

                                <div className="text-left sm:text-right">
                                  <label className="block text-[11px] font-medium text-charcoal-600 mb-1">
                                    Total Amount
                                  </label>
                                  <p className="py-1.5 text-xs font-bold text-charcoal-900 truncate">
                                    {formatINR(item.totalAmount)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 5. Summary & Totals */}
                      <div className="rounded-xl border border-border bg-ivory-50/70 p-4 sm:p-5 space-y-2 text-xs">
                        <div className="flex justify-between text-charcoal-600">
                          <span>Taxable Subtotal:</span>
                          <span className="font-mono font-semibold text-charcoal-900">
                            {formatINR(formData.taxableSubtotal)}
                          </span>
                        </div>

                        {formData.isInterState ? (
                          <div className="flex justify-between text-charcoal-600">
                            <span>Integrated GST (IGST 18%):</span>
                            <span className="font-mono font-semibold text-charcoal-900">
                              {formatINR(formData.totalIgst)}
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between text-charcoal-600">
                              <span>Central GST (CGST 9%):</span>
                              <span className="font-mono font-semibold text-charcoal-900">
                                {formatINR(formData.totalCgst)}
                              </span>
                            </div>
                            <div className="flex justify-between text-charcoal-600">
                              <span>State GST (SGST 9%):</span>
                              <span className="font-mono font-semibold text-charcoal-900">
                                {formatINR(formData.totalSgst)}
                              </span>
                            </div>
                          </>
                        )}

                        <div className="flex justify-between border-t border-border/80 pt-2 text-sm font-bold text-charcoal-900">
                          <span>Grand Total (INR):</span>
                          <span className="font-mono text-base text-gold-800">
                            {formatINR(formData.grandTotal)}
                          </span>
                        </div>

                        <p className="text-[11px] text-charcoal-500 italic pt-1">
                          {formData.amountInWords}
                        </p>
                      </div>

                      {/* 6. Terms & Notes */}
                      <div>
                        <label className="block text-caption font-medium text-charcoal-700 mb-1">
                          Invoice Terms & Conditions
                        </label>
                        <textarea
                          rows={3}
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="w-full rounded-lg border border-border px-3 py-2 text-body-sm text-charcoal-900 focus:border-gold-400 outline-none"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditTab('preview')}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gold-300 bg-gold-400/10 px-4 py-2 text-body-sm font-medium text-gold-800 hover:bg-gold-400/20 cursor-pointer"
                        >
                          <span>Review Live Tax Invoice</span>
                          <span>→</span>
                        </button>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="rounded-lg border border-border px-4 py-2 text-body-sm font-medium text-charcoal-600 hover:bg-ivory-100 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="rounded-lg bg-charcoal-900 px-5 py-2 text-body-sm font-medium text-white hover:bg-charcoal-800 shadow-sm cursor-pointer"
                          >
                            Save GST Invoice
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    /* Live Tax Invoice Preview in Edit Mode */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <span className="text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
                          Live Tax Document Preview
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditTab('form')}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-700 hover:text-gold-900 cursor-pointer"
                        >
                          <span>← Back to Form</span>
                        </button>
                      </div>
                      <div className="w-full overflow-x-auto rounded-xl border border-border/70 bg-ivory-50/40 p-2 sm:p-4">
                        <GstTaxInvoiceDocument invoice={formData as unknown as AdminInvoice} />
                      </div>
                    </div>
                  )}
                </div>
              ) : selectedInvoice ? (
                /* Read-Only Invoice Document View */
                <div className="p-4 sm:p-8 overflow-x-auto bg-ivory-50/30">
                  <GstTaxInvoiceDocument invoice={selectedInvoice} />
                </div>
              ) : (
                <div className="p-16 text-center text-charcoal-400">
                  <HiOutlineDocumentReport className="mx-auto h-12 w-12 text-charcoal-300 stroke-1" />
                  <p className="mt-3 text-body-md font-medium text-charcoal-700">No Invoice Selected</p>
                  <p className="mt-1 text-body-sm text-charcoal-400">
                    Select an invoice from the list or generate a new GST-compliant invoice.
                  </p>
                  <button
                    onClick={handleStartNew}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-charcoal-900 px-4 py-2 text-body-sm font-medium text-white hover:bg-charcoal-800 cursor-pointer"
                  >
                    <HiOutlinePlus className="h-4 w-4 text-gold-400" />
                    <span>Create GST Invoice</span>
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
        title="Delete GST Invoice?"
        message="Are you sure you want to delete this invoice? This will remove the tax record permanently."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  )
}

/**
 * High-quality A4 Tax Invoice Document Component
 * Compliant with Indian GST rules & branded to Unified Ventures luxury interior design aesthetic.
 * Fixed with strict width allocation, text wrapping, and zero column overflow.
 */
function GstTaxInvoiceDocument({ invoice }: { invoice: Partial<AdminInvoice> }) {
  const isInterState = Boolean(invoice.isInterState)

  return (
    <div className="mx-auto w-full max-w-[850px] min-w-[320px] bg-white text-charcoal-900 border border-border/90 rounded-xl shadow-xs p-5 sm:p-8 md:p-10 font-sans print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none">
      {/* 1. Official Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 pb-6 border-b-2 border-gold-400">
        <div className="min-w-0">
          <div>
            <img
              src="/logo.png"
              alt="Unified Ventures"
              className="h-10 sm:h-12 w-auto object-contain shrink-0 mb-2"
            />
          </div>

          <div className="mt-2 text-xs text-charcoal-600 leading-relaxed font-sans space-y-0.5">
            <p className="font-semibold text-charcoal-900">{UNIFIED_VENTURES_GST.address.building}</p>
            <p>{UNIFIED_VENTURES_GST.address.street}</p>
            <p>
              {UNIFIED_VENTURES_GST.address.city}, {UNIFIED_VENTURES_GST.address.district}, {UNIFIED_VENTURES_GST.address.state} - {UNIFIED_VENTURES_GST.address.pincode}, {UNIFIED_VENTURES_GST.address.country}
            </p>
            <p className="mt-1 font-mono text-[11px] text-charcoal-700">
              GSTIN: <span className="font-bold text-charcoal-900">{UNIFIED_VENTURES_GST.gstin}</span> | State: {UNIFIED_VENTURES_GST.state} (Code: {UNIFIED_VENTURES_GST.stateCode})
            </p>
            <p className="font-mono text-[11px] text-charcoal-600">
              PAN: {UNIFIED_VENTURES_GST.pan} | CIN: {UNIFIED_VENTURES_GST.cin}
            </p>
          </div>
        </div>

        {/* Invoice Title & Status */}
        <div className="text-left sm:text-right shrink-0">
          <div>
            <span className="inline-block px-3 py-1 bg-charcoal-900 text-ivory-100 font-serif font-bold text-sm tracking-wider uppercase rounded">
              TAX INVOICE
            </span>
            <p className="mt-1 text-[10px] text-charcoal-400 uppercase font-mono">
              (Original for Recipient)
            </p>
          </div>

          <div className="mt-3 text-xs font-mono text-charcoal-700 leading-tight space-y-1">
            <p>
              Invoice No: <span className="font-bold text-charcoal-900 text-sm">{invoice.invoiceNumber || 'UV/2026-27/---'}</span>
            </p>
            <p>
              Date: <span className="font-medium text-charcoal-900">{invoice.invoiceDate || '---'}</span>
            </p>
            {invoice.dueDate && (
              <p className="text-charcoal-500">
                Due Date: <span className="text-charcoal-800">{invoice.dueDate}</span>
              </p>
            )}
            {invoice.poNumber && (
              <p className="text-charcoal-500">
                PO / Ref: <span className="text-charcoal-800">{invoice.poNumber}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Bill To & Place of Supply */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5 rounded-lg border border-border/70 bg-ivory-50/60 p-4 text-xs print:bg-gray-50 print:border-gray-200">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">
            Details of Receiver (Billed To)
          </p>
          <p className="mt-1 font-serif text-sm font-bold text-charcoal-900 break-words">
            {invoice.clientName || 'Private Client'}
          </p>
          {invoice.clientCompany && (
            <p className="font-medium text-charcoal-700 break-words">{invoice.clientCompany}</p>
          )}
          <p className="mt-1 text-charcoal-600 leading-relaxed whitespace-pre-line break-words">
            {invoice.clientAddress || 'Address on record'}
          </p>
          <div className="mt-2 space-y-0.5 font-mono text-[11px] text-charcoal-700">
            {invoice.clientGstin ? (
              <p>
                GSTIN / UIN: <span className="font-bold text-charcoal-900">{invoice.clientGstin}</span>
              </p>
            ) : (
              <p className="text-charcoal-400 italic">GSTIN: Unregistered Consumer</p>
            )}
            <p>
              State: {invoice.clientState || 'Karnataka'} (Code: {invoice.clientStateCode || '29'})
            </p>
            {invoice.clientPhone && <p>Tel: {invoice.clientPhone}</p>}
          </div>
        </div>

        <div className="sm:border-l sm:border-border/60 sm:pl-4 space-y-2 min-w-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">
              Place of Supply
            </p>
            <p className="mt-0.5 font-semibold text-charcoal-900">
              {invoice.placeOfSupply || 'Karnataka (29)'}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">
              Project Specification
            </p>
            <p className="mt-0.5 font-medium text-charcoal-800 break-words">
              {invoice.projectName || 'Interior Architecture & Bespoke Space Planning'}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">
              Tax Applicability
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-charcoal-700">
              {isInterState ? 'Inter-State Supply (IGST @ 18%)' : 'Intra-State Supply (CGST 9% + SGST 9%)'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Items & SAC Table */}
      <div className="my-6 overflow-x-auto rounded-lg border border-charcoal-200">
        <table className="w-full min-w-[620px] text-left text-xs border-collapse">
          <thead className="bg-charcoal-900 text-ivory-100 font-mono text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3 border-r border-charcoal-700 w-10 text-center">#</th>
              <th className="py-2.5 px-3 border-r border-charcoal-700 min-w-[200px]">Description of Service</th>
              <th className="py-2.5 px-3 border-r border-charcoal-700 text-center w-20">SAC</th>
              <th className="py-2.5 px-3 border-r border-charcoal-700 text-center w-16">Qty</th>
              <th className="py-2.5 px-3 border-r border-charcoal-700 text-right w-24">Rate (₹)</th>
              <th className="py-2.5 px-3 border-r border-charcoal-700 text-right w-24">Taxable (₹)</th>
              {isInterState ? (
                <th className="py-2.5 px-3 border-r border-charcoal-700 text-right w-24">IGST (₹)</th>
              ) : (
                <>
                  <th className="py-2.5 px-3 border-r border-charcoal-700 text-right w-20">CGST (₹)</th>
                  <th className="py-2.5 px-3 border-r border-charcoal-700 text-right w-20">SGST (₹)</th>
                </>
              )}
              <th className="py-2.5 px-3 text-right w-28">Total (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-100 font-sans">
            {(invoice.items || []).map((item, idx) => (
              <tr key={item.id || idx} className="hover:bg-ivory-50/50">
                <td className="py-2.5 px-3 border-r border-charcoal-100 text-center font-mono text-charcoal-500">
                  {idx + 1}
                </td>
                <td className="py-2.5 px-3 border-r border-charcoal-100 break-words">
                  <p className="font-semibold text-charcoal-900">{item.description}</p>
                </td>
                <td className="py-2.5 px-3 border-r border-charcoal-100 text-center font-mono text-charcoal-600">
                  {item.sacHsn}
                </td>
                <td className="py-2.5 px-3 border-r border-charcoal-100 text-center font-mono whitespace-nowrap">
                  {item.quantity} {item.unit}
                </td>
                <td className="py-2.5 px-3 border-r border-charcoal-100 text-right font-mono whitespace-nowrap">
                  {formatINR(item.rate)}
                </td>
                <td className="py-2.5 px-3 border-r border-charcoal-100 text-right font-mono font-medium text-charcoal-900 whitespace-nowrap">
                  {formatINR(item.taxableAmount)}
                </td>
                {isInterState ? (
                  <td className="py-2.5 px-3 border-r border-charcoal-100 text-right font-mono text-charcoal-600 whitespace-nowrap">
                    {formatINR(item.igstAmount)} ({item.gstRate}%)
                  </td>
                ) : (
                  <>
                    <td className="py-2.5 px-3 border-r border-charcoal-100 text-right font-mono text-charcoal-600 whitespace-nowrap">
                      {formatINR(item.cgstAmount)} ({(item.gstRate / 2).toFixed(1)}%)
                    </td>
                    <td className="py-2.5 px-3 border-r border-charcoal-100 text-right font-mono text-charcoal-600 whitespace-nowrap">
                      {formatINR(item.sgstAmount)} ({(item.gstRate / 2).toFixed(1)}%)
                    </td>
                  </>
                )}
                <td className="py-2.5 px-3 text-right font-mono font-bold text-charcoal-900 whitespace-nowrap">
                  {formatINR(item.totalAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Calculation Summary Table */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6 items-start">
        {/* Left: Bank Details & Amount in Words */}
        <div className="md:col-span-7 space-y-4 min-w-0">
          <div className="rounded-lg border border-border/80 bg-ivory-50/70 p-3.5 text-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500 mb-1">
              Invoice Amount in Words
            </p>
            <p className="font-serif font-semibold text-charcoal-900 text-sm leading-relaxed break-words">
              {invoice.amountInWords || numberToIndianWords(invoice.grandTotal || 0)}
            </p>
          </div>

          <div className="rounded-lg border border-border/80 bg-white p-3.5 text-xs space-y-1.5 font-mono">
            <p className="font-sans font-bold text-charcoal-900 uppercase text-[11px] tracking-wider mb-2 text-gold-700">
              Electronic Fund Transfer (NEFT / RTGS / IMPS)
            </p>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <span className="text-charcoal-500">Bank Name:</span>
              <span className="col-span-2 font-semibold text-charcoal-900 break-words">{invoice.bankDetails?.bankName || UNIFIED_VENTURES_GST.bank.bankName}</span>

              <span className="text-charcoal-500">A/C Name:</span>
              <span className="col-span-2 font-semibold text-charcoal-900 break-words">{invoice.bankDetails?.accountName || UNIFIED_VENTURES_GST.bank.accountName}</span>

              <span className="text-charcoal-500">A/C Number:</span>
              <span className="col-span-2 font-bold text-charcoal-900">{invoice.bankDetails?.accountNumber || UNIFIED_VENTURES_GST.bank.accountNumber}</span>

              <span className="text-charcoal-500">IFSC Code:</span>
              <span className="col-span-2 font-bold text-charcoal-900">{invoice.bankDetails?.ifscCode || UNIFIED_VENTURES_GST.bank.ifscCode}</span>

              <span className="text-charcoal-500">Branch:</span>
              <span className="col-span-2 text-charcoal-700 break-words">{invoice.bankDetails?.branch || UNIFIED_VENTURES_GST.bank.branch}</span>

              <span className="text-charcoal-500">UPI ID:</span>
              <span className="col-span-2 font-semibold text-gold-700 break-words">{invoice.bankDetails?.upiId || UNIFIED_VENTURES_GST.bank.upiId}</span>
            </div>
          </div>
        </div>

        {/* Right: Tax Breakdown Totals */}
        <div className="md:col-span-5 rounded-lg border border-charcoal-200 bg-white overflow-hidden text-xs">
          <div className="divide-y divide-charcoal-100">
            <div className="flex justify-between py-2 px-3 text-charcoal-600">
              <span>Taxable Value:</span>
              <span className="font-mono font-semibold text-charcoal-900">{formatINR(invoice.taxableSubtotal || 0)}</span>
            </div>

            {isInterState ? (
              <div className="flex justify-between py-2 px-3 text-charcoal-600">
                <span>Integrated GST (IGST):</span>
                <span className="font-mono font-semibold text-charcoal-900">{formatINR(invoice.totalIgst || 0)}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between py-2 px-3 text-charcoal-600">
                  <span>Central GST (CGST 9%):</span>
                  <span className="font-mono font-semibold text-charcoal-900">{formatINR(invoice.totalCgst || 0)}</span>
                </div>
                <div className="flex justify-between py-2 px-3 text-charcoal-600">
                  <span>State GST (SGST 9%):</span>
                  <span className="font-mono font-semibold text-charcoal-900">{formatINR(invoice.totalSgst || 0)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between py-2 px-3 text-charcoal-600 font-mono">
              <span>Total Tax:</span>
              <span className="font-semibold text-charcoal-900">
                {formatINR((invoice.totalCgst || 0) + (invoice.totalSgst || 0) + (invoice.totalIgst || 0))}
              </span>
            </div>

            {Boolean(invoice.roundOff) && (
              <div className="flex justify-between py-1.5 px-3 text-charcoal-400 font-mono text-[11px]">
                <span>Round-off:</span>
                <span>{formatINR(invoice.roundOff || 0)}</span>
              </div>
            )}

            <div className="flex justify-between py-3 px-3 bg-charcoal-900 text-ivory-100 font-bold text-sm">
              <span className="uppercase tracking-wider">Grand Total (INR):</span>
              <span className="font-mono text-base text-gold-400">{formatINR(invoice.grandTotal || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Terms, Conditions & Signatory */}
      <div className="mt-8 pt-6 border-t border-border/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
          <div className="text-xs text-charcoal-600 leading-relaxed min-w-0">
            <p className="font-bold uppercase tracking-wider text-charcoal-900 text-[10px] mb-1">
              Terms & Conditions:
            </p>
            <p className="whitespace-pre-line text-[11px] break-words">
              {invoice.notes ||
                '1. Payment must be transferred via electronic NEFT/RTGS to the specified account within due date.\n2. Invoices unpaid past the due date will attract interest at 18% p.a.\n3. Goods & fit-outs supplied remain property of Unified Ventures until paid in full.'}
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <p className="text-[11px] font-serif font-bold text-charcoal-900 uppercase">
              For UNIFIED VENTURES
            </p>
            <div className="h-14 border-b border-charcoal-400 w-48 ml-auto my-1" />
            <p className="text-[11px] font-medium text-charcoal-900 uppercase tracking-wider">
              Authorized Signatory
            </p>
            <p className="text-[10px] text-charcoal-500 font-mono">Design & Accounts Directorate</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-[10px] font-mono tracking-wider text-charcoal-400 border-t border-border/40 pt-2">
          This is a computer generated GST Tax Invoice issued by Unified Ventures, Bengaluru, Karnataka, India.
        </div>
      </div>
    </div>
  )
}
