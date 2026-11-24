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

          new Paragraph({ spacing: { after: 120 } }),

          // Section 3: Signatures & Handover Acknowledgement
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
