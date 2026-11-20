import jwt from 'jsonwebtoken';

export const jwtSecret = process.env.JWT_SECRET;

interface Credentials {
    userId: string;
    email?: string;
    apiKey: string;
}

export const sign = (payload: Credentials) => {
    if (!jwtSecret) {
        return null;
    }
    return jwt.sign(payload, jwtSecret, { expiresIn: '30d' });
};