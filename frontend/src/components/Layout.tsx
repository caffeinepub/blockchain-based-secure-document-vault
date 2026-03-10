import { Shield } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { identity, clear, isLoginSuccess } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background pattern */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'url(/assets/generated/encrypted-bg.dim_1920x1080.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Header */}
      <header className="relative border-b border-border/50 backdrop-blur-sm bg-card/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/generated/vault-logo.dim_256x256.png" 
                alt="SecureVault" 
                className="w-10 h-10"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">SecureVault</h1>
                <p className="text-xs text-muted-foreground">Blockchain Document Protection</p>
              </div>
            </div>
            
            {isLoginSuccess && identity && (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent/50 border border-border/50">
                  <Shield className="w-4 h-4 text-vault-accent" />
                  <span className="text-xs text-muted-foreground font-mono">
                    {identity.getPrincipal().toString().slice(0, 8)}...
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clear}
                  className="border-border/50 hover:bg-accent"
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative border-t border-border/50 mt-16 backdrop-blur-sm bg-card/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} SecureVault. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Built with <span className="text-vault-accent">♥</span> using{' '}
              <a 
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-vault-accent transition-colors font-medium"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
