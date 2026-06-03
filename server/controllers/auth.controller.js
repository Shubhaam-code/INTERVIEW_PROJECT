import genToken from "../config/token.js"
import User from "../models/user.model.js"

export const googleAuth = async (req, res) => {
    try {
        const { name, email } = req.body
        let user = await User.findOne({ email })
        if (!user) {
            user = await User.create({ name, email })
        }

        const token = await genToken(user._id)

        // ── Set cookie for desktop browsers ────────────────────────
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
        })

        // ── Also return token in body for mobile localStorage storage ─
        // Mobile browsers (Android Chrome, in-app browsers) block
        // cross-origin SameSite=None cookies. Returning the token in
        // the response body lets the client store it in localStorage
        // and send it as Authorization: Bearer on subsequent requests.
        return res.status(200).json({ ...user.toObject(), _token: token })

    } catch (error) {
        console.error("[googleAuth] Error:", error)
        return res.status(500).json({ success: false, message: "Authentication failed. Please try again." })
    }
}

export const logOut = async (req, res) => {
    try {
        // Clear cookie with same options it was set with
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        })
        return res.status(200).json({ success: true, message: "Logged out successfully" })
    } catch (error) {
        console.error("[logOut] Error:", error)
        return res.status(500).json({ success: false, message: "Logout failed." })
    }
}
