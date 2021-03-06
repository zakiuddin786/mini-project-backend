const jwt=require("jsonwebtoken");

module.exports = (req,res,next)=>{
    try{
        const token=req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token,process.env.JWT_KEY);
        req.userData={
            email:decodedToken.email,
            userId:decodedToken.userId,
            name:decodedToken.name,
            avatar:decodedToken.avatar
        }
        next();
    }catch(err){
        console.log(err);
        res.status(401).json({
            message:"Authentication is required for performing this action!"
        })
    }
}