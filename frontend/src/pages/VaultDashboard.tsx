import { useInternetIdentity } from '../hooks/useInternetIdentity';
import AuthGuard from '../components/AuthGuard';
import DocumentUpload from '../components/DocumentUpload';
import DocumentList from '../components/DocumentList';
import { useState } from 'react';

export default function VaultDashboard() {
  const { isLoginSuccess } = useInternetIdentity();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* Welcome section */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Your Secure Vault</h2>
            <p className="text-muted-foreground">
              Upload, manage, and securely store your encrypted documents on the blockchain.
            </p>
          </div>

          {/* Upload section */}
          <DocumentUpload onUploadSuccess={handleUploadSuccess} />

          {/* Documents list */}
          <DocumentList refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </AuthGuard>
  );
}
