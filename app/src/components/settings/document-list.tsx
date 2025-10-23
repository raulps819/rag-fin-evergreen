'use client';

/**
 * DocumentList Component
 *
 * Displays list of uploaded documents with metadata
 */

import { useState, useEffect, useCallback } from 'react';
import { FileText, Calendar, Layers, Trash2, RefreshCw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { listDocuments, deleteDocument } from '@/services/documents';
import { Document } from '@/types';
import { getErrorMessage } from '@/lib/api-client';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load documents
  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const docs = await listDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Handle delete
  const handleDeleteClick = (document: Document) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    setIsDeleting(true);
    try {
      await deleteDocument(documentToDelete.id);
      toast.success(`Documento "${documentToDelete.filename}" eliminado`);

      // Refresh list
      await loadDocuments();
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date
  const formatDate = (date: Date): string => {
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  };

  // Get file type color
  const getFileTypeColor = (fileType: string): string => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'csv':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'xlsx':
      case 'xls':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Empty state
  if (!isLoading && documents.length === 0) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-4 rounded-full bg-muted">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">No hay documentos</p>
            <p className="text-sm text-muted-foreground">
              Sube tu primer documento para comenzar a usar el asistente.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="p-4 flex items-center justify-between border-b">
          <div className="space-y-1">
            <h3 className="font-semibold">Documentos Indexados</h3>
            <p className="text-sm text-muted-foreground">
              {documents.length} {documents.length === 1 ? 'documento' : 'documentos'} en la base de conocimiento
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadDocuments}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fragmentos</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[40px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    {/* Filename */}
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[300px]" title={doc.filename}>
                          {doc.filename}
                        </span>
                      </div>
                    </TableCell>

                    {/* File Type */}
                    <TableCell>
                      <Badge variant="secondary" className={getFileTypeColor(doc.fileType)}>
                        {doc.fileType.toUpperCase()}
                      </Badge>
                    </TableCell>

                    {/* Chunk Count */}
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Layers className="h-3 w-3" />
                        {doc.chunkCount}
                      </div>
                    </TableCell>

                    {/* Upload Date */}
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(doc.uploadDate)}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {doc.isTemporary ? (
                        <Badge variant="outline">Temporal</Badge>
                      ) : (
                        <Badge variant="secondary">Permanente</Badge>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(doc)}
                        title="Eliminar documento"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente "{documentToDelete?.filename}" y todos sus fragmentos
              de la base de conocimiento. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}