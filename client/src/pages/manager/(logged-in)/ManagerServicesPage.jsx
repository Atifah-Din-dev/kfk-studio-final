// client/src/pages/manager/(logged-in)/ManagerServicesPage.jsx
// ManagerServicesPage for managing services, allowing managers to add, edit, and delete services

import React, { useEffect, useState } from "react";
import apiClient from "../../../services/api/apiClient";
import "../../../styles/ManagerServicesPage.css";

const ManagerServicesPage = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editService, setEditService] = useState(null);
    const [form, setForm] = useState({ name: "", category: "", price: "", duration: "", description: "", image: "" });
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get("/services");
                setServices(response.data);
                setLoading(false);
            } catch (err) {
                setError("Failed to load services.");
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: name === "price" || name === "duration" ? value.replace(/[^\d.]/g, "") : value });
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
            if (!allowedTypes.includes(file.type)) {
                setError("Only JPG, JPEG, or PNG files are allowed.");
                setImageFile(null);
                return;
            }
            setImageFile(file);
            setError("");
        }
    };

    const handleAddService = async (e) => {
        e.preventDefault();
        try {
            let image = "";
            if (imageFile) {
                const imgData = new FormData();
                imgData.append("image", imageFile);
                const imgRes = await apiClient.post("/services/upload", imgData, { headers: { 'Content-Type': 'multipart/form-data' } });
                image = imgRes.data.imageUrl;
            }
            const response = await apiClient.post("/services", { ...form, image });
            setServices([...services, response.data]);
            setForm({ name: "", category: "", price: "", description: "", image: "" });
            setImageFile(null);
        } catch (err) {
            setError("Failed to add service.");
        }
    };

    const handleEditService = (service) => {
        setEditService(service);
        setForm({
            name: service.name,
            category: service.category,
            price: service.price,
            duration: service.duration || "",
            description: service.description || "",
            image: service.image || ""
        });
        setImageFile(null);
    };

    const handleUpdateService = async (e) => {
        e.preventDefault();
        try {
            let image = form.image;
            if (imageFile) {
                const imgData = new FormData();
                imgData.append("image", imageFile);
                const imgRes = await apiClient.post("/services/upload", imgData, { headers: { 'Content-Type': 'multipart/form-data' } });
                image = imgRes.data.imageUrl;
            }
            const response = await apiClient.put(`/services/${editService._id}`, { ...form, image });
            setServices(services.map(s => (s._id === editService._id ? response.data : s)));
            setEditService(null);
            setForm({ name: "", category: "", price: "", description: "", image: "" });
            setImageFile(null);
        } catch (err) {
            setError("Failed to update service.");
        }
    };

    const handleDeleteService = async (serviceId) => {
        if (!window.confirm("Are you sure you want to delete this service?")) return;
        try {
            await apiClient.delete(`/services/${serviceId}`);
            setServices(services.filter(s => s._id !== serviceId));
        } catch (err) {
            setError("Failed to delete service.");
        }
    };

    return (
        <div className="manager-services-container">
            <h1 className="manager-services-title">Manage Services</h1>
            {error && <div className="services-error">{error}</div>}
            {loading ? (
                <div className="services-loading"><div className="spinner"></div>Loading...</div>
            ) : (
                <>
                    <table className="manager-services-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price (RM)</th>
                                <th>Description</th>
                                <th>Image</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map(service => (
                                <tr key={service._id}>
                                    <td>{service.name}</td>
                                    <td>{service.category}</td>
                                    <td>{parseFloat(service.price).toFixed(2)}</td>
                                    <td>{service.description}</td>
                                    <td>
                                        {service.image ? (
                                            <img
                                                src={service.image.startsWith('/uploads/') ? `http://10.215.107.23:5000${service.image}` : service.image}
                                                alt={service.name}
                                                style={{ maxWidth: 80, maxHeight: 60, borderRadius: 6, objectFit: 'cover', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                                            />
                                        ) : (
                                            <span style={{ color: '#aaa', fontStyle: 'italic' }}>No image</span>
                                        )}
                                    </td>
                                    <td className="manager-services-actions">
                                        <button onClick={() => handleEditService(service)}>Edit</button>
                                        <button onClick={() => handleDeleteService(service._id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <h2 className="manager-services-title">{editService ? "Edit Service" : "Add New Service"}</h2>
                    <form onSubmit={editService ? handleUpdateService : handleAddService} className="manager-services-form" encType="multipart/form-data">
                        <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="text"
                            name="category"
                            placeholder="Category"
                            value={form.category}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="number"
                            name="price"
                            placeholder="Price (RM)"
                            value={form.price}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="number"
                            name="duration"
                            placeholder="Duration (minutes)"
                            value={form.duration}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="text"
                            name="description"
                            placeholder="Description"
                            value={form.description}
                            onChange={handleChange}
                        />
                        <label style={{ fontWeight: 500 }}>
                            Image:
                            <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleImageChange} style={{ marginTop: 8 }} />
                            <span style={{ display: 'block', color: '#764ba2', fontSize: '0.95rem', marginTop: 4 }}>
                                Only JPG, JPEG, or PNG files are allowed.
                            </span>
                        </label>
                        {(imageFile || form.image) && (
                            <div style={{ margin: '8px 0' }}>
                                <img
                                    src={imageFile ? URL.createObjectURL(imageFile) : form.image}
                                    alt="Preview"
                                    style={{ maxWidth: 120, maxHeight: 80, borderRadius: 6, objectFit: 'cover', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                                />
                            </div>
                        )}
                        <button type="submit">{editService ? "Update" : "Add"}</button>
                        {editService && (
                            <button type="button" onClick={() => { setEditService(null); setForm({ name: "", category: "", price: "", description: "" }); }} style={{ marginLeft: 8 }}>Cancel</button>
                        )}
                    </form>
                </>
            )}
        </div>
    );
};

export default ManagerServicesPage;
