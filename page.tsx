'use client'

import { useState, useCallback, useEffect } from 'react'
import { Upload, FileText, X, Download, ArrowRight, Sparkles, Shield, Zap, Moon, Sun, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

interface PDFFile {
  id: string
  file: File
  name: string
  size: string
}

export default function Home() {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isMerging, setIsMerging] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const validFiles = files.filter(file => file.type === 'application/pdf')
    
    if (validFiles.length === 0) {
      toast.error('Please drop PDF files only')
      return
    }

    const newFiles: PDFFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: formatFileSize(file.size)
    }))

    setPdfFiles(prev => [...prev, ...newFiles])
    toast.success(`Added ${validFiles.length} file${validFiles.length > 1 ? 's' : ''}`)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => file.type === 'application/pdf')
    
    if (validFiles.length === 0) {
      toast.error('Please select PDF files only')
      return
    }

    const newFiles: PDFFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: formatFileSize(file.size)
    }))

    setPdfFiles(prev => [...prev, ...newFiles])
    toast.success(`Added ${validFiles.length} file${validFiles.length > 1 ? 's' : ''}`)
    
    // Reset input
    e.target.value = ''
  }, [])

  const removeFile = useCallback((id: string) => {
    setPdfFiles(prev => prev.filter(f => f.id !== id))
    toast.success('File removed')
  }, [])

  const clearAllFiles = useCallback(() => {
    setPdfFiles([])
    toast.success('All files cleared')
  }, [])

  const handleMerge = async () => {
    if (pdfFiles.length < 2) {
      toast.error('Please add at least 2 PDF files to merge')
      return
    }

    setIsMerging(true)
    
    try {
      const formData = new FormData()
      pdfFiles.forEach(pdfFile => {
        formData.append('files', pdfFile.file)
      })

      const response = await fetch('/api/merge-pdf', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to merge PDFs')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `merged-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('PDFs merged successfully!')
      setPdfFiles([])
    } catch (error) {
      console.error('Merge error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to merge PDFs')
    } finally {
      setIsMerging(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 via-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                PDF Merge Pro
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Premium PDF Tools</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Hero Section */}
        <div className="text-center mb-12 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-rose-100 dark:from-purple-900/30 dark:to-rose-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Fast • Secure • Free</span>
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
          >
            Merge Your PDFs with
            <br />
            <span className="bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Stunning Simplicity
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8"
          >
            Drag and drop your PDF files to merge them instantly. No signup required, no limits.
          </motion.p>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-12"
        >
          <Card className="p-6 border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Lightning Fast</h3>
            <p className="text-slate-600 dark:text-slate-400">Merge your PDFs in seconds with our optimized engine</p>
          </Card>

          <Card className="p-6 border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-rose-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Secure & Private</h3>
            <p className="text-slate-600 dark:text-slate-400">Your files are processed locally and never stored</p>
          </Card>

          <Card className="p-6 border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Premium Quality</h3>
            <p className="text-slate-600 dark:text-slate-400">Maintain original quality with zero compression</p>
          </Card>
        </motion.div>

        {/* Drop Zone */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <Card
            className={`relative overflow-hidden border-2 border-dashed transition-all duration-300 ${
              isDragging
                ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 scale-[1.02]'
                : 'border-slate-300 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-600 bg-white/50 dark:bg-slate-900/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              type="file"
              id="file-input"
              className="hidden"
              accept="application/pdf"
              multiple
              onChange={handleFileInput}
            />
            
            <div className="p-12 lg:p-16 text-center">
              <motion.div
                animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center transition-colors ${
                  isDragging
                    ? 'bg-purple-500'
                    : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700'
                }`}>
                  <Upload className={`w-10 h-10 ${isDragging ? 'text-white' : 'text-slate-400'}`} />
                </div>
              </motion.div>
              
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                {isDragging ? 'Drop your PDFs here' : 'Drag & Drop PDF Files Here'}
              </h3>
              
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                or click to browse your files
              </p>
              
              <Button
                size="lg"
                onClick={() => document.getElementById('file-input')?.click()}
                className="bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 hover:from-rose-600 hover:via-purple-600 hover:to-indigo-600 text-white px-8 shadow-lg shadow-purple-500/25"
              >
                Select PDF Files
              </Button>
              
              <p className="mt-4 text-xs text-slate-400">
                Maximum file size: 10MB per file
              </p>
            </div>
          </Card>

          {/* File List */}
          <AnimatePresence>
            {pdfFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mt-8"
              >
                <Card className="p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-800/50">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {pdfFiles.length} File{pdfFiles.length > 1 ? 's' : ''} Selected
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Ready to merge
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFiles}
                        className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All
                      </Button>
                      
                      <Button
                        onClick={handleMerge}
                        disabled={isMerging || pdfFiles.length < 2}
                        className="bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 hover:from-rose-600 hover:via-purple-600 hover:to-indigo-600 text-white shadow-lg shadow-purple-500/25"
                      >
                        {isMerging ? (
                          <>
                            <motion.div
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                            Merging...
                          </>
                        ) : (
                          <>
                            Merge PDFs
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {pdfFiles.map((pdfFile, index) => (
                      <motion.div
                        key={pdfFile.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 group hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-purple-100 dark:from-rose-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white truncate">
                            {pdfFile.name}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {pdfFile.size}
                          </p>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(pdfFile.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900/30"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                  
                  {pdfFiles.length > 0 && pdfFiles.length < 2 && (
                    <p className="mt-4 text-sm text-amber-600 dark:text-amber-400 text-center">
                      ⚠️ Add at least 2 PDF files to merge
                    </p>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-purple-100 via-rose-100 to-indigo-100 dark:from-purple-950/30 dark:via-rose-950/30 dark:to-indigo-950/30 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Ready to Merge?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Start by dragging your PDF files above
            </p>
            <Button
              onClick={() => document.getElementById('file-input')?.click()}
              className="bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 hover:from-rose-600 hover:via-purple-600 hover:to-indigo-600 text-white px-8 shadow-lg shadow-purple-500/25"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload PDF Files
            </Button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © 2025 PDF Merge Pro. Built with ❤️ for everyone.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Secure • Private • Fast
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
