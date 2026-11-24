import type { AdminNote } from '@/admin/types'
import { UNIFIED_VENTURES_GST } from '@/config/gst'
import { LOGO_PNG_BASE64 } from './logoBase64'
import ExcelJS from 'exceljs'

const GOLD = 'B08D57'
const DARK_INK = '1A202C'
const MUTED = '718096'
const IVORY_BG = 'FAF7F2'
const HEADER_FILL = '2B6CB0'
const BORDER_COLOR = 'CBD5E0'

export async function generateNotepadExcel(note: AdminNote): Promise<Blob> {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Unified Ventures'
  wb.created = new Date()

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF' + BORDER_COLOR } },
    bottom: { style: 'thin', color: { argb: 'FF' + BORDER_COLOR } },
    left: { style: 'thin', color: { argb: 'FF' + BORDER_COLOR } },
    right: { style: 'thin', color: { argb: 'FF' + BORDER_COLOR } },
  }

  // ===================== Sheet 1: Site Visit & Notes =====================
  const wsVisit = wb.addWorksheet('Site Visit & Overview', {
    pageSetup: {
      paperSize: 9,
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
    },
    views: [{ showGridLines: true }],
  })
  wsVisit.columns = [{ width: 22 }, { width: 26 }, { width: 22 }, { width: 26 }]

  // Header with logo
  const logoImageId = wb.addImage({
    base64: LOGO_PNG_BASE64,
    extension: 'png',
  })
  wsVisit.addImage(logoImageId, {
    tl: { col: 0.1, row: 0.1 },
    ext: { width: 230, height: 41 },
  })
  wsVisit.getRow(1).height = 24
  wsVisit.getRow(2).height = 18

  wsVisit.mergeCells('C1:D1')
  const title1 = wsVisit.getCell('C1')
  title1.value = 'INTERIOR WORK NOTEPAD'
  title1.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FF' + GOLD } }
  title1.alignment = { horizontal: 'right' }

  wsVisit.mergeCells('C2:D2')
  wsVisit.getCell('C2').value = `Ref: UV-NOTE-${note.id?.slice(0, 8).toUpperCase() || 'RECORD'}`
  wsVisit.getCell('C2').font = { name: 'Calibri', size: 9, color: { argb: 'FF' + MUTED } }
  wsVisit.getCell('C2').alignment = { horizontal: 'right' }

  wsVisit.mergeCells('A3:D4')
  const noteAddr = wsVisit.getCell('A3')
  noteAddr.value = `${UNIFIED_VENTURES_GST.address.full}\nPhone: ${UNIFIED_VENTURES_GST.contact.phone} | Email: ${UNIFIED_VENTURES_GST.contact.email}`
  noteAddr.font = { name: 'Calibri', size: 8.5, color: { argb: 'FF' + MUTED } }
  noteAddr.alignment = { wrapText: true, vertical: 'top' }

  // Section 1: Project & Client Details
  wsVisit.mergeCells('A6:D6')
  const sec1 = wsVisit.getCell('A6')
  sec1.value = '1. PROJECT & CLIENT RECORD'
  sec1.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
  sec1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + HEADER_FILL } }
  sec1.alignment = { vertical: 'middle', indent: 1 }
  wsVisit.getRow(6).height = 20

  const clientRows = [
    ['Document Title:', note.title || 'Architectural Site Brief', 'Date:', note.date || new Date().toISOString().slice(0, 10)],
    ['Client Name:', note.clientName || 'Private Client', 'Category:', (note.category || 'work').toUpperCase()],
    ['Project Name:', note.projectName || 'Bengaluru Residence', 'Subject / Scope:', note.subject || 'Interior Space Planning'],
  ]

  clientRows.forEach((row, idx) => {
    const r = 7 + idx
    wsVisit.getCell(`A${r}`).value = row[0]
    wsVisit.getCell(`A${r}`).font = { name: 'Calibri', size: 9, bold: true }
    wsVisit.getCell(`A${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + IVORY_BG } }
    wsVisit.getCell(`A${r}`).border = thinBorder

    wsVisit.getCell(`B${r}`).value = row[1]
    wsVisit.getCell(`B${r}`).font = { name: 'Calibri', size: 9.5 }
    wsVisit.getCell(`B${r}`).border = thinBorder

    wsVisit.getCell(`C${r}`).value = row[2]
    wsVisit.getCell(`C${r}`).font = { name: 'Calibri', size: 9, bold: true }
    wsVisit.getCell(`C${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + IVORY_BG } }
    wsVisit.getCell(`C${r}`).border = thinBorder

    wsVisit.getCell(`D${r}`).value = row[3]
    wsVisit.getCell(`D${r}`).font = { name: 'Calibri', size: 9.5 }
    wsVisit.getCell(`D${r}`).border = thinBorder
    wsVisit.getRow(r).height = 20
  })

  // Section 2: Recorded Content / Notes
  wsVisit.mergeCells('A11:D11')
  const sec2 = wsVisit.getCell('A11')
  sec2.value = '2. RECORDED ARCHITECTURAL CONTENT & DESIGN SPECIFICATIONS'
  sec2.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
  sec2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + HEADER_FILL } }
  sec2.alignment = { vertical: 'middle', indent: 1 }
  wsVisit.getRow(11).height = 20

  wsVisit.mergeCells('A12:D24')
  const contentCell = wsVisit.getCell('A12')
  contentCell.value = note.content || 'No details recorded.'
  contentCell.font = { name: 'Calibri', size: 9.5, color: { argb: 'FF' + DARK_INK } }
  contentCell.alignment = { wrapText: true, vertical: 'top' }
  contentCell.border = thinBorder

  // Section 3: Next Visit & Sign-off
  const sigStart = 26
  wsVisit.mergeCells(`A${sigStart}:B${sigStart}`)
  wsVisit.getCell(`A${sigStart}`).value = 'Client Approval / Acknowledgement'
  wsVisit.getCell(`A${sigStart}`).font = { name: 'Calibri', size: 9, bold: true }

  wsVisit.mergeCells(`C${sigStart}:D${sigStart}`)
  wsVisit.getCell(`C${sigStart}`).value = 'For UNIFIED VENTURES'
  wsVisit.getCell(`C${sigStart}`).font = { name: 'Calibri', size: 9, bold: true }
  wsVisit.getCell(`C${sigStart}`).alignment = { horizontal: 'right' }

  const sigLine = sigStart + 3
  wsVisit.mergeCells(`A${sigLine}:B${sigLine}`)
  wsVisit.getCell(`A${sigLine}`).value = 'Client Signature & Date'
  wsVisit.getCell(`A${sigLine}`).font = { name: 'Calibri', size: 8.5, color: { argb: 'FF' + MUTED } }
  wsVisit.getCell(`A${sigLine}`).border = { top: { style: 'thin', color: { argb: 'FF' + BORDER_COLOR } } }

  wsVisit.mergeCells(`C${sigLine}:D${sigLine}`)
  wsVisit.getCell(`C${sigLine}`).value = 'Designer / Site Supervisor Signature'
  wsVisit.getCell(`C${sigLine}`).font = { name: 'Calibri', size: 8.5, color: { argb: 'FF' + MUTED } }
  wsVisit.getCell(`C${sigLine}`).border = { top: { style: 'thin', color: { argb: 'FF' + BORDER_COLOR } } }
  wsVisit.getCell(`C${sigLine}`).alignment = { horizontal: 'right' }

  const buffer = await wb.xlsx.writeBuffer()
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}
