'use client';

/**
 * DocumentUpload Component
 *
 * File upload with drag & drop functionality
 * Supports: PDF, CSV, XLSX, XLS
 */

import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, X, Loader2, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { uploadDocument } from '@/services/documents';
import { isSupportedDocumentType, getFileExtension } from '@/types';
import { getErrorMessage } from '@/lib/api-client';

interface DocumentUploadProps {
  onUploadComplete?: () => void;
}

export function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isTemporary, setIsTemporary] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, []);

  // Validate and set file
  const handleFileSelection = (file: File) => {
    // Validate file type
    if (!isSupportedDocumentType(file.name)) {
      toast.error('Tipo de archivo no soportado. Usa: PDF, CSV, XLSX, XLS');
      return;
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('El archivo es demasiado grande. Máximo: 50MB');
      return;
    }

    setSelectedFile(file);
    setUploadSuccess(false);
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  // Open file picker
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Upload file
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);

    try {
      // Simulate progress (actual progress tracking would need XMLHttpRequest)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const document = await uploadDocument({
        file: selectedFile,
        isTemporary,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success(
        `Documento "${document.filename}" procesado exitosamente. ${document.chunkCount} fragmentos creados.`
      );

      setUploadSuccess(true);

      // Reset after delay
      setTimeout(() => {
        setSelectedFile(null);
        setUploadProgress(0);
        setUploadSuccess(false);
        setIsTemporary(false);

        // Notify parent to refresh list
        onUploadComplete?.();
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(getErrorMessage(error));
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  // Cancel/remove file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card className="p-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.csv,.xlsx,.xls"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {!selectedFile ? (
        // Upload area
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
          `}
          onClick={handleBrowseClick}
        >
          <div className="flex flex-col items-center gap-3">
            <div className={`p-4 rounded-full ${isDragging ? 'bg-primary/10' : 'bg-muted'}`}>
              <Upload className={`h-8 w-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium">
                {isDragging ? 'Suelta el archivo aquí' : 'Arrastra un archivo o haz clic para seleccionar'}
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, CSV, XLSX, XLS (máx. 50MB)
              </p>
            </div>

            <Button variant="secondary" size="sm" type="button">
              Seleccionar archivo
            </Button>
          </div>
        </div>
      ) : (
        // File preview and upload
        <div className="space-y-4">
          {/* File info */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
            <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <Badge variant="secondary" className="text-xs">
                  {getFileExtension(selectedFile.name)?.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>

            {!isUploading && !uploadSuccess && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {uploadSuccess && (
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            )}
          </div>

          {/* Progress bar */}
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {uploadProgress < 90 ? 'Subiendo...' : 'Procesando documento...'}
              </p>
            </div>
          )}

          {/* Temporary checkbox */}
          {!isUploading && !uploadSuccess && (
            <div className="flex items-center gap-2">
              <Switch
                id="temporary"
                checked={isTemporary}
                onCheckedChange={setIsTemporary}
              />
              <Label htmlFor="temporary" className="text-sm cursor-pointer">
                Marcar como temporal (se puede eliminar después)
              </Label>
            </div>
          )}

          {/* Upload button */}
          {!uploadSuccess && (
            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir y procesar
                  </>
                )}
              </Button>

              {!isUploading && (
                <Button
                  variant="outline"
                  onClick={handleRemoveFile}
                >
                  Cancelar
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}