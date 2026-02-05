/**
 * Image Crop Tool - Configuration
 */
export default {
  id: 'crop',
  name: 'Image Crop',
  description: 'Crop, resize, and compress images',
  category: 'Media',
  tags: ['image', 'crop', 'resize', 'compress', 'photo'],
  clientSide: true,
  
  // Tool-specific settings
  settings: {
    maxFileSize: 20 * 1024 * 1024, // 20MB
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    aspectRatios: [
      { label: 'Free', value: NaN },
      { label: '1:1', value: 1 },
      { label: '4:3', value: 4/3 },
      { label: '16:9', value: 16/9 },
      { label: '3:2', value: 3/2 },
      { label: '2:3', value: 2/3 },
    ],
    qualityOptions: [
      { label: 'High', value: 0.92 },
      { label: 'Medium', value: 0.8 },
      { label: 'Low', value: 0.6 },
    ],
  }
}
