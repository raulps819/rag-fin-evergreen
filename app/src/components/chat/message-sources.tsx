/**
 * MessageSources Component
 *
 * Displays document sources/references for assistant messages in a compact inline format
 */

import { DocumentSource } from '@/types';
import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRef, useEffect } from 'react';

interface MessageSourcesProps {
  sources: DocumentSource[];
}

export function MessageSources({ sources }: MessageSourcesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleWheel = (e: WheelEvent) => {
      // Only handle horizontal scroll when there's overflow
      if (scrollContainer.scrollWidth > scrollContainer.clientWidth) {
        e.preventDefault();
        scrollContainer.scrollLeft += e.deltaY;
      }
    };

    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      scrollContainer.removeEventListener('wheel', handleWheel);
    };
  }, []);

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 flex items-center gap-2">
      {/* Document icon with count */}
      <div className="flex items-center gap-1.5 shrink-0">
        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">
          {sources.length}
        </span>
      </div>

      {/* Inline sources with horizontal scroll (hidden scrollbar) */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {sources.map((source, index) => (
          <SourceBadge
            key={`${source.document_id}-${source.chunk_index}`}
            source={source}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

interface SourceBadgeProps {
  source: DocumentSource;
  index: number;
}

function SourceBadge({ source, index }: SourceBadgeProps) {
  // Format relevance score as percentage
  const relevancePercent = source.relevance_score
    ? Math.round(source.relevance_score * 100)
    : null;

  return (
    <Badge
      variant="secondary"
      className="shrink-0 px-3 py-1.5 text-xs font-normal flex items-center gap-1.5 hover:bg-secondary/80 transition-colors"
    >
      {/* Source number */}
      <span className="font-semibold text-primary">{index + 1}</span>

      {/* Filename */}
      <span className="truncate max-w-[150px]" title={source.filename}>
        {source.filename}
      </span>

      {/* Separator */}
      <span className="text-muted-foreground">·</span>

      {/* Chunk index */}
      <span className="text-muted-foreground">
        Frag. #{source.chunk_index + 1}
      </span>

      {/* Relevance score */}
      {relevancePercent !== null && (
        <>
          <span className="text-muted-foreground">·</span>
          <span className="font-medium text-primary">
            {relevancePercent}%
          </span>
        </>
      )}
    </Badge>
  );
}