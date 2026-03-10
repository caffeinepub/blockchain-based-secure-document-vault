import { useState, useCallback, DragEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileUp, CheckCircle2 } from 'lucide-react';
import { useEncryption } from '../hooks/useEncryption';
import { useAddDocument } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

interface DocumentUploadProps {
  onUploadSuccess: () => void;
}

export default function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const { encryptFile } = useEncryption();
  const addDocumentMutation = useAddDocument();

  const handleFiles = useCallback((files: FileList | null) => {
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setUploadProgress(0);
    }
  }, []);

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!addDocumentMutation.isPending && !isEncrypting) {
      setIsDragActive(true);
    }
  }, [addDocumentMutation.isPending, isEncrypting]);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (!addDocumentMutation.isPending && !isEncrypting) {
      handleFiles(e.dataTransfer.files);
    }
  }, [addDocumentMutation.isPending, isEncrypting, handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsEncrypting(true);
      toast.info('Encrypting file...');

      // Encrypt the file - returns Uint8Array<ArrayBuffer>
      const encryptedData = await encryptFile(selectedFile);
      
      setIsEncrypting(false);
      setUploadProgress(10);

      // Create ExternalBlob with progress tracking
      const blob = ExternalBlob.fromBytes(encryptedData).withUploadProgress((percentage) => {
        setUploadProgress(10 + (percentage * 0.9)); // 10% for encryption, 90% for upload
      });

      // Generate unique ID
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Upload to backend
      await addDocumentMutation.mutateAsync({
        content: blob,
        id,
        name: selectedFile.name,
        size: BigInt(selectedFile.size),
      });

      toast.success('Document uploaded successfully!');
      setSelectedFile(null);
      setUploadProgress(0);
      onUploadSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
      setIsEncrypting(false);
      setUploadProgress(0);
    }
  };

  const isUploading = addDocumentMutation.isPending || isEncrypting;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-vault-accent" />
          Upload Document
        </CardTitle>
        <CardDescription>
          Select a file to encrypt and securely store on the blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => {
            if (!isUploading) {
              document.getElementById('file-input')?.click();
            }
          }}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
            ${isDragActive 
              ? 'border-vault-accent bg-vault-accent/10' 
              : 'border-border/50 hover:border-vault-accent/50 hover:bg-accent/30'
            }
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            id="file-input"
            type="file"
            onChange={handleFileInput}
            disabled={isUploading}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-accent">
              <FileUp className="w-8 h-8 text-vault-accent" />
            </div>
            {selectedFile ? (
              <div className="space-y-1">
                <p className="font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  {isDragActive ? 'Drop file here' : 'Drag & drop a file here'}
                </p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
              </div>
            )}
          </div>
        </div>

        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {isEncrypting ? 'Encrypting...' : 'Uploading...'}
              </span>
              <span className="font-medium text-foreground">{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {selectedFile && !isUploading && (
          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              className="flex-1 bg-vault-accent hover:bg-vault-accent/90 text-vault-accent-foreground"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Encrypt & Upload
            </Button>
            <Button
              onClick={() => setSelectedFile(null)}
              variant="outline"
              className="border-border/50"
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
