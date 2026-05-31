import jwt from "jsonwebtoken"

const genToken = async (userId)=>{
    try{
        const secret = process.env.JWT_SECRET || process.env.JWTSECRET
        if (!secret) throw new Error('Missing JWT secret')
        const token = jwt.sign({userId}, secret, {expiresIn:"7d"})
        return token
    } catch(error){
        console.error('Token generation failed:', error)
        throw error
    }
}
export  default genToken