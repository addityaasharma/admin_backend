import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export const authMiddleware = (req,res,next)=>{
    const token = req.header("Authorization")?.replace("Bearer ","");

    if(!token){
        return res.status(401).json({message : "No token"});
    }

    try{
        const decoded = jwt.verify(token,JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch(error){
        return res.status(401).json({message : 'Token is not valid'})
    }
};
