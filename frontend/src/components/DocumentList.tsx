import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Loader2 } from 'lucide-react';
import { useGetMyDocuments } from '../hooks/useQueries';
import DocumentItem from './DocumentItem';

interface DocumentListProps {
  refreshTrigger: number;
}

export default function DocumentList({ refreshTrigger }: DocumentListProps) {
  const { data: documents, isLoading, error } = useGetMyDocuments(refreshTrigger);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-vault-accent" />
          My Documents
        </CardTitle>
        <CardDescription>
          {documents && documents.length > 0 
            ? `${documents.length} encrypted ${documents.length === 1 ? 'document' : 'documents'} in your vault`
            : 'Your encrypted documents will appear here'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-vault-accent" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">
            <p>Failed to load documents</p>
          </div>
        ) : documents && documents.length > 0 ? (
          <div className="space-y-2">
            {documents.map((doc) => (
              <DocumentItem key={doc.id} document={doc} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 space-y-3">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-accent">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">No documents yet</p>
              <p className="text-sm text-muted-foreground">
                Upload your first document to get started
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
