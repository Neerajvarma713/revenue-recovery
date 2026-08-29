import jwt from 'jsonwebtoken';
export function auth(req,res,next){const h=req.headers.authorization||''; if(!h.startsWith('Bearer ')) return res.status(401).json({error:'Authentication required'}); try{req.user=jwt.verify(h.slice(7),process.env.JWT_SECRET||'dev-secret'); next()}catch{return res.status(401).json({error:'Invalid token'})}}
