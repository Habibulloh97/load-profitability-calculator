import { registerUser } from "../services/authService.js";

export async function register(req,res) {
    try{
        const email = req.body.email
        const password = req.body.password
        if(!email || !password){
            return res.status(400).json({error : "Email and password required"})
        }
        const user = await registerUser(email,password)
        res.status(201).json({id : user.id, email:user.email})
    }
    catch(err){
        const DUPLICATE_KEY_ERROR = 11000
        if (err.code===DUPLICATE_KEY_ERROR){
            return res.status(409).json({error: "Email already exists"})
        }
        else{
            console.error(err)
            res.status(500).json({error:"Server Error"})
        }
    }
}