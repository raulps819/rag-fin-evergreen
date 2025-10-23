/**
 * MessageSources Component
 *
 * Displays document sources/references for assistant messages
 */

import { DocumentSource } from '@/types';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface MessageSourcesProps {
  sources: DocumentSource[];
}

export function MessageSources({ sources }: MessageSourcesProps) {
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) {
    return null;
  }

  // Show only first 2 sources by default
  const visibleSources = expanded ? sources : sources.slice(0, 2);
  const hasMore = sources.length > 2;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <FileText className="h-3 w-3" />
        <span className="font-medium">
          Fuentes ({sources.length} {sources.length === 1 ? 'documento' : 'documentos'})
        </span>
      </div>

      <div className="space-y-2">
        {visibleSources.map((source, index) => (
          <SourceCard key={`${source.document_id}-${source.chunk_index}`} source={source} index={index} />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Mostrar menos
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              Ver {sources.length - 2} más
            </>
          )}
        </button>
      )}
    </div>
  );
}

interface SourceCardProps {
  source: DocumentSource;
  index: number;
}

function SourceCard({ source, index }: SourceCardProps) {
  const [showFullContent, setShowFullContent] = useState(false);

  // Truncate content for preview
  const previewLength = 150;
  const contentPreview = source.content.length > previewLength
    ? source.content.slice(0, previewLength) + '...'
    : source.content;

  // Format relevance score as percentage
  const relevancePercent = source.relevance_score
    ? Math.round(source.relevance_score * 100)
    : null;

  return (
    <Card className="p-3 border-l-2 border-l-primary/50">
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Badge variant="secondary" className="text-xs shrink-0">
              {index + 1}
            </Badge>
            <span className="text-sm font-medium truncate" title={source.filename}>
              {source.filename}
            </span>
          </div>

          {relevancePercent !== null && (
            <Badge variant="outline" className="text-xs shrink-0">
              {relevancePercent}%
            </Badge>
          )}
        </div>

        {/* Content preview */}
        <div className="text-xs text-muted-foreground">
          <p className="leading-relaxed">
            {showFullContent ? source.content : contentPreview}
          </p>

          {source.content.length > previewLength && (
            <button
              onClick={() => setShowFullContent(!showFullContent)}
              className="mt-1 text-primary hover:underline"
            >
              {showFullContent ? 'Ver menos' : 'Ver más'}
            </button>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Fragmento #{source.chunk_index + 1}</span>
        </div>
      </div>
    </Card>
  );
}