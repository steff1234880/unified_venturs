import type { AdminInvoice } from '@/admin/types'
import { UNIFIED_VENTURES_GST } from '@/config/gst'
import { LOGO_PNG_BASE64 } from './logoBase64'
import ExcelJS from 'exceljs'

// Colors matching Unified Ventures luxury aesthetic
const GOLD = 'B08D57'
const DARK_INK = '1A202C'
const MUTED = '718096'
const IVORY_BG = 'FAF7F2'
const HEADER_FILL = '2B6CB0' // Deep slate navy
const BORDER_COLOR = 'CBD5E0'

export async function generateInvoiceExcel(invoice: AdminInvoice): Promise<Blob> {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Unified Ventures'
  wb.created = new Date()

  const ws = wb.addWorksheet('Tax Invoice', {
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
    },
    views: [{ showGridLines: true }],
  })

  // Columns: A to H
  ws.columns = [
    { width: 6 },  // A: S.No
    { width: 34 }, // B: Description
    { width: 12 }, // C: HSN/SAC
    { width: 8 },  // D: Qty
    { width: 8 },  // E: Unit
    { width: 14 }, // F: Rate
    { width: 12 }, // G: Taxable
    { width: 15 }, // H: Total Amount
  ]

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF' + BORDER_COLOR } },
    bottom: { style: 'thin', color: { argb: 'FF' + BORDER_COLOR } },
    left: { style: 'thin', color: { argb: 'FF' + BORDER_COLOR } },
    right: { style: 'thin', color: { argb: 'FF' + BORDER_COLOR } },
  }

  // Embed website company logo
  const logoImageId = wb.addImage({
    base64: LOGO_PNG_BASE64,
    extension: 'png',
  })
  ws.addImage(logoImageId, {
    tl: { col: 0.1, row: 0.1 },
    ext: { width: 230, height: 41 },
  })

  // Row 1-4: Header
  ws.getRow(1).height = 24
  ws.getRow(2).height = 18

  ws.mergeCells('F1:H1')
  const invLabel = ws.getCell('F1')
  invLabel.value = 'TAX INVOICE'
  invLabel.font = { name: 'Calibri', size: 18, bold: true, color: { argb: 'FF' + GOLD } }
  invLabel.alignment = { horizontal: 'right' }

  ws.mergeCells('F2:H2')
  ws.getCell('F2').value = 'Original for Recipient | Rule 46 CGST'
  ws.getCell('F2').font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF' + MUTED } }
  ws.getCell('F2').alignment = { horizontal: 'right' }

  ws.mergeCells('A3:E4')
  const addrCell = ws.getCell('A3')
  addrCell.value = `${UNIFIED_VENTURES_GST.address.full}\nPhone: ${UNIFIED_VENTURES_GST.contact.phone} | Email: ${UNIFIED_VENTURES_GST.contact.email}`
  addrCell.font = { name: 'Calibri', size: 8.5, color: { argb: 'FF' + MUTED } }
  addrCell.alignment = { wrapText: true, vertical: 'top' }

  ws.mergeCells('F3:H3')
  ws.getCell('F3').value = `Invoice No: ${invoice.invoiceNumber}`
  ws.getCell('F3').font = { name: 'Calibri', size: 10, bold: true }
  ws.getCell('F3').alignment = { horizontal: 'right' }

  ws.mergeCells('F4:H4')
  ws.getCell('F4').value = `Invoice Date: ${invoice.invoiceDate} | Due Date: ${invoice.dueDate || 'Upon Receipt'}`
  ws.getCell('F4').font = { name: 'Calibri', size: 9, color: { argb: 'FF' + MUTED } }
  ws.getCell('F4').alignment = { horizontal: 'right' }

  // Row 5: Divider
  ws.getRow(5).height = 8

  // Row 6: Company Reg Bar
  ws.mergeCells('A6:H6')
  const regCell = ws.getCell('A6')
  regCell.value = `GSTIN: ${UNIFIED_VENTURES_GST.gstin}    |    PAN: ${UNIFIED_VENTURES_GST.pan}    |    State: ${UNIFIED_VENTURES_GST.state} (Code: ${UNIFIED_VENTURES_GST.stateCode})    |    Place of Supply: ${invoice.placeOfSupply || 'Karnataka (29)'}`
  regCell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF' + DARK_INK } }
  regCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + IVORY_BG } }
  regCell.alignment = { horizontal: 'center', vertical: 'middle' }
  regCell.border = thinBorder
  ws.getRow(6).height = 24

  // Row 8: Section Billed To & Project Details
  ws.mergeCells('A8:D8')
  ws.getCell('A8').value = 'BILLED TO (CLIENT DETAILS)'
  ws.getCell('A8').font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FFFFFFFF' } }
  ws.getCell('A8').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + HEADER_FILL } }
  ws.getCell('A8').alignment = { vertical: 'middle', indent: 1 }

  ws.mergeCells('E8:H8')
  ws.getCell('E8').value = 'PROJECT & SITE DETAILS'
  ws.getCell('E8').font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FFFFFFFF' } }
  ws.getCell('E8').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + HEADER_FILL } }
  ws.getCell('E8').alignment = { vertical: 'middle', indent: 1 }
  ws.getRow(8).height = 20

  // Client Details Rows 9-12
  const clientInfo = [
    [`Client Name: ${invoice.clientName}`, `Project: ${invoice.projectName || 'Interior Architecture Execution'}`],
    [`Company: ${invoice.clientCompany || 'Individual / Private Residence'}`, `Site Address: ${invoice.clientAddress || 'Bengaluru, Karnataka'}`],
    [`Address: ${invoice.clientAddress || 'Bengaluru, Karnataka'}`, `Client Phone: ${invoice.clientPhone || 'Not specified'}`],
    [`Client GSTIN: ${invoice.clientGstin || 'UR (Unregistered)'}`, `Client Email: ${invoice.clientEmail || 'Not specified'}`],
  ]

  clientInfo.forEach((rowPair, idx) => {
    const r = 9 + idx
    ws.mergeCells(`A${r}:D${r}`)
    ws.getCell(`A${r}`).value = rowPair[0]
    ws.getCell(`A${r}`).font = { name: 'Calibri', size: 9 }
    ws.getCell(`A${r}`).border = thinBorder
    ws.getCell(`A${r}`).alignment = { vertical: 'middle' }

    ws.mergeCells(`E${r}:H${r}`)
    ws.getCell(`E${r}`).value = rowPair[1]
    ws.getCell(`E${r}`).font = { name: 'Calibri', size: 9 }
    ws.getCell(`E${r}`).border = thinBorder
    ws.getCell(`E${r}`).alignment = { vertical: 'middle' }
    ws.getRow(r).height = 19
  })

  // Row 14: Item Table Header
  const itemHeaderRow = 14
  const headers = ['#', 'Work / Material Description', 'HSN/SAC', 'Qty', 'Unit', 'Rate (₹)', 'Taxable (₹)', 'Total Amount (₹)']
  headers.forEach((h, i) => {
    const colLetter = String.fromCharCode(65 + i)
    const cell = ws.getCell(`${colLetter}${itemHeaderRow}`)
    cell.value = h
    cell.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + DARK_INK } }
    cell.border = thinBorder
    cell.alignment = { horizontal: i >= 3 ? 'center' : (i === 1 ? 'left' : 'center'), vertical: 'middle' }
  })
  ws.getRow(itemHeaderRow).height = 24

  // Rows 15+: Items
  let currentRow = 15
  const items = invoice.items || []
  items.forEach((item, idx) => {
    const r = currentRow
    ws.getCell(`A${r}`).value = idx + 1
    ws.getCell(`A${r}`).alignment = { horizontal: 'center', vertical: 'middle' }

    ws.getCell(`B${r}`).value = item.description
    ws.getCell(`B${r}`).alignment = { wrapText: true, vertical: 'middle' }

    ws.getCell(`C${r}`).value = item.sacHsn || '998391'
    ws.getCell(`C${r}`).alignment = { horizontal: 'center', vertical: 'middle' }

    ws.getCell(`D${r}`).value = item.quantity
    ws.getCell(`D${r}`).alignment = { horizontal: 'center', vertical: 'middle' }

    ws.getCell(`E${r}`).value = item.unit || 'LS'
    ws.getCell(`E${r}`).alignment = { horizontal: 'center', vertical: 'middle' }

    ws.getCell(`F${r}`).value = item.rate
    ws.getCell(`F${r}`).numFmt = '#,##,##0.00'
    ws.getCell(`F${r}`).alignment = { horizontal: 'right', vertical: 'middle' }

    // Taxable Amount (formula: Qty * Rate)
    ws.getCell(`G${r}`).value = { formula: `D${r}*F${r}` }
    ws.getCell(`G${r}`).numFmt = '#,##,##0.00'
    ws.getCell(`G${r}`).alignment = { horizontal: 'right', vertical: 'middle' }

    // Total Amount (including GST)
    const gstPct = (item.gstRate || 18) / 100
    ws.getCell(`H${r}`).value = { formula: `ROUND(G${r}*(1+${gstPct}),2)` }
    ws.getCell(`H${r}`).numFmt = '#,##,##0.00'
    ws.getCell(`H${r}`).alignment = { horizontal: 'right', vertical: 'middle' }

    for (let c = 0; c < 8; c++) {
      const col = String.fromCharCode(65 + c)
      ws.getCell(`${col}${r}`).border = thinBorder
      ws.getCell(`${col}${r}`).font = { name: 'Calibri', size: 9 }
    }
    ws.getRow(r).height = 22
    currentRow++
  })

  // Ensure minimum 5 rows for aesthetics
  const startItemRow = 15
  const endItemRow = currentRow - 1

  // Summary & Totals Block
  const summaryStart = currentRow + 1
  ws.mergeCells(`A${summaryStart}:E${summaryStart}`)
  ws.getCell(`A${summaryStart}`).value = 'Amount in Words:'
  ws.getCell(`A${summaryStart}`).font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF' + MUTED } }

  ws.mergeCells(`A${summaryStart + 1}:E${summaryStart + 3}`)
  const wordsCell = ws.getCell(`A${summaryStart + 1}`)
  wordsCell.value = invoice.amountInWords || 'Indian Rupees Only'
  wordsCell.font = { name: 'Calibri', size: 9.5, italic: true, bold: true, color: { argb: 'FF' + DARK_INK } }
  wordsCell.alignment = { wrapText: true, vertical: 'top' }
  wordsCell.border = thinBorder

  // Totals Breakdown Table on Right (Columns F-H)
  const addTotalRow = (rowNum: number, label: string, formulaOrVal: any, isGrand = false, isBalance = false) => {
    ws.mergeCells(`F${rowNum}:G${rowNum}`)
    const lbl = ws.getCell(`F${rowNum}`)
    lbl.value = label
    lbl.font = { name: 'Calibri', size: isGrand || isBalance ? 10 : 9, bold: true, color: isBalance ? { argb: 'FFC53030' } : { argb: 'FF' + DARK_INK } }
    lbl.alignment = { horizontal: 'right', vertical: 'middle' }
    lbl.border = thinBorder
    if (isGrand) lbl.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + IVORY_BG } }

    const val = ws.getCell(`H${rowNum}`)
    if (typeof formulaOrVal === 'string' && formulaOrVal.startsWith('=')) {
      val.value = { formula: formulaOrVal.slice(1) }
    } else {
      val.value = formulaOrVal
    }
    val.numFmt = '₹ #,##,##0.00'
    val.font = { name: 'Calibri', size: isGrand || isBalance ? 10.5 : 9, bold: true, color: isBalance ? { argb: 'FFC53030' } : { argb: 'FF' + DARK_INK } }
    val.alignment = { horizontal: 'right', vertical: 'middle' }
    val.border = thinBorder
    if (isGrand) val.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + IVORY_BG } }
    ws.getRow(rowNum).height = isGrand || isBalance ? 22 : 18
  }

  let rTot = summaryStart
  const taxFormula = `=SUM(G${startItemRow}:G${Math.max(endItemRow, startItemRow)})`
  addTotalRow(rTot, 'Taxable Value Subtotal:', taxFormula)
  const rTaxable = rTot
  rTot++

  if (invoice.isInterState) {
    addTotalRow(rTot, 'IGST @ 18%:', `=ROUND(H${rTaxable}*0.18,2)`)
    const rIgst = rTot
    rTot++
    addTotalRow(rTot, 'Total GST:', `=H${rIgst}`)
  } else {
    addTotalRow(rTot, 'CGST @ 9%:', `=ROUND(H${rTaxable}*0.09,2)`)
    const rCgst = rTot
    rTot++
    addTotalRow(rTot, 'SGST @ 9%:', `=ROUND(H${rTaxable}*0.09,2)`)
    const rSgst = rTot
    rTot++
    addTotalRow(rTot, 'Total GST (CGST + SGST):', `=H${rCgst}+H${rSgst}`)
  }
  const rTotalGst = rTot
  rTot++

  // Grand Total
  addTotalRow(rTot, 'GRAND TOTAL (INR):', `=ROUND(H${rTaxable}+H${rTotalGst},0)`, true)
  const rGrand = rTot
  rTot++

  // Advance Received (if recorded, else 0 placeholder for client)
  const advanceVal = 0
  addTotalRow(rTot, 'Less: Advance Received:', advanceVal)
  const rAdv = rTot
  rTot++

  // Balance Due
  addTotalRow(rTot, 'BALANCE DUE PAYABLE:', `=H${rGrand}-H${rAdv}`, false, true)
  rTot++

  // Bank Details & Terms Row
  const bankStart = Math.max(rTot + 1, summaryStart + 6)
  ws.mergeCells(`A${bankStart}:D${bankStart}`)
  ws.getCell(`A${bankStart}`).value = 'BANK & UPI PAYMENT DETAILS'
  ws.getCell(`A${bankStart}`).font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FFFFFFFF' } }
  ws.getCell(`A${bankStart}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + DARK_INK } }
  ws.getCell(`A${bankStart}`).alignment = { vertical: 'middle', indent: 1 }

  ws.mergeCells(`E${bankStart}:H${bankStart}`)
  ws.getCell(`E${bankStart}`).value = 'TERMS & CONDITIONS'
  ws.getCell(`E${bankStart}`).font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FFFFFFFF' } }
  ws.getCell(`E${bankStart}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + DARK_INK } }
  ws.getCell(`E${bankStart}`).alignment = { vertical: 'middle', indent: 1 }
  ws.getRow(bankStart).height = 20

  const bankLines = [
    `Beneficiary: ${invoice.bankDetails?.accountName || UNIFIED_VENTURES_GST.bank.accountName}`,
    `Bank Name: ${invoice.bankDetails?.bankName || UNIFIED_VENTURES_GST.bank.bankName}`,
    `Account Number: ${invoice.bankDetails?.accountNumber || UNIFIED_VENTURES_GST.bank.accountNumber}`,
    `IFSC Code: ${invoice.bankDetails?.ifscCode || UNIFIED_VENTURES_GST.bank.ifscCode}`,
    `Branch: ${invoice.bankDetails?.branch || UNIFIED_VENTURES_GST.bank.branch}`,
    `UPI ID: ${invoice.bankDetails?.upiId || UNIFIED_VENTURES_GST.bank.upiId}`,
  ]

  const termsText =
    invoice.notes ||
    '1. Payment due within 7 days of invoice issuance via NEFT/RTGS/UPI.\n' +
    '2. Interest @ 18% p.a. will be levied on overdue payments beyond due date.\n' +
    '3. All materials supplied remain property of Unified Ventures until full settlement.\n' +
    '4. Subject to Bengaluru, Karnataka jurisdiction only.'

  ws.mergeCells(`E${bankStart + 1}:H${bankStart + 6}`)
  const termCell = ws.getCell(`E${bankStart + 1}`)
  termCell.value = termsText
  termCell.font = { name: 'Calibri', size: 8 }
  termCell.alignment = { wrapText: true, vertical: 'top' }
  termCell.border = thinBorder

  bankLines.forEach((line, idx) => {
    const r = bankStart + 1 + idx
    ws.mergeCells(`A${r}:D${r}`)
    ws.getCell(`A${r}`).value = line
    ws.getCell(`A${r}`).font = { name: 'Calibri', size: 8.5 }
    ws.getCell(`A${r}`).border = thinBorder
    ws.getCell(`A${r}`).alignment = { vertical: 'middle' }
    ws.getRow(r).height = 18
  })

  // Signature Block
  const sigRow = bankStart + 8
  ws.mergeCells(`A${sigRow}:D${sigRow}`)
  ws.getCell(`A${sigRow}`).value = 'Client Acknowledgement & Stamp'
  ws.getCell(`A${sigRow}`).font = { name: 'Calibri', size: 9, bold: true }

  ws.mergeCells(`F${sigRow}:H${sigRow}`)
  ws.getCell(`F${sigRow}`).value = 'For UNIFIED VENTURES'
  ws.getCell(`F${sigRow}`).font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FF' + DARK_INK } }
  ws.getCell(`F${sigRow}`).alignment = { horizontal: 'right' }

  const sigLine = sigRow + 3
  ws.mergeCells(`A${sigLine}:D${sigLine}`)
  ws.getCell(`A${sigLine}`).value = 'Authorised Client Signature & Date'
  ws.getCell(`A${sigLine}`).font = { name: 'Calibri', size: 8.5, color: { argb: 'FF' + MUTED } }
  ws.getCell(`A${sigLine}`).border = { top: { style: 'thin', color: { argb: 'FF' + BORDER_COLOR } } }

  ws.mergeCells(`F${sigLine}:H${sigLine}`)
  ws.getCell(`F${sigLine}`).value = 'Authorised Signatory (Interior Architect)'
  ws.getCell(`F${sigLine}`).font = { name: 'Calibri', size: 8.5, color: { argb: 'FF' + MUTED } }
  ws.getCell(`F${sigLine}`).border = { top: { style: 'thin', color: { argb: 'FF' + BORDER_COLOR } } }
  ws.getCell(`F${sigLine}`).alignment = { horizontal: 'right' }

  ws.pageSetup.printArea = `A1:H${sigLine + 1}`

  const buffer = await wb.xlsx.writeBuffer()
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}
