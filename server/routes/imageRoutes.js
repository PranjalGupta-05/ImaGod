import express from 'express'
import { generateImage, removeBg } from '../controllers/imageController.js'
import userAuth from '../middlewares/auth.js'
import multer from 'multer'

const imageRouter = express.Router()

// Store uploaded files in memory so we can stream them directly to Cloudinary
const storage = multer.memoryStorage()
const upload = multer({ storage })

imageRouter.post('/generate-image', userAuth, generateImage)
imageRouter.post('/remove-bg', upload.single('image'), userAuth, removeBg)

export default imageRouter