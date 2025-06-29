const ProductServices = require('../model/ProductServices');

exports.getAllServices = async (req, res) => {
    try {
        console.log('GET /api/services - Fetching all services');

        // Try to get services from the database
        let services = await ProductServices.find();
        console.log(`Found ${services.length} services in database`);

        // If no services in database yet, return dummy data
        if (services.length === 0) {
            console.log('No services found in database, returning dummy data');
            services = [
                // Add Package A, B, C, D from Landing Page first
                {
                    _id: 'package_a',
                    name: 'Package A',
                    description: 'Basic photography package with essential services.',
                    category: 'studio',
                    price: 65,
                    priceFormatted: 'RM65',
                    duration: 15,
                    image: 'https://via.placeholder.com/300x200?text=Package+A',
                    isPackage: true
                },
                {
                    _id: 'package_b',
                    name: 'Package B',
                    description: 'Standard photography package with additional editing services.',
                    category: 'studio',
                    price: 75,
                    priceFormatted: 'RM75',
                    duration: 15,
                    image: 'https://via.placeholder.com/300x200?text=Package+B',
                    isPackage: true
                },
                {
                    _id: 'package_c',
                    name: 'Package C',
                    description: 'Premium photography package with advanced editing and prints.',
                    category: 'studio',
                    price: 90,
                    priceFormatted: 'RM90',
                    duration: 15,
                    image: 'https://via.placeholder.com/300x200?text=Package+C',
                    isPackage: true
                },
                {
                    _id: 'package_d',
                    name: 'Package D',
                    description: 'Complete photography package with all premium services included.',
                    category: 'studio',
                    price: 115,
                    priceFormatted: 'RM115',
                    duration: 15,
                    image: 'https://via.placeholder.com/300x200?text=Package+D',
                    isPackage: true
                },
                // Original services after packages
                {
                    _id: '1',
                    name: 'Portrait Photography',
                    description: 'Professional portrait sessions for individuals, couples, or families.',
                    price: 150,
                    priceFormatted: 'RM150',
                    duration: '1 hour',
                    image: 'https://via.placeholder.com/300x200?text=Portrait+Photography'
                },
                {
                    _id: '2',
                    name: 'Wedding Photography',
                    description: 'Full-day coverage of your special day with edited photos and albums.',
                    price: 1200,
                    priceFormatted: 'RM1,200',
                    duration: '8 hours',
                    image: 'https://via.placeholder.com/300x200?text=Wedding+Photography'
                },
                {
                    _id: '3',
                    name: 'Commercial Photography',
                    description: 'High-quality product and branding photography for businesses.',
                    price: 500,
                    priceFormatted: 'RM500',
                    duration: '3 hours',
                    image: 'https://via.placeholder.com/300x200?text=Commercial+Photography'
                },
                {
                    _id: '4',
                    name: 'Event Photography',
                    description: 'Coverage for special events, parties, and corporate functions.',
                    price: 350,
                    priceFormatted: 'RM350',
                    duration: '2 hours',
                    image: 'https://via.placeholder.com/300x200?text=Event+Photography'
                }
            ];

            // Optionally save these dummy services to the database
            try {
                console.log('Attempting to save dummy services to database');
                await ProductServices.insertMany(services);
                console.log('Successfully saved dummy services to database');
            } catch (saveErr) {
                console.error('Error saving dummy services to database:', saveErr);
                // Continue even if saving fails
            }
        }

        console.log('Sending services response');
        res.json(services);
    } catch (err) {
        console.error('Error fetching services:', err);
        res.status(500).json({ message: 'Failed to fetch services', error: err.message });
    }
};

exports.getServiceById = async (req, res) => {
    try {
        let service = await ProductServices.findById(req.params.id);

        // If service not found in database, check if it's one of our studio packages
        if (!service) {
            // Try to find by name if it's a studio package
            const packageNames = ['Package A', 'Package B', 'Package C', 'Package D'];
            service = await ProductServices.findOne({
                name: { $in: packageNames }
            });

            // If still not found, return 404
            if (!service) {
                return res.status(404).json({ message: 'Service not found' });
            }
        }

        // Ensure studio packages have the correct category and duration
        if (['Package A', 'Package B', 'Package C', 'Package D'].includes(service.name)) {
            service = {
                ...service.toObject(),
                category: 'studio',
                duration: 15
            };
        }

        res.json(service);
    } catch (err) {
        console.error('Error fetching service by ID:', err);
        res.status(500).json({ message: 'Failed to fetch service', error: err.message });
    }
};