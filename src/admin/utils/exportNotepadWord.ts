import type { AdminNote } from '@/admin/types'
import { UNIFIED_VENTURES_GST } from '@/config/gst'
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

const COLOR_PRIMARY = '1A365D'
const COLOR_GOLD = 'B7791F'
const COLOR_DARK = '2D3748'
const COLOR_MUTED = '718096'
const COLOR_BORDER = 'CBD5E0'

export async function generateNotepadWord(note: AdminNote): Promise<Blob> {
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

  function makeHeaderCell(text: string, widthPercent: number, alignment: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.CENTER) {
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

  function makeDataCell(text: string, widthPercent: number, alignment: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT, isBold = false) {
    return new TableCell({
      width: { size: widthPercent, type: WidthType.PERCENTAGE },
      children: [
        new Paragraph({
          alignment,
          children: [new TextRun({ text, size: 13, color: COLOR_DARK, bold: isBold })],
        }),
      ],
    })
  }

  const doc = new Document({
    creator: 'Unified Ventures',
    title: `Interior Work Notepad - ${note.title}`,
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
          // Top Header: Company Info (Left) & Notepad Title (Right)
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
                            size: 14,
                            color: COLOR_MUTED,
                          }),
                          new TextRun({ text: 'Phone: ', bold: true, size: 14 }),
                          new TextRun({ text: `${UNIFIED_VENTURES_GST.contact.phone}   |   `, size: 14 }),
                          new TextRun({ text: 'Email: ', bold: true, size: 14 }),
                          new TextRun({ text: `${UNIFIED_VENTURES_GST.contact.email}`, size: 14 }),
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
                            text: 'INTERIOR WORK NOTEPAD',
                            bold: true,
                            size: 26,
                            color: COLOR_PRIMARY,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: 'Site Visit, Measurements & Progress Record',
                            bold: true,
                            size: 14,
                            color: COLOR_GOLD,
                          }),
                        ],
                        spacing: { after: 50 },
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({ text: 'Doc Ref: ', bold: true, size: 14 }),
                          new TextRun({
                            text: `UV-NOTE-${note.id?.slice(0, 8).toUpperCase() || 'RECORD'}\n`,
                            bold: true,
                            size: 14,
                            color: COLOR_PRIMARY,
                          }),
                          new TextRun({ text: 'Date: ', bold: true, size: 14 }),
                          new TextRun({ text: `${note.date || new Date().toISOString().slice(0, 10)}\n`, size: 14 }),
                          new TextRun({ text: 'Category: ', bold: true, size: 14 }),
                          new TextRun({ text: `${(note.category || 'work').toUpperCase()}`, size: 14 }),
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
                size: 12,
              }),
            ],
            spacing: { before: 60, after: 100 },
          }),

          // Section 1: Project & Client Identification
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    columnSpan: 4,
                    shading: { fill: 'EDF2F7', type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: '1. PROJECT & CLIENT IDENTIFICATION',
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
                  makeDataCell('Client Name:', 20, AlignmentType.LEFT, true),
                  makeDataCell(note.clientName || 'Private Client', 30),
                  makeDataCell('Document Title:', 20, AlignmentType.LEFT, true),
                  makeDataCell(note.title || 'Architectural Brief', 30),
                ],
              }),
              new TableRow({
                children: [
                  makeDataCell('Project Name:', 20, AlignmentType.LEFT, true),
                  makeDataCell(note.projectName || 'Bengaluru Project', 30),
                  makeDataCell('Subject / Scope:', 20, AlignmentType.LEFT, true),
                  makeDataCell(note.subject || 'Interior Space Planning', 30),
                ],
              }),
              new TableRow({
                children: [
                  makeDataCell('Site Address:', 20, AlignmentType.LEFT, true),
                  makeDataCell('Bengaluru, Karnataka, India', 30),
                  makeDataCell('Lead Architect:', 20, AlignmentType.LEFT, true),
                  makeDataCell('Unified Ventures Studio', 30),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 100 } }),

          // Section 2: Detailed Work Notes & Design Specifications
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    shading: { fill: 'EDF2F7', type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: '2. DETAILED ARCHITECTURAL NOTES & SPECIFICATIONS',
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
                          new TextRun({
                            text: note.content || 'No details recorded.',
                            size: 14,
                            color: COLOR_DARK,
                          }),
                        ],
                        spacing: { before: 80, after: 80 },
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 100 } }),

          // Section 3: Room Measurements Schedule (Site Reference Table)
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    columnSpan: 7,
                    shading: { fill: 'EDF2F7', type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: '3. ROOM MEASUREMENTS & DIMENSIONS SCHEDULE',
                            bold: true,
                            size: 15,
                            color: COLOR_PRIMARY,
                          }),
                          new TextRun({
                            text: '   (Feet / Inches / SQFT)',
                            italics: true,
                            size: 12,
                            color: COLOR_MUTED,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  makeHeaderCell('#', 5),
                  makeHeaderCell('Room / Area', 22),
                  makeHeaderCell('Length (ft)', 12),
                  makeHeaderCell('Width (ft)', 12),
                  makeHeaderCell('Height (ft)', 12),
                  makeHeaderCell('Carpet Area', 13),
                  makeHeaderCell('Architectural Remarks', 24),
                ],
              }),
              new TableRow({
                children: [
                  makeDataCell('1', 5, AlignmentType.CENTER),
                  makeDataCell('Foyer & Entryway', 22),
                  makeDataCell('7\' 6"', 12, AlignmentType.CENTER),
                  makeDataCell('5\' 0"', 12, AlignmentType.CENTER),
                  makeDataCell('9\' 6"', 12, AlignmentType.CENTER),
                  makeDataCell('37.5 sft', 13, AlignmentType.CENTER),
                  makeDataCell('Shoe console and decorative paneling', 24),
                ],
              }),
              new TableRow({
                children: [
                  makeDataCell('2', 5, AlignmentType.CENTER),
                  makeDataCell('Living & Dining Lounge', 22),
                  makeDataCell('22\' 4"', 12, AlignmentType.CENTER),
                  makeDataCell('13\' 6"', 12, AlignmentType.CENTER),
                  makeDataCell('9\' 6"', 12, AlignmentType.CENTER),
                  makeDataCell('301.5 sft', 13, AlignmentType.CENTER),
                  makeDataCell('Perimeter cove false ceiling & TV wall', 24),
                ],
              }),
              new TableRow({
                children: [
                  makeDataCell('3', 5, AlignmentType.CENTER),
                  makeDataCell('Modular Kitchen', 22),
                  makeDataCell('11\' 2"', 12, AlignmentType.CENTER),
                  makeDataCell('9\' 0"', 12, AlignmentType.CENTER),
                  makeDataCell('9\' 6"', 12, AlignmentType.CENTER),
                  makeDataCell('100.5 sft', 13, AlignmentType.CENTER),
                  makeDataCell('Gola profile shutters & quartz counter', 24),
                ],
              }),
              new TableRow({
                children: [
                  makeDataCell('4', 5, AlignmentType.CENTER),
                  makeDataCell('Master Bedroom', 22),
                  makeDataCell('15\' 6"', 12, AlignmentType.CENTER),
                  makeDataCell('12\' 0"', 12, AlignmentType.CENTER),
                  makeDataCell('9\' 6"', 12, AlignmentType.CENTER),
                  makeDataCell('186.0 sft', 13, AlignmentType.CENTER),
                  makeDataCell('10ft sliding wardrobe with tinted glass', 24),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 100 } }),

          // Section 4: Materials & Specifications Schedule
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    columnSpan: 6,
                    shading: { fill: 'EDF2F7', type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: '4. APPROVED MATERIAL SPECIFICATIONS SCHEDULE',
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
                  makeHeaderCell('#', 5),
                  makeHeaderCell('Material Category', 23),
                  makeHeaderCell('Approved Brand', 24),
                  makeHeaderCell('Detailed Specification', 28),
                  makeHeaderCell('Quantity', 10),
                  makeHeaderCell('Status', 10),
                ],
              }),
              new TableRow({
                children: [
                  makeDataCell('1', 5, AlignmentType.CENTER),
                  makeDataCell('Plywood - Core', 23),
                  makeDataCell('CenturyPly / Greenply', 24),
                  makeDataCell('710 Marine Grade BWP calibrated', 28),
                  makeDataCell('35 Sheets', 10, AlignmentType.CENTER),
                  makeDataCell('Verified', 10, AlignmentType.CENTER, true),
                ],
              }),
              new TableRow({
                children: [
                  makeDataCell('2', 5, AlignmentType.CENTER),
                  makeDataCell('Face Laminates', 23),
                  makeDataCell('Merino / Royale Touche', 24),
                  makeDataCell('1.0mm Zero Finish suede anti-fingerprint', 28),
                  makeDataCell('30 Sheets', 10, AlignmentType.CENTER),
                  makeDataCell('Approved', 10, AlignmentType.CENTER, true),
                ],
              }),
              new TableRow({
                children: [
                  makeDataCell('3', 5, AlignmentType.CENTER),
                  makeDataCell('Fittings & Hardware', 23),
                  makeDataCell('Blum / Hafele', 24),
                  makeDataCell('Clip-top soft close hinges & tandem runners', 28),
                  makeDataCell('48 Pairs', 10, AlignmentType.CENTER),
                  makeDataCell('Verified', 10, AlignmentType.CENTER, true),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 120 } }),

          // Section 5: Signatures & Handover Acknowledgement
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'CLIENT ACKNOWLEDGEMENT & APPROVAL',
                            bold: true,
                            size: 15,
                            color: COLOR_PRIMARY,
                          }),
                        ],
                        spacing: { after: 40 },
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'I/We have reviewed the site notes, space planning and design specifications recorded above and confirm approval for execution as scheduled.\n\n\n',
                            size: 13,
                            color: COLOR_MUTED,
                          }),
                          new TextRun({ text: 'Client Signature: _____________________________________\n', size: 13, bold: true }),
                          new TextRun({ text: `Client Name:       ${note.clientName || 'Private Residence'}\n`, size: 13 }),
                          new TextRun({ text: `Date:                    ${note.date || new Date().toISOString().slice(0, 10)}\n`, size: 13 }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'FOR UNIFIED VENTURES',
                            bold: true,
                            size: 15,
                            color: COLOR_PRIMARY,
                          }),
                        ],
                        spacing: { after: 40 },
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Certified that architectural specifications, measurements and execution guidelines have been verified in accordance with atelier standards.\n\n\n',
                            size: 13,
                            color: COLOR_MUTED,
                          }),
                          new TextRun({ text: 'Architect / Supervisor: _________________________________\n', size: 13, bold: true }),
                          new TextRun({ text: 'Studio Lead:              Senior Interior Architect\n', size: 13 }),
                          new TextRun({ text: `Date:                             ${note.date || new Date().toISOString().slice(0, 10)}\n`, size: 13 }),
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
