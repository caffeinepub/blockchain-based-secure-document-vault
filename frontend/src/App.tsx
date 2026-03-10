import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import VaultDashboard from './pages/VaultDashboard';
import Layout from './components/Layout';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <Layout>
        <VaultDashboard />
      </Layout>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
