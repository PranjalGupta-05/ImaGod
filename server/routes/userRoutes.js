import express from 'express'
import {registerUser, loginUser, userCredits, paymentRazorpay, verifyRazorpay, getUserUsage} from '../controllers/userController.js'
import {getUserHistory, deleteHistoryItem} from '../controllers/historyController.js'
import userAuth from '../middlewares/auth.js'

const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/credits', userAuth, userCredits)
userRouter.get('/usage', userAuth, getUserUsage)
userRouter.post('/pay-razor', userAuth, paymentRazorpay)
userRouter.post('/verify-razor', userAuth, verifyRazorpay)
userRouter.get('/history', userAuth, getUserHistory)
userRouter.post('/history/delete', userAuth, deleteHistoryItem)

export default userRouter