'use client';

/**
 * DocumentUpload Component
 *
 * File upload with drag & drop functionality
 * Supports multiple files: PDF, CSV, XLSX, XLS
 */

import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { uploadDocuments } from '@/services/documents';
import { isSupportedDocumentType, getFileExtension, type UploadResult } from '@/types';
import { getErrorMessage } from '@/lib/api-client';

interface DocumentUploadProps {
  onUploadComplete?: () => void;
}

export function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [isTemporary, setIsTemporary] = useState(false);
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
    handleFilesSelection(files);
  }, []);

  // Validate and add files
  const handleFilesSelection = (files: File[]) => {
    const validFiles: File[] = [];
    let hasInvalidType = false;
    let hasOversized = false;

    files.forEach((file) => {
      // Validate file type
      if (!isSupportedDocumentType(file.name)) {
        hasInvalidType = true;
        return;
      }

      // Validate file size (50MB max)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        hasOversized = true;
        return;
      }

      // Check for duplicates
      const isDuplicate = selectedFiles.some(
        (existing) => existing.name === file.name && existing.size === file.size
      );
      if (!isDuplicate) {
        validFiles.push(file);
      }
    });

    if (hasInvalidType) {
      toast.error('Algunos archivos tienen tipo no soportado. Usa: PDF, CSV, XLSX, XLS');
    }
    if (hasOversized) {
      toast.error('Algunos archivos son demasiado grandes. Máximo: 50MB');
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      setUploadResults([]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFilesSelection(Array.from(files));
    }
  };

  // Open file picker
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Remove a specific file
  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadResults((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear all files
  const handleClearAll = () => {
    setSelectedFiles([]);
    setUploadResults([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload all files
  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);

    // Initialize results
    const initialResults: UploadResult[] = selectedFiles.map((file, index) => ({
      file,
      fileId: `${file.name}-${Date.now()}-${index}`,
      status: 'pending',
      progress: 0,
    }));
    setUploadResults(initialResults);

    try {
      const results = await uploadDocuments({
        files: selectedFiles,
        isTemporary,
        onProgress: (fileId, progress) => {
          setUploadResults((prev) =>
            prev.map((r) =>
              r.fileId === fileId
                ? { ...r, status: 'uploading' as const, progress }
                : r
            )
          );
        },
      });

      // Update with final results
      setUploadResults(results.results);

      // Show summary toast
      if (results.successCount === results.totalCount) {
        toast.success(
          `${results.successCount} documento${results.successCount > 1 ? 's' : ''} procesado${results.successCount > 1 ? 's' : ''} exitosamente`
        );
      } else if (results.successCount > 0) {
        toast.warning(
          `${results.successCount} exitoso${results.successCount > 1 ? 's' : ''}, ${results.errorCount} fallido${results.errorCount > 1 ? 's' : ''}`
        );
      } else {
        toast.error('No se pudo procesar ningún documento');
      }

      // Notify parent to refresh list
      if (results.successCount > 0) {
        onUploadComplete?.();
      }

      // Auto-clear successful uploads after delay
      setTimeout(() => {
        setUploadResults((prev) => prev.filter((r) => r.status !== 'success'));
        setSelectedFiles((prev) =>
          prev.filter((file) =>
            results.results.some(
              (r) => r.file.name === file.name && r.status !== 'success'
            )
          )
        );
      }, 3000);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Get status icon
  const getStatusIcon = (result: UploadResult) => {
    switch (result.status) {
      case 'uploading':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin shrink-0" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />;
      default:
        return null;
    }
  };

  const hasFiles = selectedFiles.length > 0;
  const hasResults = uploadResults.length > 0;

  return (
    <Card className="p-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.csv,.xlsx,.xls"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {!hasFiles ? (
        // Upload area (empty state)
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
                {isDragging ? 'Suelta los archivos aquí' : 'Arrastra archivos o haz clic para seleccionar'}
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, CSV, XLSX, XLS (máx. 50MB por archivo)
              </p>
            </div>

            <Button variant="secondary" size="sm" type="button">
              Seleccionar archivos
            </Button>
          </div>
        </div>
      ) : (
        // Files list and upload
        <div className="space-y-4">
          {/* Header with file count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm font-medium">
                {selectedFiles.length} archivo{selectedFiles.length > 1 ? 's' : ''} seleccionado{selectedFiles.length > 1 ? 's' : ''}
              </p>
            </div>
            {!isUploading && (
              <Button variant="ghost" size="sm" onClick={handleClearAll}>
                Limpiar todo
              </Button>
            )}
          </div>

          {/* Files list */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {selectedFiles.map((file, index) => {
              const result = hasResults ? uploadResults[index] : null;

              return (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted"
                >
                  <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {getFileExtension(file.name)?.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>

                    {/* Progress bar for this file */}
                    {result && result.status === 'uploading' && (
                      <Progress value={result.progress} className="h-1.5 mt-2" />
                    )}

                    {/* Error message */}
                    {result && result.status === 'error' && (
                      <p className="text-xs text-red-600 mt-1">{result.error}</p>
                    )}

                    {/* Success message */}
                    {result && result.status === 'success' && result.document && (
                      <p className="text-xs text-green-600 mt-1">
                        {result.document.chunkCount} fragmentos creados
                      </p>
                    )}
                  </div>

                  {/* Status icon or remove button */}
                  {result ? (
                    getStatusIcon(result)
                  ) : (
                    !isUploading && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFile(index)}
                        className="shrink-0 h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )
                  )}
                </div>
              );
            })}
          </div>

          {/* Add more files button */}
          {!isUploading && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBrowseClick}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              Agregar más archivos
            </Button>
          )}

          {/* Temporary checkbox */}
          {!isUploading && (
            <div className="flex items-center gap-2">
              <Switch
                id="temporary"
                checked={isTemporary}
                onCheckedChange={setIsTemporary}
              />
              <Label htmlFor="temporary" className="text-sm cursor-pointer">
                Marcar como temporales (se pueden eliminar después)
              </Label>
            </div>
          )}

          {/* Upload button */}
          <div className="flex gap-2">
            <Button
              onClick={handleUploadAll}
              disabled={isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando {selectedFiles.length} archivo{selectedFiles.length > 1 ? 's' : ''}...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Subir y procesar todo
                </>
              )}
            </Button>

            {!isUploading && (
              <Button variant="outline" onClick={handleClearAll}>
                Cancelar
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
