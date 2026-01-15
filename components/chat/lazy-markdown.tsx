"use client"

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import remarkGfm from 'remark-gfm'

// Lazy load react-markdown to reduce initial bundle size
// These are only needed for assistant messages, not user messages
const ReactMarkdown = dynamic(
  () => import('react-markdown').then(mod => mod.default),
  {
    loading: () => <div className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded h-4 w-full" />,
    ssr: false,
  }
)

interface LazyMarkdownProps {
  content: string
  className?: string
}

/**
 * Pre-process content to convert bare URLs to markdown links
 * Handles: kidney.org, www.kidney.org, https://kidney.org, etc.
 */
function preprocessUrls(content: string): string {
  // Pattern to match URLs that aren't already in markdown link format
  // Matches: http(s)://, www., or common domains
  const urlPattern = /(?<!\[.*?)(?<!\()\b((?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*))/gi

  return content.replace(urlPattern, (match, url) => {
    // Skip if it's already part of a markdown link [text](url) or already processed
    const beforeMatch = content.substring(0, content.indexOf(match))
    if (beforeMatch.endsWith('](') || beforeMatch.endsWith('href="')) {
      return match
    }

    // Add https:// if no protocol
    const fullUrl = url.startsWith('http') ? url : `https://${url}`

    // Return as markdown link
    return `[${url}](${fullUrl})`
  })
}

// Custom components for markdown rendering
// Note: Uses white text since chat is always on dark background
const markdownComponents = {
  h1: ({ node, ...props }: any) => (
    <h1 className="text-xl font-semibold text-white mt-6 mb-4 pb-3 border-b border-white/10" {...props} />
  ),
  h2: ({ node, ...props }: any) => (
    <h2 className="text-lg font-semibold text-white mt-6 mb-3 pb-2 border-b border-white/10" {...props} />
  ),
  h3: ({ node, ...props }: any) => (
    <h3 className="text-base font-semibold text-white mt-5 mb-2" {...props} />
  ),
  ul: ({ node, ...props }: any) => (
    <ul className="list-disc pl-6 space-y-1 [&>li]:marker:text-white/40" {...props} />
  ),
  ol: ({ node, ...props }: any) => (
    <ol className="list-decimal pl-6 space-y-1" {...props} />
  ),
  li: ({ node, children, ...props }: any) => (
    <li className="pl-1 text-white/80" {...props}>{children}</li>
  ),
  a: ({ node, href, children, ...props }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#E85A2C] hover:text-[#D14E22] underline font-medium"
      {...props}
    >
      {children}
    </a>
  ),
  p: ({ node, children, ...props }: any) => (
    <p className="text-white/80 my-2 leading-relaxed" {...props}>{children}</p>
  ),
  strong: ({ node, children, ...props }: any) => {
    const text = String(children)
    if (text.endsWith(':')) {
      return (
        <strong className="block mt-4 mb-2 text-white font-semibold" {...props}>
          {children}
        </strong>
      )
    }
    return (
      <strong className="text-white font-semibold" {...props}>
        {children}
      </strong>
    )
  },
}

export function LazyMarkdown({ content, className }: LazyMarkdownProps) {
  // Pre-process to convert bare URLs to clickable links
  const processedContent = preprocessUrls(content)

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[]}
        components={markdownComponents}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}

// Enhanced version with GFM support (tables, strikethrough, etc.)
// Use this when you need full GitHub Flavored Markdown
export function LazyMarkdownGfm({ content, className }: LazyMarkdownProps) {
  // Memoize URL preprocessing to avoid recalculation on re-renders
  const processedContent = useMemo(() => preprocessUrls(content), [content])

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}
