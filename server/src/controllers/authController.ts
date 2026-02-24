import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'somesecretkey', {
        expiresIn: '30d',
    });
};

export const register = async (req: Request, res: Response): Promise<void> => {
    const { email, username, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const user = await User.create({
            email,
            username,
            passwordHash: password, // Will be hashed by pre-save middleware
        });

        if (user) {
            res.status(201).json({
                id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken((user._id as any).toString()),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await (user as any).comparePassword(password))) {
            res.json({
                id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken((user._id as any).toString()),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
