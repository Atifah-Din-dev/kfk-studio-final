const mongoose = require('mongoose');
const ProductServices = require('./model/ProductServices');

// Load environment variables
require('dotenv').config({ path: './config.env' });

const checkAndCreateFrameServices = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.ATLAS_URI || 'mongodb://localhost:27017/kfkstudio');
        console.log('Connected to MongoDB');

        // Check current services
        const allServices = await ProductServices.find({});
        console.log('Current services in database:');
        allServices.forEach(service => {
            console.log(`- ${service.name} (${service.category}): $${service.price}`);
        });

        // Create frame services if they don't exist
        const frameServices = [
            {
                name: 'Horizontal Frame',
                category: 'Framing',
                price: 80,
                duration: 60, // 1 hour in minutes
                description: 'Professional horizontal framing service for your photos. Perfect for landscape and wide-format prints.',
                webArUrl: 'https://mywebar.com/p/Project_0_fd100hw4ji?_ga=2.67941140.427142656.1748409355-402061734.1748409305',
                options: [
                    {
                        name: 'Small Frame',
                        description: 'Small horizontal frame (8x10 inches)',
                        additionalPrice: 0,
                        additionalDuration: 0
                    },
                    {
                        name: 'Medium Frame',
                        description: 'Medium horizontal frame (11x14 inches)',
                        additionalPrice: 20,
                        additionalDuration: 15
                    },
                    {
                        name: 'Large Frame',
                        description: 'Large horizontal frame (16x20 inches)',
                        additionalPrice: 40,
                        additionalDuration: 30
                    }
                ],
                availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                availableTimeSlots: [
                    { startTime: '09:00', endTime: '17:00' }
                ]
            },
            {
                name: 'Vertical Frame',
                category: 'Framing',
                price: 80,
                duration: 60, // 1 hour in minutes
                description: 'Professional vertical framing service for your photos. Perfect for portrait and tall-format prints.',
                webArUrl: 'https://mywebar.com/p/Project_0_fd100hw4ji?_ga=2.67941140.427142656.1748409355-402061734.1748409305',
                options: [
                    {
                        name: 'Small Frame',
                        description: 'Small vertical frame (8x10 inches)',
                        additionalPrice: 0,
                        additionalDuration: 0
                    },
                    {
                        name: 'Medium Frame',
                        description: 'Medium vertical frame (11x14 inches)',
                        additionalPrice: 20,
                        additionalDuration: 15
                    },
                    {
                        name: 'Large Frame',
                        description: 'Large vertical frame (16x20 inches)',
                        additionalPrice: 40,
                        additionalDuration: 30
                    }
                ],
                availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                availableTimeSlots: [
                    { startTime: '09:00', endTime: '17:00' }
                ]
            }
        ];

        for (const serviceData of frameServices) {
            const existingService = await ProductServices.findOne({ name: serviceData.name });

            if (!existingService) {
                const newService = new ProductServices(serviceData);
                await newService.save();
                console.log(`✓ Created ${serviceData.name} service with WebAR URL`);
            } else {
                // Update existing service with WebAR URL
                await ProductServices.findOneAndUpdate(
                    { name: serviceData.name },
                    {
                        $set: {
                            webArUrl: serviceData.webArUrl,
                            options: serviceData.options,
                            duration: serviceData.duration
                        }
                    }
                );
                console.log(`✓ Updated ${serviceData.name} service with WebAR URL`);
            }
        }

        // Verify the frame services exist
        const frameServicesCheck = await ProductServices.find({
            name: { $in: ['Horizontal Frame', 'Vertical Frame'] }
        });

        console.log('\nFrame services in database:');
        frameServicesCheck.forEach(service => {
            console.log(`- ${service.name}:`);
            console.log(`  WebAR URL: ${service.webArUrl || 'Not set'}`);
            console.log(`  Options: ${service.options ? service.options.length + ' options' : 'Not set'}`);
            console.log(`  Price: $${service.price}`);
            console.log(`  Duration: ${service.duration} minutes`);
        });

        console.log('\n✅ Database setup completed successfully!');
    } catch (error) {
        console.error('❌ Error setting up database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

checkAndCreateFrameServices();
