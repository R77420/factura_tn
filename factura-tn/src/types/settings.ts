export interface CompanySettings {
  name: string
  address: string
  city: string
  phone: string
  email: string
  matriculeFiscal: string
  logo?: string   // base64 data URI
  rib?: string    // coordonnées bancaires
  invoicePrefix: string
  invoiceFooter: string
}

export const DEFAULT_SETTINGS: CompanySettings = {
  name: 'Mon Entreprise SARL',
  address: 'Avenue Habib Bourguiba',
  city: 'Tunis',
  phone: '+216 71 000 000',
  email: 'contact@monentreprise.tn',
  matriculeFiscal: '',
  logo: undefined,
  rib: '',
  invoicePrefix: 'FAC',
  invoiceFooter: '',
}
