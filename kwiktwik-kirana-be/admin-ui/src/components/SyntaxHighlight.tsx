import type { HTMLAttributes } from 'react';
import { useMemo } from 'react';

interface SyntaxHighlightProps extends HTMLAttributes<HTMLPreElement> {
  data: any;
  isError?: boolean;
}

export function SyntaxHighlight({ data, isError, className = '', ...props }: SyntaxHighlightProps) {
  const html = useMemo(() => {
    let json = typeof data !== 'string' ? JSON.stringify(data, null, 2) : data;
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match: string) => {
        let cls = 'json-number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'json-key';
          } else {
            cls = 'json-string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  }, [data]);

  return (
    <pre 
      className={`${isError ? 'text-red-400' : 'text-gray-300'} text-xs font-mono break-all whitespace-pre-wrap ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
      {...props}
    />
  );
}
