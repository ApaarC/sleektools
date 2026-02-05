import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css'
import imageCompression from 'browser-image-compression'
import {
  Crop,
  Upload,
  Download,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Trash2,
  Image as ImageIcon,
  Check,
  Loader2,
  ZoomIn,
  ZoomOut,
  RefreshCw
} from 'lucide-react'
import { Button, Card, Badge } from '@/components'
import { useImageStore } from '@/store'
import config from './config'

export default function ImageCrop() {
  const {
    originalImage,
    croppedImage,
    aspectRatio,
    quality,
    setOriginalImage,
    setCroppedImage,
    setAspectRatio,
    setQuality,
    clear
  } = useImageStore()

  const [isProcessing, setIsProcessing] = useState(false)
  const [originalSize, setOriginalSize] = useState(0)
  const [croppedSize, setCroppedSize] = useState(0)
  const cropperRef = useRef(null)

  // Handle file drop
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    setOriginalSize(file.size)
    const reader = new FileReader()
    reader.onload = () => {
      setOriginalImage(reader.result)
      setCroppedImage(null)
    }
    reader.readAsDataURL(file)
  }, [setOriginalImage, setCroppedImage])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxSize: config.settings.maxFileSize,
    multiple: false
  })

  // Crop and compress image
  const handleCrop = useCallback(async () => {
    const cropper = cropperRef.current?.cropper
    if (!cropper) return

    setIsProcessing(true)

    try {
      // Get cropped canvas
      const canvas = cropper.getCroppedCanvas({
        maxWidth: 4096,
        maxHeight: 4096,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      })

      // Convert to blob
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', quality)
      })

      // Compress if needed
      const compressedBlob = await imageCompression(blob, {
        maxSizeMB: 2,
        maxWidthOrHeight: 4096,
        useWebWorker: true,
        initialQuality: quality
      })

      setCroppedSize(compressedBlob.size)

      // Create data URL for preview
      const reader = new FileReader()
      reader.onload = () => {
        setCroppedImage(reader.result)
      }
      reader.readAsDataURL(compressedBlob)
    } catch (error) {
      console.error('Error processing image:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [quality, setCroppedImage])

  // Download cropped image
  const handleDownload = useCallback(() => {
    if (!croppedImage) return

    const link = document.createElement('a')
    link.href = croppedImage
    link.download = `cropped-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [croppedImage])

  // Rotate image
  const handleRotate = useCallback(() => {
    cropperRef.current?.cropper.rotate(90)
  }, [])

  // Flip horizontal
  const handleFlipH = useCallback(() => {
    const cropper = cropperRef.current?.cropper
    const data = cropper.getData()
    cropper.scaleX(data.scaleX === -1 ? 1 : -1)
  }, [])

  // Flip vertical
  const handleFlipV = useCallback(() => {
    const cropper = cropperRef.current?.cropper
    const data = cropper.getData()
    cropper.scaleY(data.scaleY === -1 ? 1 : -1)
  }, [])

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    cropperRef.current?.cropper.zoom(0.1)
  }, [])

  const handleZoomOut = useCallback(() => {
    cropperRef.current?.cropper.zoom(-0.1)
  }, [])

  // Reset crop
  const handleReset = useCallback(() => {
    cropperRef.current?.cropper.reset()
  }, [])

  // Format file size
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  // Calculate compression ratio
  const compressionRatio = originalSize && croppedSize
    ? Math.round((1 - croppedSize / originalSize) * 100)
    : 0

  return (
    <div className="tool-page">
      {/* Header */}
      <div className="tool-header">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 
                      flex items-center justify-center">
          <Crop className="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <h1 className="tool-title">Image Crop & Compress</h1>
          <p className="tool-description">Crop, resize, and compress images instantly</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Drop Zone or Cropper */}
          <AnimatePresence mode="wait">
            {!originalImage ? (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div
                  {...getRootProps()}
                  className={`
                    glass-card p-12 min-h-[400px] flex flex-col items-center justify-center
                    cursor-pointer transition-all duration-300 border-2 border-dashed
                    ${isDragActive 
                      ? 'border-primary-500 bg-primary-500/10' 
                      : 'border-dark-600 hover:border-primary-500/50'
                    }
                  `}
                >
                  <input {...getInputProps()} />
                  <motion.div
                    animate={{ y: isDragActive ? -10 : 0 }}
                    className="text-center"
                  >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br 
                                  from-primary-500/20 to-purple-500/20 
                                  flex items-center justify-center">
                      <Upload className="w-10 h-10 text-primary-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-dark-200 mb-2">
                      {isDragActive ? 'Drop your image here' : 'Drag & drop an image'}
                    </h3>
                    <p className="text-dark-500 mb-4">
                      or click to browse your files
                    </p>
                    <p className="text-xs text-dark-600">
                      Supports JPEG, PNG, WebP, GIF • Max 20MB
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="cropper"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card p-4"
              >
                <div className="relative overflow-hidden rounded-xl bg-dark-950">
                  <Cropper
                    ref={cropperRef}
                    src={originalImage}
                    style={{ height: 400, width: '100%' }}
                    aspectRatio={aspectRatio}
                    guides={true}
                    viewMode={1}
                    dragMode="move"
                    autoCropArea={0.8}
                    responsive={true}
                    restore={false}
                    checkOrientation={true}
                    background={false}
                    className="cropper-dark"
                  />
                </div>

                {/* Cropper Controls */}
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-dark-700">
                  <Button onClick={handleZoomIn} variant="ghost" icon={ZoomIn}>
                    Zoom In
                  </Button>
                  <Button onClick={handleZoomOut} variant="ghost" icon={ZoomOut}>
                    Zoom Out
                  </Button>
                  <div className="h-6 w-px bg-dark-700" />
                  <Button onClick={handleRotate} variant="ghost" icon={RotateCw}>
                    Rotate
                  </Button>
                  <Button onClick={handleFlipH} variant="ghost" icon={FlipHorizontal}>
                    Flip H
                  </Button>
                  <Button onClick={handleFlipV} variant="ghost" icon={FlipVertical}>
                    Flip V
                  </Button>
                  <div className="h-6 w-px bg-dark-700" />
                  <Button onClick={handleReset} variant="ghost" icon={RefreshCw}>
                    Reset
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Output Preview */}
          <AnimatePresence>
            {croppedImage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-dark-200 flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-400" />
                      Cropped Result
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="success">
                        {formatSize(croppedSize)}
                      </Badge>
                      {compressionRatio > 0 && (
                        <Badge variant="info">
                          -{compressionRatio}% size
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="relative rounded-xl overflow-hidden bg-dark-950 flex items-center justify-center p-4">
                    <img
                      src={croppedImage}
                      alt="Cropped preview"
                      className="max-w-full max-h-[300px] object-contain rounded-lg"
                    />
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings Panel */}
        <div className="space-y-4">
          {/* Aspect Ratio */}
          <Card>
            <h3 className="font-medium text-dark-200 mb-4">Aspect Ratio</h3>
            <div className="grid grid-cols-3 gap-2">
              {config.settings.aspectRatios.map((ratio) => (
                <button
                  key={ratio.label}
                  onClick={() => {
                    setAspectRatio(ratio.value)
                    if (cropperRef.current) {
                      cropperRef.current.cropper.setAspectRatio(ratio.value)
                    }
                  }}
                  className={`
                    px-3 py-2 text-sm rounded-xl transition-all font-medium
                    ${(isNaN(aspectRatio) && isNaN(ratio.value)) || aspectRatio === ratio.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                    }
                  `}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Quality */}
          <Card>
            <h3 className="font-medium text-dark-200 mb-4">Output Quality</h3>
            <div className="space-y-2">
              {config.settings.qualityOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => setQuality(option.value)}
                  className={`
                    w-full px-4 py-3 text-sm rounded-xl transition-all font-medium text-left
                    flex items-center justify-between
                    ${quality === option.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                    }
                  `}
                >
                  <span>{option.label}</span>
                  <span className="text-xs opacity-70">{Math.round(option.value * 100)}%</span>
                </button>
              ))}
            </div>
          </Card>

          {/* File Info */}
          {originalImage && (
            <Card className="bg-dark-800/30">
              <h3 className="font-medium text-dark-200 mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                File Info
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-500">Original Size</span>
                  <span className="text-dark-300">{formatSize(originalSize)}</span>
                </div>
                {croppedSize > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-dark-500">Cropped Size</span>
                      <span className="text-dark-300">{formatSize(croppedSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-500">Saved</span>
                      <span className="text-green-400">{compressionRatio}%</span>
                    </div>
                  </>
                )}
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {originalImage && (
              <>
                <Button
                  onClick={handleCrop}
                  className="w-full"
                  isLoading={isProcessing}
                  icon={isProcessing ? Loader2 : Crop}
                >
                  {isProcessing ? 'Processing...' : 'Crop & Compress'}
                </Button>

                {croppedImage && (
                  <Button
                    onClick={handleDownload}
                    variant="secondary"
                    className="w-full"
                    icon={Download}
                  >
                    Download Image
                  </Button>
                )}

                <Button
                  onClick={clear}
                  variant="ghost"
                  className="w-full"
                  icon={Trash2}
                >
                  Clear & Start Over
                </Button>
              </>
            )}
          </div>

          {/* Tips */}
          <Card className="bg-dark-800/30">
            <h3 className="text-sm font-medium text-dark-300 mb-2">💡 Tips</h3>
            <ul className="text-xs text-dark-500 space-y-1">
              <li>• Drag to move the crop area</li>
              <li>• Use corners to resize</li>
              <li>• Lower quality = smaller file size</li>
              <li>• All processing is done locally</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Custom Cropper Styles */}
      <style>{`
        .cropper-dark .cropper-view-box,
        .cropper-dark .cropper-face {
          outline: 2px solid rgba(14, 165, 233, 0.8);
          outline-color: rgba(14, 165, 233, 0.8);
        }
        .cropper-dark .cropper-line {
          background-color: rgba(14, 165, 233, 0.8);
        }
        .cropper-dark .cropper-point {
          background-color: rgba(14, 165, 233, 1);
          width: 10px;
          height: 10px;
        }
        .cropper-dark .cropper-modal {
          background-color: rgba(0, 0, 0, 0.6);
        }
      `}</style>
    </div>
  )
}
