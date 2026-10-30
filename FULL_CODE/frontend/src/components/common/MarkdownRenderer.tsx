import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Lightweight, safe Markdown renderer for LifeWise AI & advisory messages.
 * Handles headings (###, ##, #), bold (**text**), italic (*text*), bullet lists (- or *), 
 * inline code (`code`), numbered lists (1.), and clean paragraph breaks without raw HTML risks.
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split content by lines
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: React.ReactNode[] } | null = null;

  const renderInline = (text: string): React.ReactNode => {
    // Tokenize text for bold (**), inline code (`), and italic (*)
    // Regex splits on tokens while preserving delimiters
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return <strong key={index} className="font-semibold text-inherit">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code key={index} className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-[11px] text-amber-700 dark:text-amber-400">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2 && !part.startsWith('**')) {
        return <em key={index} className="italic text-inherit">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  const flushList = () => {
    if (currentList) {
      if (currentList.type === 'ul') {
        elements.push(
          <ul key={`ul-${elements.length}`} className="my-1.5 ml-4 space-y-1 list-disc list-outside">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="leading-relaxed">{item}</li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`ol-${elements.length}`} className="my-1.5 ml-4 space-y-1 list-decimal list-outside">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="leading-relaxed">{item}</li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  lines.forEach((rawLine, lineIdx) => {
    const line = rawLine.trim();

    // Empty line creates breathing room
    if (!line) {
      flushList();
      return;
    }

    // Headings
    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={`h3-${lineIdx}`} className="text-xs font-bold tracking-wide uppercase text-slate-800 dark:text-slate-100 mt-2.5 mb-1">
          {renderInline(line.substring(4))}
        </h4>
      );
      return;
    }
    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={`h2-${lineIdx}`} className="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-1.5">
          {renderInline(line.substring(3))}
        </h3>
      );
      return;
    }
    if (line.startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={`h1-${lineIdx}`} className="text-base font-bold text-slate-900 dark:text-white mt-3 mb-2">
          {renderInline(line.substring(2))}
        </h2>
      );
      return;
    }

    // Unordered bullet list items (- or *)
    const bulletMatch = line.match(/^[-*]\s+(.*)/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(renderInline(bulletMatch[1]));
      return;
    }

    // Ordered numbered list items (1., 2., etc.)
    const numberedMatch = line.match(/^\d+\.\s+(.*)/);
    if (numberedMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(renderInline(numberedMatch[1]));
      return;
    }

    // Regular paragraph line
    flushList();
    elements.push(
      <p key={`p-${lineIdx}`} className="my-1 leading-relaxed">
        {renderInline(line)}
      </p>
    );
  });

  flushList();

  return <div className={`markdown-content space-y-1 ${className}`}>{elements}</div>;
};
