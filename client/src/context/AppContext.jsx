import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios'
import { useNavigate } from "react-router-dom";

export const AppContext = createContext()

const AppContextProvider = (props) => {
    const [user, setUser] = useState(null);
    const [showLogin, setShowLogin] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [credit, setCredit] = useState(false)

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const navigate = useNavigate()

    const loadCreditsData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/credits', { headers: { token } })
            if (data.success) { setCredit(data.credits); setUser(data.user) }
        } catch (error) { console.log(error); toast.error(error.message) }
    }

    const handleResponse = (data) => {
        toast.error(data.message)
        loadCreditsData()
        if (data.creditBalance === 0) navigate('/buycredit')
    }

    const generateImage = async (prompt) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/image/generate-image', { prompt }, { headers: { token } })
            if (data.success) { loadCreditsData(); return data.resultImage }
            else handleResponse(data)
        } catch (error) { toast.error(error.message) }
    }

    const removeBg = async (imageFile) => {
        try {
            const formData = new FormData(); formData.append('image', imageFile)
            const { data } = await axios.post(backendUrl + '/api/image/remove-bg', formData, { headers: { token } })
            if (data.success) { loadCreditsData(); return data.resultImage }
            else handleResponse(data)
        } catch (error) { toast.error(error.message) }
    }

    const enhanceImage = async (imageFile) => {
        try {
            const formData = new FormData(); formData.append('image', imageFile)
            const { data } = await axios.post(backendUrl + '/api/image/enhance', formData, { headers: { token } })
            if (data.success) { loadCreditsData(); return data.resultImage }
            else handleResponse(data)
        } catch (error) { toast.error(error.message) }
    }

    const genReplace = async (imageFile, from, to) => {
        try {
            const formData = new FormData()
            formData.append('image', imageFile)
            formData.append('from', from)
            formData.append('to', to)
            const { data } = await axios.post(backendUrl + '/api/image/gen-replace', formData, { headers: { token } })
            if (data.success) { loadCreditsData(); return data.resultImage }
            else handleResponse(data)
        } catch (error) { toast.error(error.message) }
    }

    const genRecolor = async (imageFile, prompt, color) => {
        try {
            const formData = new FormData()
            formData.append('image', imageFile)
            formData.append('prompt', prompt)
            formData.append('color', color)
            const { data } = await axios.post(backendUrl + '/api/image/gen-recolor', formData, { headers: { token } })
            if (data.success) { loadCreditsData(); return data.resultImage }
            else handleResponse(data)
        } catch (error) { toast.error(error.message) }
    }

    const genFill = async (imageFile, aspectRatio) => {
        try {
            const formData = new FormData()
            formData.append('image', imageFile)
            formData.append('aspectRatio', aspectRatio)
            const { data } = await axios.post(backendUrl + '/api/image/gen-fill', formData, { headers: { token } })
            if (data.success) { loadCreditsData(); return data.resultImage }
            else handleResponse(data)
        } catch (error) { toast.error(error.message) }
    }

    const unblurImage = async (imageFile, mode = 'standard') => {
        try {
            const formData = new FormData()
            formData.append('image', imageFile)
            formData.append('mode', mode)
            const { data } = await axios.post(backendUrl + '/api/image/unblur', formData, { headers: { token } })
            if (data.success) { loadCreditsData(); return data.resultImage }
            else handleResponse(data)
        } catch (error) { toast.error(error.message) }
    }

    const logout = () => {
        localStorage.removeItem('token'); setToken(''); setUser(null)
    }

    useEffect(() => { if (token) loadCreditsData() }, [token])

    const value = {
        user, setUser, showLogin, setShowLogin, backendUrl, token, setToken,
        credit, setCredit, loadCreditsData, logout,
        generateImage, removeBg, enhanceImage, genReplace, genRecolor, genFill, unblurImage
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
export default AppContextProvider
