const mongoose = require('mongoose');
const ProductServices = require('./model/ProductServices');

// Load environment variables
require('dotenv').config({ path: './config.env' });

const updateFrameServices = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.ATLAS_URI || 'mongodb://10.215.107.23:27017/kfkstudio');
        console.log('Connected to MongoDB');

        // Check current services
        const allServices = await ProductServices.find({});
        console.log('Current services in database:');
        allServices.forEach(service => {
            console.log(`- ${service.name}: hasWebArUrl=${!!service.webArUrl}`);
        });

        // Update Horizontal Frame service
        const horizontalFrameUpdate = await ProductServices.findOneAndUpdate(
            { name: 'Horizontal Frame' },
            {
                $set: {
                    webArUrl: 'https://mywebar.com/p/Project_0_fd100hw4ji?_ga=2.67941140.427142656.1748409355-402061734.1748409305',
                    options: {
                        sizes: ['Small', 'Medium', 'Large'],
                        materials: ['Wood', 'Metal', 'Acrylic'],
                        colors: ['Natural', 'Black', 'White', 'Gold']
                    }
                }
            },
            { new: true }
        );

        if (horizontalFrameUpdate) {
            console.log('✓ Updated Horizontal Frame service with WebAR URL');
        } else {
            console.log('⚠ Horizontal Frame service not found');
        }

        // Update Vertical Frame service
        const verticalFrameUpdate = await ProductServices.findOneAndUpdate(
            { name: 'Vertical Frame' },
            {
                $set: {
                    webArUrl: 'https://mywebar.com/p/Project_0_fd100hw4ji?_ga=2.67941140.427142656.1748409355-402061734.1748409305',
                    options: {
                        sizes: ['Small', 'Medium', 'Large'],
                        materials: ['Wood', 'Metal', 'Acrylic'],
                        colors: ['Natural', 'Black', 'White', 'Gold']
                    }
                }
            },
            { new: true }
        );

        if (verticalFrameUpdate) {
            console.log('✓ Updated Vertical Frame service with WebAR URL');
        } else {
            console.log('⚠ Vertical Frame service not found');
        }

        // Verify updates
        const updatedServices = await ProductServices.find({
            name: { $in: ['Horizontal Frame', 'Vertical Frame'] }
        });

        console.log('\nUpdated frame services:');
        updatedServices.forEach(service => {
            console.log(`- ${service.name}:`);
            console.log(`  WebAR URL: ${service.webArUrl || 'Not set'}`);
            console.log(`  Options: ${service.options ? 'Available' : 'Not set'}`);
        });

        console.log('\n✅ Database update completed successfully!');
    } catch (error) {
        console.error('❌ Error updating database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

updateFrameServices();
