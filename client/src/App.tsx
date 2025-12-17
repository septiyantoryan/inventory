import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { BarangList } from './components/BarangList';
import { BarangForm } from './components/BarangForm';
import { SatuanList } from './components/SatuanList';
import { KategoriList } from './components/KategoriList';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Toaster } from './components/ui/sonner';

type Tab = 'barang' | 'satuan' | 'kategori';

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from current path
  const getActiveTab = (): Tab => {
    if (location.pathname.startsWith('/barang')) return 'barang';
    if (location.pathname.startsWith('/satuan')) return 'satuan';
    if (location.pathname.startsWith('/kategori')) return 'kategori';
    return 'barang';
  };

  const handleTabChange = (tab: string) => {
    navigate(`/${tab}`);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar activeTab={getActiveTab()} onTabChange={handleTabChange} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <Routes>
              <Route path="/barang" element={<BarangListPage />} />
              <Route path="/barang/tambah" element={<BarangFormPage />} />
              <Route path="/barang/edit/:id" element={<BarangFormPage />} />
              <Route path="/satuan" element={<SatuanList />} />
              <Route path="/kategori" element={<KategoriList />} />
              <Route path="/" element={<Navigate to="/barang" replace />} />
            </Routes>
          </div>
        </div>
      </main>

      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
  );
}

function BarangListPage() {
  const navigate = useNavigate();

  const handleCreateBarang = () => {
    navigate('/barang/tambah');
  };

  const handleEditBarang = (id: number) => {
    navigate(`/barang/edit/${id}`);
  };

  return <BarangList onEdit={handleEditBarang} onCreate={handleCreateBarang} />;
}

function BarangFormPage() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();

  const barangId = params.id ? parseInt(params.id) : undefined;

  const handleBackToList = () => {
    navigate('/barang');
  };

  return <BarangForm barangId={barangId} onBack={handleBackToList} />;
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
