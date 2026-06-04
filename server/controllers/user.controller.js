import User from "../models/user.model.js"
import jwt from "jsonwebtoken"

export const getCurrentUser = async (req, res) => {
    try {
        let token = null

        // ── 1. Try Authorization header first (mobile primary path) ──
        // Mobile browsers (Android Chrome, iOS Safari in-app browsers)
        // block cross-origin cookies. Token is sent as Bearer header.
        const authHeader = req.headers["authorization"]
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.slice(7).trim()
        }

        // ── 2. Fall back to cookie (desktop) ─────────────────────────
        if (!token && req.cookies?.token) {
            token = req.cookies.token
        }

        if (!token) {
            return res.status(200).json(null)
        }

        let verifyToken
        try {
            verifyToken = jwt.verify(token, process.env.JWT_SECRET)
        } catch (jwtErr) {
            // Expired or tampered token — treat as unauthenticated (not 401)
            // so the client doesn't flash an error on boot
            return res.status(200).json(null)
        }

        if (!verifyToken || !verifyToken.userId) {
            return res.status(200).json(null)
        }

        const user = await User.findById(verifyToken.userId)
        if (!user) {
            return res.status(200).json(null)
        }

        // Return the user object (client will keep its existing token)
        return res.status(200).json(user)
    } catch (error) {
        console.error("[getCurrentUser] Unexpected error:", error)
        return res.status(200).json(null)
    }
}