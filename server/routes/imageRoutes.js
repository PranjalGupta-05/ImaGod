import express from 'express'
import { generateImage, removeBg, enhanceImage, genReplace, genRecolor, genFill, unblurImage } from '../controllers/imageController.js'
import userAuth from '../middlewares/auth.js'
import multer from 'multer'

const imageRouter = express.Router()
const storage = multer.memoryStorage()
const upload = multer({ storage })

imageRouter.post('/generate-image',  userAuth,                        generateImage)
imageRouter.post('/remove-bg',       upload.single('image'), userAuth, removeBg)
imageRouter.post('/enhance',         upload.single('image'), userAuth, enhanceImage)
imageRouter.post('/gen-replace',     upload.single('image'), userAuth, genReplace)
imageRouter.post('/gen-recolor',     upload.single('image'), userAuth, genRecolor)
imageRouter.post('/gen-fill',        upload.single('image'), userAuth, genFill)
imageRouter.post('/unblur',          upload.single('image'), userAuth, unblurImage)

export default imageRouter
