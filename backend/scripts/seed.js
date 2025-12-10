const { faker } = require("@faker-js/faker");
const Transaction = require("../models/transaction");

// Categories for transactions
const CATEGORIES = [
    "Food & Dining",
    "Shopping",
    "Transportation",
    "Entertainment",
    "Bills & Utilities",
    "Healthcare",
    "Education",
    "Travel",
    "Investment",
    "Other",
];

function generateRandomTransaction(userID) {
    return {
        name: faker.commerce.productName(),
        ownedBy: userID,
        price: parseFloat(faker.commerce.price({ min: 5, max: 1000, dec: 2 })),
        category: faker.helpers.arrayElement(CATEGORIES),
        receiver: faker.datatype.boolean(),
        dataCreation: faker.date.past({ years: 10 }),
        dataUpdate: faker.date.recent({ years: 5 }),
    };
}

async function seedTransactions(userID, count = 100) {
    try {
        const transactions = [];

        for (let i = 0; i < count; i++) {
            transactions.push(generateRandomTransaction(userID));
        }

        const result = await Transaction.insertMany(transactions);
        console.log(`Successfully created ${result.length} transactions`);
        return result;
    } catch (error) {
        console.error(error);
    }
}

function setupSeedRoute(app) {
    app.post("/seed/transactions", async (req, res) => {
        try {
            const { userId, count = 50 } = req.body;

            if (!userId) {
                return res.status(400).json({ error: "userId is required" });
            }

            const transactions = await seedTransactions(userId, count);
            res.json({
                success: true,
                count: transactions.length,
                message: `Created ${transactions.length} random transactions`,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
}

module.exports = {
    generateRandomTransaction,
    seedTransactions,
    setupSeedRoute
}