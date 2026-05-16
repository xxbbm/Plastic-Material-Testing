'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Home, Plus, X, Image, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageType } from '@/app/page'
import { PhotoLogEntry } from '@/lib/types'
import { getPhotoLogs, addPhotoLog, deletePhotoLog } from '@/lib/storage'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE = 200 * 1024 // 200KB

interface PhotoLogProps {
  onNavigate: (page: PageType) => void
}

export function PhotoLog({ onNavigate }: PhotoLogProps) {
  const [photos, setPhotos] = useState<PhotoLogEntry[]>([])
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [note, setNote] = useState('')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setPhotos(getPhotoLogs())
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      toast.error('图片大小不能超过 200KB')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result as string)
      setPreviewFile(file)
      setNote('')
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!previewUrl) return

    const entry: PhotoLogEntry = {
      id: crypto.randomUUID(),
      imageData: previewUrl,
      note,
      timestamp: Date.now(),
    }

    addPhotoLog(entry)
    setPhotos(getPhotoLogs())
    setPreviewUrl(null)
    setPreviewFile(null)
    setNote('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    toast.success('已保存')
  }

  const handleCancel = () => {
    setPreviewUrl(null)
    setPreviewFile(null)
    setNote('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = (id: string) => {
    deletePhotoLog(id)
    setPhotos(getPhotoLogs())
    toast.success('已删除')
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const formatDate = (ts: number) => {
    return new Intl.DateTimeFormat('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(ts))
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-[#27272A]">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-[#10B981]" />
          <h1 className="text-lg font-bold">拍照存样</h1>
        </div>
        <button
          onClick={() => onNavigate('dashboard')}
          className="p-2 rounded-lg bg-[#1A1A1D] hover:bg-[#27272A] transition-colors duration-250 active:scale-95"
        >
          <Home className="w-5 h-5" />
        </button>
      </header>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Preview card */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pt-4">
              <div className="p-3 rounded-xl bg-[#111113] border border-[#27272A]">
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <img
                      src={previewUrl}
                      alt="预览"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <button
                      onClick={handleCancel}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#EF4444] flex items-center justify-center hover:bg-[#EF4444]/80 transition-colors"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      placeholder="添加备注（材质、来源等）"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0A0A0B] border border-[#27272A] text-sm placeholder:text-[#52525B] focus:outline-none focus:border-[#10B981]/50 transition-colors"
                    />
                    <button
                      onClick={handleSave}
                      className="mt-2 w-full py-2 rounded-lg bg-[#10B981] hover:bg-[#10B981]/90 text-[#0A0A0B] text-sm font-medium transition-all duration-250 active:scale-95"
                    >
                      保存照片
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        {photos.length > 0 || previewUrl ? (
          <div className="grid grid-cols-2 gap-3">
            {/* Upload button */}
            <button
              onClick={triggerFileInput}
              className="aspect-square rounded-xl border border-dashed border-[#27272A] hover:border-[#3F3F46] bg-[#111113] flex flex-col items-center justify-center gap-2 transition-colors duration-250 active:scale-95"
            >
              <Plus className="w-8 h-8 text-[#52525B]" />
              <span className="text-xs text-[#52525B]">拍摄/上传</span>
            </button>

            {/* Photo cards */}
            {photos.map((photo) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-square rounded-xl overflow-hidden bg-[#111113] border border-[#27272A] group"
                onMouseEnter={() => setHoveredId(photo.id)}
                onMouseLeave={() => setHoveredId(null)}
                onTouchStart={() =>
                  setHoveredId(hoveredId === photo.id ? null : photo.id)
                }
              >
                <img
                  src={photo.imageData}
                  alt={photo.note || '样品照片'}
                  className="w-full h-full object-cover"
                />
                {/* Delete button on hover */}
                <AnimatePresence>
                  {hoveredId === photo.id && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => handleDelete(photo.id)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-[#EF4444]/80 hover:bg-[#EF4444] flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </motion.button>
                  )}
                </AnimatePresence>
                {/* Note overlay */}
                {photo.note && (
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-xs text-white/90 truncate">{photo.note}</p>
                    <p className="text-[10px] text-white/50 mt-0.5">
                      {formatDate(photo.timestamp)}
                    </p>
                  </div>
                )}
                {!photo.note && (
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-[10px] text-white/50">
                      {formatDate(photo.timestamp)}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Image className="w-12 h-12 text-[#27272A] mx-auto mb-3" />
            <p className="text-[#52525B]">暂无拍照记录</p>
          </div>
        )}
      </div>
    </div>
  )
}
