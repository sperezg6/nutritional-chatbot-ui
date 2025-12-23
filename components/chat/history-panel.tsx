"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { X, MessageSquare, Trash2, Edit2, Plus, Search, Inbox, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAllConversations, deleteConversation, updateConversationTitle, updateConversationTitleInDB, type Conversation } from "@/lib/session"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/components/ui/toast"

// Re-export Conversation type for backward compatibility
export type { Conversation }

interface HistoryPanelProps {
  isOpen: boolean
  onClose: () => void
  conversations?: Conversation[]
  currentConversationId?: string
  onSelectConversation?: (id: string) => void
  onDeleteConversation?: (id: string) => void
  onNewChat?: () => void
}

export function HistoryPanel({
  isOpen,
  onClose,
  currentConversationId,
}: HistoryPanelProps) {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [savingId, setSavingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null })
  const { showToast } = useToast()

  // Filter and group conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations
    const query = searchQuery.toLowerCase()
    return conversations.filter(c =>
      c.title.toLowerCase().includes(query) ||
      c.preview?.toLowerCase().includes(query)
    )
  }, [conversations, searchQuery])

  // Group conversations by date
  const groupedConversations = useMemo(() => {
    const groups: { [key: string]: Conversation[] } = {
      "Hoy": [],
      "Ayer": [],
      "Esta semana": [],
      "Más antiguas": [],
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 86400000)
    const weekAgo = new Date(today.getTime() - 7 * 86400000)

    filteredConversations.forEach(conv => {
      const convDate = new Date(conv.timestamp)
      if (convDate >= today) {
        groups["Hoy"].push(conv)
      } else if (convDate >= yesterday) {
        groups["Ayer"].push(conv)
      } else if (convDate >= weekAgo) {
        groups["Esta semana"].push(conv)
      } else {
        groups["Más antiguas"].push(conv)
      }
    })

    return groups
  }, [filteredConversations])

  // Load conversations from localStorage
  useEffect(() => {
    if (isOpen) {
      setConversations(getAllConversations())
    }
  }, [isOpen])

  const handleSelectConversation = (id: string) => {
    router.push(`/chat/${id}`)
    onClose()
  }

  const handleNewChat = () => {
    router.push("/")
    onClose()
  }

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ isOpen: true, id })
  }

  const handleDeleteConfirm = () => {
    if (deleteConfirm.id) {
      deleteConversation(deleteConfirm.id)
      setConversations(getAllConversations())
      showToast("Conversación eliminada", "success")
    }
    setDeleteConfirm({ isOpen: false, id: null })
  }

  const handleEditStart = (conversation: Conversation) => {
    setEditingId(conversation.id)
    setEditTitle(conversation.title)
  }

  const handleEditSave = async (id: string) => {
    const trimmedTitle = editTitle.trim()
    if (!trimmedTitle) {
      setEditingId(null)
      return
    }

    // Update localStorage immediately for instant UI feedback
    updateConversationTitle(id, trimmedTitle)
    setConversations(getAllConversations())
    setEditingId(null)
    setSavingId(id)

    // Sync with database
    const result = await updateConversationTitleInDB(id, trimmedTitle)
    setSavingId(null)

    if (result.success) {
      showToast("Título actualizado", "success")
    } else {
      showToast("Error al guardar en el servidor", "error")
    }
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditTitle("")
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-80 max-w-[90vw] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-b border-gray-100 dark:border-gray-800 px-6 py-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Historial de chats</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Cerrar historial"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* New Chat Button */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-medical-500 hover:bg-medical-600 text-white font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Plus className="w-5 h-5" />
                Nuevo chat
              </button>
            </div>

            {/* Search */}
            {conversations.length > 0 && (
              <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar conversaciones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>
              </div>
            )}

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {conversations.length === 0 ? (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                  <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">No hay conversaciones aún</p>
                  <p className="text-xs mt-1">Inicia una nueva conversación</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                  <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">Sin resultados</p>
                  <p className="text-xs mt-1">Prueba con otra búsqueda</p>
                </div>
              ) : (
                Object.entries(groupedConversations).map(([group, convs]) =>
                  convs.length > 0 && (
                    <div key={group} className="mb-4">
                      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-2">
                        {group}
                      </h3>
                      {convs.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "group relative px-4 py-4 rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer mb-2",
                      currentConversationId === conversation.id
                        ? "bg-medical-50 dark:bg-medical-900/30 border-l-4 border-l-medical-500 shadow-sm"
                        : "hover:shadow-sm"
                    )}
                    onClick={() => handleSelectConversation(conversation.id)}
                  >
                    <div className="flex items-start gap-3">
                      <MessageSquare className={cn(
                        "w-5 h-5 flex-shrink-0 mt-0.5",
                        currentConversationId === conversation.id
                          ? "text-medical-600 dark:text-medical-400"
                          : "text-gray-400 dark:text-gray-500"
                      )} />
                      <div className="flex-1 min-w-0 pr-16">
                        {editingId === conversation.id ? (
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleEditSave(conversation.id)
                              } else if (e.key === 'Escape') {
                                handleEditCancel()
                              }
                            }}
                            onBlur={() => handleEditSave(conversation.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-2 py-1 text-sm border border-medical-300 dark:border-medical-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-500"
                            autoFocus
                          />
                        ) : (
                          <div className="font-semibold text-gray-800 dark:text-gray-100 text-base leading-tight flex items-center gap-2">
                            {conversation.title}
                            {savingId === conversation.id && (
                              <Loader2 className="w-3 h-3 animate-spin text-medical-500" />
                            )}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {formatTimestamp(conversation.timestamp)}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditStart(conversation)
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/80 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Renombrar conversación"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteClick(conversation.id)
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        aria-label="Eliminar conversación"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                      </motion.div>
                      ))}
                    </div>
                  )
                )
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 text-center">
              {conversations.length} {conversations.length !== 1 ? "conversaciones" : "conversación"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar conversación?"
        description="Esta acción no se puede deshacer. La conversación será eliminada permanentemente."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </>
  )
}

function formatTimestamp(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Justo ahora"
  if (diffMins < 60) return `hace ${diffMins}m`
  if (diffHours < 24) return `hace ${diffHours}h`
  if (diffDays < 7) return `hace ${diffDays}d`

  return date.toLocaleDateString([], { month: "short", day: "numeric" })
}
