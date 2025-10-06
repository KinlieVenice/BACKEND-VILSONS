const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


const getRevenue = async (req, res) => {
    try {
        
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

const getProfit = async (req, res) => {
    
}

const getExpenses = async (req, res) => {
    
}

const getCustomerBalance = async (req, res) => {
    
}