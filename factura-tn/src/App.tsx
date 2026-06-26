import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { InvoiceListPage } from './pages/InvoiceListPage'
import { InvoiceCreatePage } from './pages/InvoiceCreatePage'
import { InvoiceEditPage } from './pages/InvoiceEditPage'
import { InvoiceDetailPage } from './pages/InvoiceDetailPage'
import { ClientListPage } from './pages/ClientListPage'
import { ProductListPage } from './pages/ProductListPage'
import { SettingsPage } from './pages/SettingsPage'
import './i18n'

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="/invoices" element={<InvoiceListPage />} />
            {/* /new must come before /:id */}
            <Route path="/invoices/new" element={<InvoiceCreatePage />} />
            <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
            <Route path="/invoices/:id/edit" element={<InvoiceEditPage />} />
            <Route path="/clients" element={<ClientListPage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/reports" element={<div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"><p className="text-lg font-medium text-gray-400">Rapports / التقارير</p></div>} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}

export default App
