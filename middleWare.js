import jwt from 'jsonwebtoken';

const JWT_SECRET = 'thisismysecretkey';

export const authMiddleware = (req,res,next)=>{
    const token = req.header("Authorization")?.replace("Bearer"," ");

    if(!token){
        return res.send(401).json({message : "No token"});
    }

    try{
        const decoded = jwt.verify(token,JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch(error){
        return res.send(401).json({message : 'Token is valid not valid'})
    }
};