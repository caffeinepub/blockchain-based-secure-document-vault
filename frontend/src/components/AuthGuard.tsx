import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, FileCheck } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { login, isLoginSuccess, isLoggingIn, identity } = useInternetIdentity();

  if (!isLoginSuccess || !identity) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-vault-accent/20 blur-2xl rounded-full" />
                <img 
                  src="/assets/generated/vault-logo.dim_256x256.png" 
                  alt="SecureVault" 
                  className="w-24 h-24 relative"
                />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Welcome to SecureVault</h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Secure your documents with blockchain-powered encryption and decentralized storage.
            </p>
          </div>

          <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle>Secure Authentication Required</CardTitle>
              <CardDescription>
                Login with Internet Identity to access your encrypted vault
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <Shield className="w-5 h-5 text-vault-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">End-to-End Encryption</p>
                    <p className="text-muted-foreground">Your files are encrypted on your device before upload</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Lock className="w-5 h-5 text-vault-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Blockchain Security</p>
                    <p className="text-muted-foreground">Documents stored on the Internet Computer blockchain</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <FileCheck className="w-5 h-5 text-vault-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Private Access</p>
                    <p className="text-muted-foreground">Only you can access and decrypt your documents</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={login} 
                disabled={isLoggingIn}
                className="w-full bg-vault-accent hover:bg-vault-accent/90 text-vault-accent-foreground font-medium"
                size="lg"
              >
                {isLoggingIn ? 'Connecting...' : 'Login with Internet Identity'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
