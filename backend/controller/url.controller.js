import prisma from "../lib/prisma.js";

export const createUrl = async (req,res) => {
    const { url } = req.body;
    try {
        const newUrl = await prisma.url.create({
            data: {
                originalUrl: url,
                shortCode:Math.random().toString(36).slice(2, 8)
            }
        })
        return res.status(201).json(newUrl);

    } catch (error) {
        console.error(error)
        return res.status(400).json({
            message:"something went wrong"
        })
    }
}

export const redirectUrl = (req,res) => {
    
}