import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { getAuthToken } from '../grpc/client/client';

declare global {
    namespace Express {
        interface Request {
            authUser?: string;
            authType?: string;
        }
    }
}

dotenv.config();
const secret = process.env.TOKEN_SECRET || '';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cookie = req.cookies['token'];
        if (!cookie) throw new Error('No Cookie provided');
        const token = cookie.trim();
        if(!token) throw new Error("No token provided");

        const authRepo = await getAuthToken(cookie);
        if (!authRepo) throw new Error("Cannot get token");
        const type = authRepo.type;
        
        const { id } = jwt.verify(token, secret) as { id: string };
        if(!id) throw new Error('Cannot verify token');
        
        req.authUser = id;
        req.authType = type;
        
        next();
    } catch(err: unknown) {
        if(err instanceof Error) {
            res.status(401).json({
                success: false,
                message: err.message
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Error checking token'
            });
        }
    }

}