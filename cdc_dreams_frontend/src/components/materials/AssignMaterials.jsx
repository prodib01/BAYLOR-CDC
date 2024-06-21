import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Modal, Button, Form } from 'react-bootstrap';

const AssignMaterials = () => {
    const [assignMaterials, setAssignMaterials] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [events, setEvents] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [formData, setFormData] = useState({
        id: null,
        material: '',
        event: '',
        quantity: '',
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [materialToDelete, setMaterialToDelete] = useState(null);
    const itemsPerPage = 10;
    const url = 'http://localhost:8000/api/materialevents/';
    const maturl = 'http://localhost:8000/api/materials/';
    const eventurl = 'http://localhost:8000/api/events/';
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchAssignments();
        fetchMaterials();
        fetchEvents();
    }, []);

    const fetchMaterials = async () => {
        try {
            const response = await fetch(maturl, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            const data = await response.json();
            setMaterials(data);
        } catch (error) {
            console.error('Error fetching materials:', error);
        }
    };

    const fetchEvents = async () => {
        try {
            const response = await fetch(eventurl, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            const data = await response.json();
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const fetchAssignments = async () => {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            const data = await response.json();
            setAssignMaterials(data);
        } catch (error) {
            console.error('Error fetching assignments:', error);
        }
    };

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    const handleDelete = async (materialId) => {
        try {
            const response = await fetch(`${url}${materialId}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            setAssignMaterials(assignMaterials.filter(item => item.id !== materialId));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleAddAssignment = () => {
        setFormData({
            id: null,
            material: '',
            event: '',
            quantity: ''
        });
        setIsEditing(false);
        setShowModal(true);
    };

    const handleEditAssignment = (material) => {
        setFormData(material);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const method = isEditing ? 'PATCH' : 'POST';
        const endpoint = isEditing ? `${url}${formData.id}/` : url;

        try {
            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                throw new Error('Failed to save material');
            }
            const data = await response.json();
            if (isEditing) {
                setAssignMaterials(assignMaterials.map(material => (material.id === data.id ? data : material)));
            } else {
                setAssignMaterials([...assignMaterials, data]);
            }
            setShowModal(false);
        } catch (error) {
            console.error('Error saving material:', error);
        }
    };

    const confirmDelete = () => {
        handleDelete(materialToDelete);
        setShowDeleteModal(false);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = assignMaterials.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(assignMaterials.length / itemsPerPage);

    return (
        <div className='material-container'>
            <div className='add-container'>
                <button className='add-button' onClick={handleAddAssignment}>Assign Materials</button>
            </div>
            <div className='material-table'>
                <table>
                    <thead>
                        <tr>
                            <th>Material</th>
                            <th>Event</th>
                            <th>Quantity</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map(material => (
                            <tr key={material.id}>
                                <td>{materials.find(m => m.id === material.material)?.name || 'Unknown'}</td>
                                <td>{events.find(e => e.id === material.event)?.name || 'Unknown'}</td>
                                <td>{material.quantity}</td>
                                <td>
                                    <button className='edit-button' onClick={() => handleEditAssignment(material)}>
                                        <FaEdit />
                                    </button>
                                    <button className='delete-button' onClick={() => { setMaterialToDelete(material.id); setShowDeleteModal(true); }}>
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className='pagination'>
                {[...Array(totalPages)].map((_, index) => (
                    <button
                        key={index}
                        className={`page-button ${index + 1 === currentPage ? 'active' : ''}`}
                        onClick={() => handlePageChange(index + 1)}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this material assignment?</Modal.Body>
                <Modal.Footer>
                    <Button variant='secondary' onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button variant='danger' onClick={confirmDelete}>Delete</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Material Assignment' : 'Assign Material'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleFormSubmit}>
                        <Form.Group controlId='material'>
                            <Form.Label>Material</Form.Label>
                            <Form.Control
                                as='select'
                                name='material'
                                value={formData.material}
                                onChange={handleInputChange}
                                required
                            >
                                <option value=''>Select a material</option>
                                {materials.map(material => (
                                    <option key={material.id} value={material.id}>
                                        {material.name}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId='event'>
                            <Form.Label>Event</Form.Label>
                            <Form.Control
                                as='select'
                                name='event'
                                value={formData.event}
                                onChange={handleInputChange}
                                required
                            >
                                <option value=''>Select an event</option>
                                {events.map(event => (
                                    <option key={event.id} value={event.id}>
                                        {event.name}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId='quantity'>
                            <Form.Label>Quantity</Form.Label>
                            <Form.Control
                                type='number'
                                name='quantity'
                                value={formData.quantity}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Button variant='primary' type='submit'>
                            {isEditing ? 'Save Changes' : 'Assign Material'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default AssignMaterials;
