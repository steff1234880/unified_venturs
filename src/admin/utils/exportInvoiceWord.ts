import type { AdminInvoice } from '@/admin/types'
import { UNIFIED_VENTURES_GST } from '@/config/gst'
import { formatINR } from './invoice'
import { getLogoUint8Array } from './logoBase64'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  Footer,
  PageNumber,
} from 'docx'

const COLOR_PRIMARY = '1A365D' // Slate navy
const COLOR_GOLD = 'B7791F'    // Warm architectural gold
const COLOR_DARK = '2D3748'    // Charcoal text
const COLOR_MUTED = '718096'   // Muted slate
const COLOR_LIGHT_BG = 'F7FAFC'
const COLOR_BORDER = 'E2E8F0'

export async function generateInvoiceWord(invoice: AdminInvoice): Promise<Blob> {
  const thinBorder = {
    style: BorderStyle.SINGLE,
    size: 4,
    color: COLOR_BORDER,
  }

  const cellBorders = {
    top: thinBorder,
    bottom: thinBorder,
    left: thinBorder,
    right: thinBorder,
  }

  const noBorder = {
    style: BorderStyle.NONE,
    size: 0,
    color: 'FFFFFF',
  }

  const noBorders = {
    top: noBorder,
    bottom: noBorder,
    left: noBorder,
    right: noBorder,
  }

  const items = invoice.items || []

  function makeHeaderCell(text: string, widthPercent: number, alignment: (typeof AlignmentType)[keyof typeof AlignmentType]) {
    return new TableCell({
      width: { size: widthPercent, type: WidthType.PERCENTAGE },
      shading: { fill: COLOR_PRIMARY, type: ShadingType.CLEAR },
      children: [
        new Paragraph({
          alignment,
          children: [new TextRun({ text, bold: true, size: 13, color: 'FFFFFF' })],
        }),
      ],
    })
  }

  function makeDataCell(text: string, widthPercent: number, alignment: (typeof AlignmentType)[keyof typeof AlignmentType]) {
    return new TableCell({
      width: { size: widthPercent, type: WidthType.PERCENTAGE },
      children: [
        new Paragraph({
          alignment,
          children: [new TextRun({ text, size: 13, color: COLOR_DARK })],
        }),
      ],
    })
  }

  function makeCalcLine(label: string, value: string, isBold = false, color = COLOR_DARK, size = 14) {
    return new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: `${label} `, bold: isBold, size, color }),
        new TextRun({ text: value, bold: isBold, size, color }),
      ],
      spacing: { after: 20 },
    })
  }

  const doc = new Document({
    creator: 'Unified Ventures',
    title: `Tax Invoice - ${invoice.invoiceNumber}`,
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `Unified Ventures Atelier  |  ${UNIFIED_VENTURES_GST.contact.phone}  |  ${UNIFIED_VENTURES_GST.contact.email}    Page `,
                    size: 14,
                    color: COLOR_MUTED,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 14,
                    color: COLOR_MUTED,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Top Header: Company Info (Left) & Invoice Title/Meta (Right)
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: noBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 60, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new ImageRun({
                            data: getLogoUint8Array(),
                            type: 'png',
                            transformation: {
                              width: 220,
                              height: 39,
                            },
                          }),
                        ],
                        spacing: { after: 80 },
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${UNIFIED_VENTURES_GST.address.full}\n`,
                            size: 15,
                            color: COLOR_DARK,
                          }),
                          new TextRun({ text: 'Phone: ', bold: true, size: 15 }),
                          new TextRun({ text: `${UNIFIED_VENTURES_GST.contact.phone}   |   `, size: 15 }),
                          new TextRun({ text: 'Email: ', bold: true, size: 15 }),
                          new TextRun({ text: `${UNIFIED_VENTURES_GST.contact.email}\n`, size: 15 }),
                          new TextRun({ text: 'Website: ', bold: true, size: 15 }),
                          new TextRun({ text: 'https://unifiedventures.in', size: 15 }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 40, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: 'TAX INVOICE',
                            bold: true,
                            size: 32,
                            color: COLOR_PRIMARY,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: '(Original for Recipient / Rule 46 of CGST Rules)',
                            italics: true,
                            size: 14,
                            color: COLOR_MUTED,
                          }),
                        ],
                        spacing: { after: 60 },
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({ text: 'Invoice No: ', bold: true, size: 17 }),
                          new TextRun({
                            text: `${invoice.invoiceNumber}\n`,
                            bold: true,
                            size: 17,
                            color: COLOR_PRIMARY,
                          }),
                          new TextRun({ text: 'Invoice Date: ', bold: true, size: 15 }),
                          new TextRun({ text: `${invoice.invoiceDate}\n`, size: 15 }),
                          new TextRun({ text: 'Due Date: ', bold: true, size: 15 }),
                          new TextRun({ text: `${invoice.dueDate || 'Upon Receipt'}\n`, size: 15 }),
                          new TextRun({ text: 'Place of Supply: ', bold: true, size: 15 }),
                          new TextRun({ text: `${invoice.placeOfSupply || 'Karnataka (29)'}`, size: 15 }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // Divider Bar
          new Paragraph({
            children: [
              new TextRun({
                text: '____________________________________________________________________________________________________',
                color: COLOR_GOLD,
                size: 13,
              }),
            ],
            spacing: { before: 60, after: 100 },
          }),

          // Company GST & Registration Bar
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: COLOR_GOLD },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR_GOLD },
              left: noBorder,
              right: noBorder,
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: COLOR_LIGHT_BG, type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: 'GSTIN: ', bold: true, size: 15, color: COLOR_PRIMARY }),
                          new TextRun({ text: `${UNIFIED_VENTURES_GST.gstin}       `, bold: true, size: 15 }),
                          new TextRun({ text: 'PAN: ', bold: true, size: 15, color: COLOR_PRIMARY }),
                          new TextRun({ text: `${UNIFIED_VENTURES_GST.pan}       `, bold: true, size: 15 }),
                          new TextRun({ text: 'State / Code: ', bold: true, size: 15, color: COLOR_PRIMARY }),
                          new TextRun({ text: `${UNIFIED_VENTURES_GST.state} / ${UNIFIED_VENTURES_GST.stateCode}`, size: 15 }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 100 } }),

          // Billed To & Project Details Box
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { fill: 'EDF2F7', type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'BILLED TO (CLIENT DETAILS)',
                            bold: true,
                            size: 15,
                            color: COLOR_PRIMARY,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { fill: 'EDF2F7', type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'PROJECT & SITE DETAILS',
                            bold: true,
                            size: 15,
                            color: COLOR_PRIMARY,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Client Name: ', bold: true, size: 15 }),
                          new TextRun({ text: `${invoice.clientName}\n`, size: 15 }),
                          new TextRun({ text: 'Company: ', bold: true, size: 15 }),
                          new TextRun({ text: `${invoice.clientCompany || 'Individual / Private Residence'}\n`, size: 15 }),
                          new TextRun({ text: 'Address: ', bold: true, size: 15 }),
                          new TextRun({ text: `${invoice.clientAddress || 'Bengaluru, Karnataka'}\n`, size: 15 }),
                          new TextRun({ text: 'Phone: ', bold: true, size: 15 }),
                          new TextRun({ text: `${invoice.clientPhone || 'Not specified'}  |  `, size: 15 }),
                          new TextRun({ text: 'GSTIN: ', bold: true, size: 15 }),
                          new TextRun({ text: `${invoice.clientGstin || 'UR (Unregistered)'}`, size: 15 }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Project Name: ', bold: true, size: 15 }),
                          new TextRun({
                            text: `${invoice.projectName || 'Interior Living Space'}\n`,
                            bold: true,
                            size: 15,
                            color: COLOR_PRIMARY,
                          }),
                          new TextRun({ text: 'Site Location: ', bold: true, size: 15 }),
                          new TextRun({ text: `${invoice.clientAddress || 'Bengaluru, Karnataka'}\n`, size: 15 }),
                          new TextRun({ text: 'PO / Ref Number: ', bold: true, size: 15 }),
                          new TextRun({ text: `${invoice.poNumber || 'UV-WO-' + invoice.invoiceNumber}\n`, size: 15 }),
                          new TextRun({ text: 'Scope: ', bold: true, size: 15 }),
                          new TextRun({ text: 'Turnkey Architectural & Interior Execution', size: 15 }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 100 } }),

          // Item Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            rows: [
              new TableRow({
                children: [
                  makeHeaderCell('#', 5, AlignmentType.CENTER),
                  makeHeaderCell('Work / Material Description', 45, AlignmentType.LEFT),
                  makeHeaderCell('HSN/SAC', 10, AlignmentType.CENTER),
                  makeHeaderCell('Qty', 7, AlignmentType.CENTER),
                  makeHeaderCell('Unit', 7, AlignmentType.CENTER),
                  makeHeaderCell('Rate (₹)', 13, AlignmentType.RIGHT),
                  makeHeaderCell('Taxable (₹)', 13, AlignmentType.RIGHT),
                ],
              }),
              ...items.map((item, idx) =>
                new TableRow({
                  children: [
                    makeDataCell(String(idx + 1), 5, AlignmentType.CENTER),
                    makeDataCell(item.description, 45, AlignmentType.LEFT),
                    makeDataCell(item.sacHsn || '998391', 10, AlignmentType.CENTER),
                    makeDataCell(String(item.quantity), 7, AlignmentType.CENTER),
                    makeDataCell(item.unit || 'LS', 7, AlignmentType.CENTER),
                    makeDataCell(formatINR(item.rate), 13, AlignmentType.RIGHT),
                    makeDataCell(formatINR(item.taxableAmount), 13, AlignmentType.RIGHT),
                  ],
                })
              ),
            ],
          }),

          new Paragraph({ spacing: { after: 100 } }),

          // Totals and Payment Summary
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            rows: [
              new TableRow({
                children: [
                  // Left Column: Bank / UPI Details & Amount in Words
                  new TableCell({
                    width: { size: 55, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'BANK & ELECTRONIC TRANSFER DETAILS',
                            bold: true,
                            size: 15,
                            color: COLOR_PRIMARY,
                          }),
                        ],
                        spacing: { after: 50 },
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Beneficiary Name: ', bold: true, size: 14 }),
                          new TextRun({ text: `${invoice.bankDetails?.accountName || UNIFIED_VENTURES_GST.bank.accountName}\n`, size: 14 }),
                          new TextRun({ text: 'Bank: ', bold: true, size: 14 }),
                          new TextRun({ text: `${invoice.bankDetails?.bankName || UNIFIED_VENTURES_GST.bank.bankName}\n`, size: 14 }),
                          new TextRun({ text: 'Account Number: ', bold: true, size: 14 }),
                          new TextRun({
                            text: `${invoice.bankDetails?.accountNumber || UNIFIED_VENTURES_GST.bank.accountNumber}\n`,
                            bold: true,
                            size: 14,
                            color: COLOR_PRIMARY,
                          }),
                          new TextRun({ text: 'IFSC Code: ', bold: true, size: 14 }),
                          new TextRun({ text: `${invoice.bankDetails?.ifscCode || UNIFIED_VENTURES_GST.bank.ifscCode}\n`, size: 14 }),
                          new TextRun({ text: 'Branch: ', bold: true, size: 14 }),
                          new TextRun({ text: `${invoice.bankDetails?.branch || UNIFIED_VENTURES_GST.bank.branch}\n`, size: 14 }),
                          new TextRun({ text: 'UPI ID: ', bold: true, size: 14 }),
                          new TextRun({
                            text: `${invoice.bankDetails?.upiId || UNIFIED_VENTURES_GST.bank.upiId}\n\n`,
                            bold: true,
                            size: 14,
                            color: COLOR_GOLD,
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Amount in Words: ', bold: true, size: 14 }),
                          new TextRun({
                            text: `${invoice.amountInWords || 'Indian Rupees Only'}`,
                            bold: true,
                            italics: true,
                            size: 14,
                            color: COLOR_PRIMARY,
                          }),
                        ],
                      }),
                    ],
                  }),

                  // Right Column: Tax Breakdown & Final Payable
                  new TableCell({
                    width: { size: 45, type: WidthType.PERCENTAGE },
                    children: [
                      makeCalcLine('Taxable Value Subtotal:', formatINR(invoice.taxableSubtotal), false),
                      ...(invoice.isInterState
                        ? [
                            makeCalcLine('IGST @ 18%:', formatINR(invoice.totalIgst), false),
                            makeCalcLine('Total GST:', formatINR(invoice.totalIgst), true, COLOR_GOLD),
                          ]
                        : [
                            makeCalcLine('CGST @ 9%:', formatINR(invoice.totalCgst), false),
                            makeCalcLine('SGST @ 9%:', formatINR(invoice.totalSgst), false),
                            makeCalcLine('Total GST (9% + 9%):', formatINR(invoice.totalCgst + invoice.totalSgst), true, COLOR_GOLD),
                          ]),
                      ...(Boolean(invoice.roundOff)
                        ? [makeCalcLine('Round-off:', formatINR(invoice.roundOff || 0), false)]
                        : []),
                      makeCalcLine('GRAND TOTAL (INR):', formatINR(invoice.grandTotal), true, COLOR_PRIMARY, 17),
                      makeCalcLine('Less: Advance Received:', formatINR(0), false),
                      makeCalcLine('BALANCE DUE PAYABLE:', formatINR(invoice.grandTotal), true, 'C53030', 17),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 100 } }),

          // Terms and Signatures
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: noBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 60, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'TERMS & CONDITIONS', bold: true, size: 14, color: COLOR_PRIMARY }),
                        ],
                        spacing: { after: 30 },
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text:
                              invoice.notes ||
                              '1. Payment is due within 7 days of invoice issuance via NEFT/RTGS/UPI.\n' +
                                '2. Interest @ 18% p.a. will be levied on overdue payments beyond due date.\n' +
                                '3. All materials supplied remain the property of Unified Ventures until full payment.\n' +
                                '4. Milestone handover requires joint inspection and sign-off.\n' +
                                '5. Subject to Bengaluru, Karnataka jurisdiction only.',
                            size: 13,
                            color: COLOR_MUTED,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 40, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({ text: 'For UNIFIED VENTURES', bold: true, size: 15, color: COLOR_PRIMARY }),
                        ],
                        spacing: { after: 400 },
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({ text: '____________________________________\n', color: COLOR_MUTED, size: 13 }),
                          new TextRun({ text: 'Authorised Signatory\n', bold: true, size: 14, color: COLOR_DARK }),
                          new TextRun({ text: '(Design & Turnkey Project Lead)', size: 12, color: COLOR_MUTED }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  })

  return await Packer.toBlob(doc)
}
