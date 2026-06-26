import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import type { Invoice } from '../../types/invoice'
import { vatLabel } from '../../utils/invoice'

// PDF uses fr-TN formatting regardless of app language (fiscal requirement)
function fmt(amount: number): string {
  return amount.toLocaleString('fr-TN', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }) + ' DT'
}

function fmtDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const y = date.getFullYear()
  return `${d}/${m}/${y}`
}

Font.registerHyphenationCallback((word) => [word])

const C = {
  navy: '#1D3557',
  blue: '#457B9D',
  sky: '#e8f4fd',
  light: '#f8fafc',
  border: '#e2e8f0',
  text: '#1e293b',
  muted: '#64748b',
  white: '#ffffff',
  accent: '#0284c7',
}

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: C.text,
    backgroundColor: C.white,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
  },

  // ── Header ──────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: C.navy,
  },
  logoBox: {
    width: 100,
    height: 60,
    backgroundColor: C.sky,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: C.navy },
  logoSub: { fontSize: 7, color: C.blue, marginTop: 2 },
  sellerBlock: { alignItems: 'flex-end', maxWidth: 220 },
  sellerName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: C.navy,
    marginBottom: 4,
  },
  sellerLine: { fontSize: 8, color: C.muted, marginBottom: 2 },
  sellerMatricule: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: C.navy,
    marginTop: 4,
  },

  // ── Invoice title strip ──────────────────────────────────
  titleStrip: {
    backgroundColor: C.navy,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleLabel: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
    letterSpacing: 1,
  },
  titleNumber: { fontSize: 10, color: '#a8c8e8', fontFamily: 'Helvetica-Bold' },

  // ── Two-column meta (client + dates) ────────────────────
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  metaCard: {
    flex: 1,
    backgroundColor: C.light,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
  },
  metaCardTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: C.blue,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingBottom: 4,
  },
  metaLine: { fontSize: 8.5, color: C.text, marginBottom: 3 },
  metaLabel: { fontSize: 7.5, color: C.muted, marginBottom: 1 },
  metaBold: { fontFamily: 'Helvetica-Bold' },
  metaMatricule: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: C.navy,
    marginTop: 4,
  },

  // ── Line items table ────────────────────────────────────
  tableTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: C.navy,
    marginBottom: 6,
  },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: C.navy,
    borderRadius: 4,
    paddingVertical: 7,
    paddingHorizontal: 4,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tableRowAlt: { backgroundColor: C.light },
  thText: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: C.white },
  tdText: { fontSize: 8.5, color: C.text },
  colDesc: { flex: 3 },
  colQty: { flex: 1, textAlign: 'right' },
  colUnit: { flex: 1.5, textAlign: 'right' },
  colVat: { flex: 1, textAlign: 'center' },
  colHT: { flex: 1.5, textAlign: 'right' },
  colTTC: { flex: 1.5, textAlign: 'right' },

  // ── VAT breakdown ────────────────────────────────────────
  vatSection: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  vatTable: {
    width: 240,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  vatHead: {
    flexDirection: 'row',
    backgroundColor: C.sky,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  vatRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  vatCell: { flex: 1, fontSize: 8, color: C.text, textAlign: 'right' },
  vatCellHead: {
    flex: 1,
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: C.navy,
    textAlign: 'right',
  },

  // ── Totals box ──────────────────────────────────────────
  totalsSection: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalsBox: {
    width: 240,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  totalRowTTC: {
    backgroundColor: C.navy,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  totalLabel: { fontSize: 8.5, color: C.muted },
  totalValue: { fontSize: 8.5, color: C.text, fontFamily: 'Helvetica-Bold' },
  totalLabelTTC: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.white },
  totalValueTTC: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#7dd3fc' },

  // ── Notes ───────────────────────────────────────────────
  notesSection: {
    marginTop: 20,
    padding: 12,
    backgroundColor: C.light,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  notesTitle: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: C.blue,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  notesText: { fontSize: 8.5, color: C.muted },

  // ── Legal mention ────────────────────────────────────────
  legalSection: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
    alignItems: 'center',
  },
  legalText: {
    fontSize: 7.5,
    color: C.muted,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // ── Footer ──────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 6,
  },
  footerText: { fontSize: 7, color: C.muted },
})

interface Props {
  invoice: Invoice
}

export function InvoicePDF({ invoice }: Props) {
  const { seller, client, items, totals } = invoice

  return (
    <Document
      title={invoice.number}
      author={seller.name}
      subject="Facture"
      keywords="facture,tunisie,TVA"
    >
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.logoBox}>
            <Text style={s.logoText}>Factura</Text>
            <Text style={s.logoSub}>TN</Text>
          </View>
          <View style={s.sellerBlock}>
            <Text style={s.sellerName}>{seller.name}</Text>
            <Text style={s.sellerLine}>{seller.address}</Text>
            <Text style={s.sellerLine}>{seller.city}</Text>
            <Text style={s.sellerLine}>{seller.phone}</Text>
            <Text style={s.sellerLine}>{seller.email}</Text>
            <Text style={s.sellerMatricule}>
              MF : {seller.matriculeFiscal}
            </Text>
          </View>
        </View>

        {/* ── Title strip ── */}
        <View style={s.titleStrip}>
          <Text style={s.titleLabel}>FACTURE</Text>
          <Text style={s.titleNumber}>{invoice.number}</Text>
        </View>

        {/* ── Client + Dates ── */}
        <View style={s.metaRow}>
          <View style={s.metaCard}>
            <Text style={s.metaCardTitle}>Facturé à</Text>
            <Text style={[s.metaLine, s.metaBold]}>{client.name}</Text>
            <Text style={s.metaLine}>{client.address}</Text>
            <Text style={s.metaLine}>{client.city}</Text>
            {client.phone ? <Text style={s.metaLine}>{client.phone}</Text> : null}
            {client.email ? <Text style={s.metaLine}>{client.email}</Text> : null}
            {client.matriculeFiscal ? (
              <Text style={s.metaMatricule}>MF : {client.matriculeFiscal}</Text>
            ) : null}
          </View>

          <View style={s.metaCard}>
            <Text style={s.metaCardTitle}>Détails de la facture</Text>
            <Text style={s.metaLabel}>Numéro</Text>
            <Text style={[s.metaLine, s.metaBold]}>{invoice.number}</Text>
            <Text style={s.metaLabel}>Date d'émission</Text>
            <Text style={s.metaLine}>{fmtDate(invoice.issueDate)}</Text>
            {invoice.dueDate ? (
              <>
                <Text style={s.metaLabel}>Date d'échéance</Text>
                <Text style={s.metaLine}>{fmtDate(invoice.dueDate)}</Text>
              </>
            ) : null}
          </View>
        </View>

        {/* ── Line items table ── */}
        <Text style={s.tableTitle}>Désignation des prestations</Text>

        <View style={s.tableHead}>
          <Text style={[s.thText, s.colDesc]}>Désignation</Text>
          <Text style={[s.thText, s.colQty]}>Qté</Text>
          <Text style={[s.thText, s.colUnit]}>P.U. HT</Text>
          <Text style={[s.thText, s.colVat]}>TVA</Text>
          <Text style={[s.thText, s.colHT]}>Total HT</Text>
          <Text style={[s.thText, s.colTTC]}>Total TTC</Text>
        </View>

        {items.map((item, i) => (
          <View
            key={item.id}
            style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}
          >
            <Text style={[s.tdText, s.colDesc]}>{item.description}</Text>
            <Text style={[s.tdText, s.colQty]}>{item.quantity}</Text>
            <Text style={[s.tdText, s.colUnit]}>{fmt(item.unitPrice)}</Text>
            <Text style={[s.tdText, s.colVat]}>{vatLabel(item.vatRate)}</Text>
            <Text style={[s.tdText, s.colHT]}>{fmt(item.totalHT)}</Text>
            <Text style={[s.tdText, s.colTTC]}>{fmt(item.totalTTC)}</Text>
          </View>
        ))}

        {/* ── VAT breakdown ── */}
        {totals.vatBreakdown.length > 0 && (
          <View style={s.vatSection}>
            <View style={s.vatTable}>
              <View style={s.vatHead}>
                <Text style={s.vatCellHead}>Taux TVA</Text>
                <Text style={s.vatCellHead}>Base HT</Text>
                <Text style={s.vatCellHead}>Montant TVA</Text>
              </View>
              {totals.vatBreakdown.map((v) => (
                <View key={String(v.rate)} style={s.vatRow}>
                  <Text style={s.vatCell}>{vatLabel(v.rate)}</Text>
                  <Text style={s.vatCell}>{fmt(v.base)}</Text>
                  <Text style={s.vatCell}>{fmt(v.amount)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Totals ── */}
        <View style={s.totalsSection}>
          <View style={s.totalsBox}>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Total HT</Text>
              <Text style={s.totalValue}>{fmt(totals.totalHT)}</Text>
            </View>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Total TVA</Text>
              <Text style={s.totalValue}>{fmt(totals.totalTVA)}</Text>
            </View>
            <View style={s.totalRowTTC}>
              <Text style={s.totalLabelTTC}>TOTAL TTC</Text>
              <Text style={s.totalValueTTC}>{fmt(totals.totalTTC)}</Text>
            </View>
          </View>
        </View>

        {/* ── Notes ── */}
        {invoice.notes ? (
          <View style={s.notesSection}>
            <Text style={s.notesTitle}>Notes &amp; Conditions</Text>
            <Text style={s.notesText}>{invoice.notes}</Text>
          </View>
        ) : null}

        {/* ── Legal mention ── */}
        <View style={s.legalSection}>
          <Text style={s.legalText}>
            Facture conforme à la législation fiscale tunisienne (DGI) — Article 18 du Code de la TVA
          </Text>
        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            Généré le {fmtDate(new Date())} — {invoice.number}
          </Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
        </View>

      </Page>
    </Document>
  )
}
