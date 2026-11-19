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

  // ===================== Sheet 2: Room Measurements =====================
  const wsMeas = wb.addWorksheet('Measurements Schedule', {
    pageSetup: {
      paperSize: 9,
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    },
    views: [{ showGridLines: true }],
  })
  wsMeas.columns = [
    { width: 5 },  // #
    { width: 22 }, // Room / Space
    { width: 12 }, // Length (ft)
    { width: 12 }, // Width (ft)
    { width: 12 }, // Height (ft)
    { width: 14 }, // Carpet Area (sqft)
    { width: 28 }, // Design Remarks & Points
  ]

  wsMeas.mergeCells('A1:G1')
  wsMeas.getCell('A1').value = `ROOM MEASUREMENTS — ${note.projectName || 'Bengaluru Project'} (${note.clientName || 'Client'})`
  wsMeas.getCell('A1').font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF' + DARK_INK } }
  wsMeas.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + IVORY_BG } }
  wsMeas.getCell('A1').alignment = { vertical: 'middle', indent: 1 }
  wsMeas.getRow(1).height = 24

  const measHeaders = ['#', 'Room / Area', 'Length (ft)', 'Width (ft)', 'Height (ft)', 'Area (sq.ft)', 'Design Remarks & Points']
  measHeaders.forEach((h, i) => {
    const col = String.fromCharCode(65 + i)
    const c = wsMeas.getCell(`${col}3`)
    c.value = h
    c.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FFFFFFFF' } }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + DARK_INK } }
    c.border = thinBorder
    c.alignment = { horizontal: 'center', vertical: 'middle' }
  })
  wsMeas.getRow(3).height = 22

  const sampleAreas = [
    ['Foyer / Entryway', 7.5, 5.0, 9.5, 'Shoe console and decorative paneling'],
    ['Living & Dining Lounge', 22.5, 13.5, 9.5, 'Perimeter false ceiling, TV wall joinery'],
    ['Modular Kitchen', 11.2, 9.0, 9.5, 'Gola profile shutters, quartz countertop'],
    ['Master Bedroom', 15.5, 12.0, 9.5, '10ft sliding wardrobe, bed back cladding'],
    ['Guest Bedroom', 13.0, 11.0, 9.5, 'Hinged 3-door wardrobe, study console'],
  ]

  sampleAreas.forEach((area, idx) => {
    const r = 4 + idx
    wsMeas.getCell(`A${r}`).value = idx + 1
    wsMeas.getCell(`A${r}`).alignment = { horizontal: 'center' }

    wsMeas.getCell(`B${r}`).value = area[0]
    wsMeas.getCell(`C${r}`).value = area[1]
    wsMeas.getCell(`D${r}`).value = area[2]
    wsMeas.getCell(`E${r}`).value = area[3]

    // Formula for sq.ft Area = Length * Width
    wsMeas.getCell(`F${r}`).value = { formula: `ROUND(C${r}*D${r},2)` }
    wsMeas.getCell(`F${r}`).numFmt = '#,##0.00'
    wsMeas.getCell(`F${r}`).alignment = { horizontal: 'center' }

    wsMeas.getCell(`G${r}`).value = area[4]

    for (let c = 0; c < 7; c++) {
      const col = String.fromCharCode(65 + c)
      wsMeas.getCell(`${col}${r}`).border = thinBorder
      wsMeas.getCell(`${col}${r}`).font = { name: 'Calibri', size: 9 }
      if (c >= 2 && c <= 4) wsMeas.getCell(`${col}${r}`).alignment = { horizontal: 'center' }
    }
    wsMeas.getRow(r).height = 20
  })

  // 10 blank measurement rows for site notes
  for (let r = 9; r <= 18; r++) {
    wsMeas.getCell(`A${r}`).value = r - 3
    wsMeas.getCell(`A${r}`).alignment = { horizontal: 'center' }
    wsMeas.getCell(`F${r}`).value = { formula: `IF(AND(C${r}<>"",D${r}<>""),ROUND(C${r}*D${r},2),"")` }
    for (let c = 0; c < 7; c++) {
      const col = String.fromCharCode(65 + c)
      wsMeas.getCell(`${col}${r}`).border = thinBorder
      wsMeas.getCell(`${col}${r}`).font = { name: 'Calibri', size: 9 }
    }
    wsMeas.getRow(r).height = 20
  }

  // ===================== Sheet 3: Materials & Specifications =====================
  const wsMat = wb.addWorksheet('Materials & Specs', {
    pageSetup: {
      paperSize: 9,
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    },
    views: [{ showGridLines: true }],
  })
  wsMat.columns = [
    { width: 5 },
    { width: 22 },
    { width: 18 },
    { width: 28 },
    { width: 10 },
    { width: 10 },
    { width: 15 },
  ]

  wsMat.mergeCells('A1:G1')
  wsMat.getCell('A1').value = `MATERIAL SPECIFICATIONS SCHEDULE — ${note.projectName || 'Bengaluru Project'}`
  wsMat.getCell('A1').font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF' + DARK_INK } }
  wsMat.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + IVORY_BG } }
  wsMat.getCell('A1').alignment = { vertical: 'middle', indent: 1 }
  wsMat.getRow(1).height = 24

  const matHeaders = ['#', 'Material Category', 'Approved Brand', 'Specification / Finish', 'Est Qty', 'Unit', 'Status']
  matHeaders.forEach((h, i) => {
    const col = String.fromCharCode(65 + i)
    const c = wsMat.getCell(`${col}3`)
    c.value = h
    c.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FFFFFFFF' } }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + DARK_INK } }
    c.border = thinBorder
    c.alignment = { horizontal: 'center', vertical: 'middle' }
  })
  wsMat.getRow(3).height = 22

  const sampleMats = [
    ['Plywood (BWP 710)', 'CenturyPly / Greenply', '16mm/18mm Marine grade calibration', '35', 'Sheets', 'Approved'],
    ['Decorative Laminates', 'Merino / Royale Touche', '1mm Zero finish anti-fingerprint', '30', 'Sheets', 'Approved'],
    ['Cabinet Hardware', 'Blum / Hafele', 'Clip-top Blumotion soft close hinges', '48', 'Pairs', 'Verified'],
    ['Ceiling Substrate', 'Saint-Gobain Gyproc', '12.5mm standard board with GI perimeter', '40', 'Boards', 'On-Site'],
    ['Countertop Quartz', 'KalingaStone', '18mm Calacatta gold bevel finish', '60', 'Sq.Ft.', 'Ordered'],
  ]

  sampleMats.forEach((mat, idx) => {
    const r = 4 + idx
    wsMat.getCell(`A${r}`).value = idx + 1
    wsMat.getCell(`A${r}`).alignment = { horizontal: 'center' }
    for (let c = 1; c <= 6; c++) {
      const col = String.fromCharCode(65 + c)
      wsMat.getCell(`${col}${r}`).value = mat[c - 1]
      wsMat.getCell(`${col}${r}`).border = thinBorder
      wsMat.getCell(`${col}${r}`).font = { name: 'Calibri', size: 9 }
      if (c >= 4) wsMat.getCell(`${col}${r}`).alignment = { horizontal: 'center' }
    }
    wsMat.getCell(`A${r}`).border = thinBorder
    wsMat.getRow(r).height = 20
  })

  // Blank material rows
  for (let r = 9; r <= 16; r++) {
    wsMat.getCell(`A${r}`).value = r - 3
    wsMat.getCell(`A${r}`).alignment = { horizontal: 'center' }
    for (let c = 0; c < 7; c++) {
      const col = String.fromCharCode(65 + c)
      wsMat.getCell(`${col}${r}`).border = thinBorder
      wsMat.getCell(`${col}${r}`).font = { name: 'Calibri', size: 9 }
    }
    wsMat.getRow(r).height = 20
  }

  // ===================== Sheet 4: Work Progress & Labour =====================
  const wsProg = wb.addWorksheet('Work Progress & Labour', {
    pageSetup: {
      paperSize: 9,
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    },
    views: [{ showGridLines: true }],
  })
  wsProg.columns = [
    { width: 5 },
    { width: 22 },
    { width: 18 },
    { width: 12 },
    { width: 12 },
    { width: 28 },
    { width: 14 },
  ]

  wsProg.mergeCells('A1:G1')
  wsProg.getCell('A1').value = `WORK PROGRESS & LABOUR DEPLOYMENT — ${note.projectName || 'Bengaluru Project'}`
  wsProg.getCell('A1').font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF' + DARK_INK } }
  wsProg.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + IVORY_BG } }
  wsProg.getCell('A1').alignment = { vertical: 'middle', indent: 1 }
  wsProg.getRow(1).height = 24

  const progHeaders = ['#', 'Trade / Activity', 'Lead Contractor', 'Manpower', 'Progress %', 'Work Notes', 'Target Date']
  progHeaders.forEach((h, i) => {
    const col = String.fromCharCode(65 + i)
    const c = wsProg.getCell(`${col}3`)
    c.value = h
    c.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FFFFFFFF' } }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + DARK_INK } }
    c.border = thinBorder
    c.alignment = { horizontal: 'center', vertical: 'middle' }
  })
  wsProg.getRow(3).height = 22

  const sampleProg = [
    ['Modular Joinery Assembly', 'M. Rafiq & Team', '4 Carpenters', '75%', 'Carcass alignment complete', '25-Nov-2026'],
    ['Electrical Conduit & Wiring', 'Manjunath Electricals', '2 Electricians', '85%', 'Points shifted as per 3D design', '22-Nov-2026'],
    ['Gypsum False Ceiling Grid', 'Deepak Ceilings', '3 Workers', '90%', 'Perimeter cove framing ready', '20-Nov-2026'],
    ['Wall Surface Prep & Primer', 'Krishna Painters', '3 Painters', '30%', 'Putty first coat applied', '05-Dec-2026'],
  ]

  sampleProg.forEach((prog, idx) => {
    const r = 4 + idx
    wsProg.getCell(`A${r}`).value = idx + 1
    wsProg.getCell(`A${r}`).alignment = { horizontal: 'center' }
    for (let c = 1; c <= 6; c++) {
      const col = String.fromCharCode(65 + c)
      wsProg.getCell(`${col}${r}`).value = prog[c - 1]
      wsProg.getCell(`${col}${r}`).border = thinBorder
      wsProg.getCell(`${col}${r}`).font = { name: 'Calibri', size: 9 }
      if (c === 3 || c === 4 || c === 6) wsProg.getCell(`${col}${r}`).alignment = { horizontal: 'center' }
    }
    wsProg.getCell(`A${r}`).border = thinBorder
    wsProg.getRow(r).height = 20
  })

  for (let r = 8; r <= 15; r++) {
    wsProg.getCell(`A${r}`).value = r - 3
    wsProg.getCell(`A${r}`).alignment = { horizontal: 'center' }
    for (let c = 0; c < 7; c++) {
      const col = String.fromCharCode(65 + c)
      wsProg.getCell(`${col}${r}`).border = thinBorder
      wsProg.getCell(`${col}${r}`).font = { name: 'Calibri', size: 9 }
    }
    wsProg.getRow(r).height = 20
  }

  const buffer = await wb.xlsx.writeBuffer()
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}
