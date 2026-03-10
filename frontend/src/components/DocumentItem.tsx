import { useState } from 'react';
import { Download, Trash2, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useEncryption } from '../hooks/useEncryption';
import { useDeleteDocument } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { Document } from '../backend';

interface DocumentItemProps {
  document: Document;
}

export default function DocumentItem({ document }: DocumentItemProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { decryptFile } = useEncryption();
  const deleteDocumentMutation = useDeleteDocument();

  const formatFileSize = (bytes: bigint): string => {
    const size = Number(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / 1024 / 1024).toFixed(2)} MB`;
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      toast.info('Downloading and decrypting...');

      // Get encrypted content
      const encryptedBytes = await document.content.getBytes();

      // Decrypt the file - returns Uint8Array<ArrayBuffer>
      const decryptedData = await decryptFile(encryptedBytes);

      // Create blob and download
      const blob = new Blob([decryptedData]);
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Document downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDocumentMutation.mutateAsync(document.id);
      toast.success('Document deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-accent/30 hover:bg-accent/50 transition-colors group">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="p-2 rounded-md bg-card border border-border/50">
          <FileText className="w-5 h-5 text-vault-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{document.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatFileSize(document.size)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={isDownloading || deleteDocumentMutation.isPending}
          className="border-border/50 hover:bg-accent"
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isDownloading || deleteDocumentMutation.isPending}
              className="border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
            >
              {deleteDocumentMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="border-border/50 bg-card">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Document?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{document.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border/50">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
