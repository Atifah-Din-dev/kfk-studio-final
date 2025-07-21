// server/controller/servicesController.js
// Controller for managing product services, including CRUD operations and image uploads

const ProductServices = require('../model/ProductServices');

exports.uploadServiceImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded' });
    }
    const imageUrl = `/uploads/services/${req.file.filename}`;
    res.json({ imageUrl });
};

exports.createService = async (req, res) => {
    try {
        const newService = new ProductServices(req.body);
        await newService.save();
        res.status(201).json(newService);
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ message: 'Failed to create service', error: error.message });
    }
};

exports.updateService = async (req, res) => {
    try {
        const serviceId = req.params.id;
        const updateData = req.body;
        const updatedService = await ProductServices.findByIdAndUpdate(serviceId, updateData, { new: true });
        if (!updatedService) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json(updatedService);
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ message: 'Failed to update service', error: error.message });
    }
};

exports.deleteService = async (req, res) => {
    try {
        const serviceId = req.params.id;
        const deletedService = await ProductServices.findByIdAndDelete(serviceId);
        if (!deletedService) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ message: 'Failed to delete service', error: error.message });
    }
};

exports.getAllServices = async (req, res) => {
    try {
        console.log('GET /api/services - Fetching all services');
        let services = await ProductServices.find();
        console.log(`Found ${services.length} services in database`);
        if (services.length === 0) {
            console.log('No services found in database, returning dummy data');
            services = [
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
                {
                    _id: '1',
                    name: 'Portrait Photography',
                    description: 'Professional portrait sessions for individuals, couples, or families.',
                    price: 150,
                    priceFormatted: 'RM150',
                    duration: '1 hour',
                    image: 'https://via.placeholder.com/300x200?text=Portrait+Photography',
                    category: 'portrait'
                },
                {
                    _id: '2',
                    name: 'Wedding Photography',
                    description: 'Full-day coverage of your special day with edited photos and albums.',
                    price: 1200,
                    priceFormatted: 'RM1,200',
                    duration: '8 hours',
                    image: 'https://via.placeholder.com/300x200?text=Wedding+Photography',
                    category: 'event'
                },
                {
                    _id: '3',
                    name: 'Commercial Photography',
                    description: 'High-quality product and branding photography for businesses.',
                    price: 500,
                    priceFormatted: 'RM500',
                    duration: '3 hours',
                    image: 'https://via.placeholder.com/300x200?text=Commercial+Photography',
                    category: 'portrait'
                },
                {
                    _id: '4',
                    name: 'Event Photography',
                    description: 'Coverage for special events, parties, and corporate functions.',
                    price: 350,
                    priceFormatted: 'RM350',
                    duration: '2 hours',
                    image: 'https://via.placeholder.com/300x200?text=Event+Photography',
                    category: 'event'
                },
                {
                    _id: 'horizontal_frame',
                    name: 'Horizontal Frame',
                    description: 'Professional horizontal frame photography for portraits and group photos.',
                    category: 'frame',
                    price: 80,
                    priceFormatted: 'RM80',
                    duration: 30,
                    image: 'https://via.placeholder.com/300x200?text=Horizontal+Frame',
                    webArUrl: 'https://mywebar.com/p/Project_0_fd100hw4ji?_ga=2.67941140.427142656.1748409355-402061734.1748409305',
                    availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
                    options: [
                        {
                            _id: 'hf_digital_copy',
                            name: 'Digital Copy',
                            description: 'High-resolution digital copy of all photos',
                            additionalPrice: 20
                        },
                        {
                            _id: 'hf_print_package',
                            name: 'Print Package',
                            description: 'Professional prints in various sizes',
                            additionalPrice: 35
                        }
                    ]
                },
                {
                    _id: 'vertical_frame',
                    name: 'Vertical Frame',
                    description: 'Professional vertical frame photography perfect for individual portraits.',
                    category: 'frame',
                    price: 75,
                    priceFormatted: 'RM75',
                    duration: 30,
                    image: 'https://via.placeholder.com/300x200?text=Vertical+Frame',
                    webArUrl: 'https://mywebar.com/p/Project_0_fd100hw4ji?_ga=2.67941140.427142656.1748409355-402061734.1748409305',
                    availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
                    options: [
                        {
                            _id: 'vf_digital_copy',
                            name: 'Digital Copy',
                            description: 'High-resolution digital copy of all photos',
                            additionalPrice: 20
                        },
                        {
                            _id: 'vf_retouching',
                            name: 'Professional Retouching',
                            description: 'Advanced photo retouching and enhancement',
                            additionalPrice: 25
                        }
                    ]
                }
            ];
            try {
                console.log('Attempting to save dummy services to database');
                await ProductServices.insertMany(services);
                console.log('Successfully saved dummy services to database');
            } catch (saveErr) {
                console.error('Error saving dummy services to database:', saveErr);
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
        if (!service) {
            const packageNames = ['Package A', 'Package B', 'Package C', 'Package D'];
            service = await ProductServices.findOne({
                name: { $in: packageNames }
            });
            if (!service) {
                return res.status(404).json({ message: 'Service not found' });
            }
        }
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
