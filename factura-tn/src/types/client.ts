export interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  /** Format : XXXXXXX/X/X/XXX — optionnel */
  matriculeFiscal: string
  createdAt?: Date
  updatedAt?: Date
}
