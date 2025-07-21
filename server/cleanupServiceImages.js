// Cleanup script for service images
// Usage: node cleanupServiceImages.js

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const ProductServices = require('./model/ProductServices');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kfkstudio';
const UPLOADS_DIR = path.join(__dirname, 'uploads', 'services');
const PUBLIC_URL_BASE = 'http://10.215.107.23:5000/uploads/services/';
const DEFAULT_IMAGE_URL = 'https://via.placeholder.com/300x200?text=No+Image';

function isLocalPath(image) {
    if (!image) return false;
    return image.startsWith('file:///') || image.match(/^[A-Za-z]:\\/);
}

async function main() {
    await mongoose.connect(MONGO_URI);
    const services = await ProductServices.find({});
    let updated = 0;

    for (const service of services) {
        if (isLocalPath(service.image) || !service.image || service.image.startsWith('https://via.placeholder.com')) {
            let filename = service.image ? path.basename(service.image.replace('file:///', '')) : '';
            let filePath = filename ? path.join(UPLOADS_DIR, filename) : '';
            let newImageUrl;
            if (filename && fs.existsSync(filePath)) {
                newImageUrl = PUBLIC_URL_BASE + filename;
            } else {
                newImageUrl = DEFAULT_IMAGE_URL;
            }
            service.image = newImageUrl;
            await service.save();
            updated++;
            console.log(`Updated service ${service._id}: ${newImageUrl}`);
        }
    }
    console.log(`Done. Updated ${updated} services.`);
    mongoose.disconnect();
}

main().catch(err => {
    console.error(err);
    mongoose.disconnect();
});
