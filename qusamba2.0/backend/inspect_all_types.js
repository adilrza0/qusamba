const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();
const Product = require('./models/Product');

const inspectProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const allTypes = await Product.distinct('productType');
        let output = `All unique product types (${allTypes.length}):\n\n`;
        allTypes.sort().forEach(t => {
            output += `- "${t}"\n`;
        });

        fs.writeFileSync('all_types.txt', output);
        console.log('All types written to all_types.txt');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

inspectProducts();
