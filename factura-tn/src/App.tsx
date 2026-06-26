import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { InvoiceListPage } from './pages/InvoiceListPage'
import { InvoiceCreatePage } from './pages/InvoiceCreatePage'
import { ClientListPage } from './pages/ClientListPage'
import './i18n'

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900">
      <p className="text-lg font-medium text-gray-400">{title}</p>
    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="/invoices" element={<InvoiceListPage />} />
            <Route path="/invoices/new" element={<InvoiceCreatePage />} />
            <Route path="/invoices/:id/edit" element={<InvoiceCreatePage />} />
            <Route path="/clients" element={<ClientListPage />} />
            <Route path="/products" element={<PlaceholderPage title="Produits / المنتجات" />} />
            <Route path="/reports" element={<PlaceholderPage title="Rapports / التقارير" />} />
            <Route path="/settings" element={<PlaceholderPage title="Paramètres / الإعدادات" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}

export default App
