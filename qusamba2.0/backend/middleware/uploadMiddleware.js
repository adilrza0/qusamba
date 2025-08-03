const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verify Cloudinary configuration
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('Cloudinary configuration missing. Please check your environment variables.');
}

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'qusamba-products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'limit' },
      { quality: 'auto' }
    ]
  },
});

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      
      cb(null, true);
      
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  
});

module.exports = {
  uploadSingle: upload.single('image'),
  uploadMultiple: upload.array('images', 10),
  uploadAny: upload.any(), // Accept any field names for variant images
  uploadFields: upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'variant_0_images', maxCount: 10 },
    { name: 'variant_1_images', maxCount: 10 },
    { name: 'variant_2_images', maxCount: 10 },
    { name: 'variant_3_images', maxCount: 10 },
    { name: 'variant_4_images', maxCount: 10 },
    { name: 'variant_5_images', maxCount: 10 },
    { name: 'variant_6_images', maxCount: 10 },
    { name: 'variant_7_images', maxCount: 10 },
    { name: 'variant_8_images', maxCount: 10 },
    { name: 'variant_9_images', maxCount: 10 }
  ]),
  cloudinary
};
