import jwt from "jsonwebtoken"

/**
 * isAuth middleware
 * ─────────────────────────────────────────────────────────────────
 * Accepts the JWT from TWO sources, in priority order:
 *
 *  1. Authorization: Bearer <token>   ← primary (mobile-safe)
 *  2. Cookie: token=<token>           ← fallback (desktop)
 *
 * WHY: Mobile browsers (Android Chrome, iOS Safari in-app browsers,
 * Instagram/WhatsApp WebView) block cross-origin cookies that have
 * SameSite=None, even when Secure is set. Bearer tokens in headers
 * are never blocked and work universally.
 * ─────────────────────────────────────────────────────────────────
 */
const isAuth = (req, res, next) => {
    try {
        let token = null

        // ── 1. Try Authorization header first (mobile primary path) ──
        const authHeader = req.headers["authorization"]
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.slice(7).trim()
        }

        // ── 2. Fall back to cookie (desktop) ─────────────────────────
        if (!token && req.cookies?.token) {
            token = req.cookies.token
        }

        if (!token) {
            return res.status(401).json({ success: false, message: "Authentication required. Please log in." })
        }

        const verifyToken = jwt.verify(token, process.env.JWT_SECRET)

        if (!verifyToken) {
            return res.status(401).json({ success: false, message: "Invalid or expired token. Please log in again." })
        }

        req.userId = verifyToken.userId
        next()
    } catch (error) {
        // jwt.verify throws on expiry or tampering
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, message: "Session expired. Please log in again." })
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ success: false, message: "Invalid token. Please log in again." })
        }
        console.error("[isAuth] Unexpected error:", error)
        return res.status(500).json({ success: false, message: "Authentication error." })
    }
}

export default isAuth