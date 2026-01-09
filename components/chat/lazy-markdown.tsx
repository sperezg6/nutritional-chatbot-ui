"use client"

import dynamic from 'next/dynamic'
import { ComponentProps } from 'react'

// Lazy load react-markdown and remark-gfm to reduce initial bundle size
// These are only needed for assistant messages, not user messages
const ReactMarkdown = dynamic(
  () => import('react-markdown').then(mod => mod.default),
  {
    loading: () => <div className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded h-4 w-full" />,
    ssr: false,
  }
)

// Lazy load remark-gfm plugin
let remarkGfmPlugin: any = null
const getRemarkGfm = async () => {
  if (!remarkGfmPlugin) {
    const mod = await import('remark-gfm')
    remarkGfmPlugin = mod.default
  }
  return remarkGfmPlugin
}

interface LazyMarkdownProps {
  content: string
  className?: string
}

// Custom components for markdown rendering
const markdownComponents = {
  h1: ({ node, ...props }: any) => (
    <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-6 pb-3 border-b-2 border-gray-300 dark:border-gray-600" {...props} />
  ),
  h2: ({ node, ...props }: any) => (
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700" {...props} />
  ),
  h3: ({ node, ...props }: any) => (
    <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-6 mb-3" {...props} />
  ),
  ul: ({ node, ...props }: any) => (
    <ul className="list-disc pl-6 space-y-1" {...props} />
  ),
  ol: ({ node, ...props }: any) => (
    <ol className="list-decimal pl-6 space-y-1" {...props} />
  ),
  a: ({ node, href, children, ...props }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-medical-600 hover:text-medical-700 underline font-medium"
      {...props}
    >
      {children}
    </a>
  ),
  strong: ({ node, children, ...props }: any) => {
    const text = String(children)
    if (text.endsWith(':')) {
      return (
        <strong className="block mt-4 mb-2 text-gray-900 dark:text-white font-semibold" {...props}>
          {children}
        </strong>
      )
    }
    return (
      <strong className="text-gray-900 dark:text-white font-semibold" {...props}>
        {children}
      </strong>
    )
  },
}

export function LazyMarkdown({ content, className }: LazyMarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

// Enhanced version with GFM support (tables, strikethrough, etc.)
// Use this when you need full GitHub Flavored Markdown
import { useState, useEffect } from 'react'

export function LazyMarkdownGfm({ content, className }: LazyMarkdownProps) {
  const [gfmPlugin, setGfmPlugin] = useState<any>(null)

  useEffect(() => {
    getRemarkGfm().then(setGfmPlugin)
  }, [])

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={gfmPlugin ? [gfmPlugin] : []}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
