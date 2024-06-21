import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Modal, Button, Form } from 'react-bootstrap';
import '../../css/Material.css';

const AllMaterials = () => {
    const [materials, setMaterials] = useState([]);
    const [targetGroups, setTargetGroups] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        target_group: '',
        stock: '',
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [materialToDelete, setMaterialToDelete] = useState(null);
    const itemsPerPage = 10;
    const url = 'http://localhost:8000/api/materials/';
    const groupUrl = 'http://localhost:8000/api/agegroups/';
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchMaterials();
        fetchTargetGroups();
    }, []);

    const fetchMaterials = async () => {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(response.status);
            }
            const data = await response.json();
            setMaterials(data);
        } catch (error) {
            console.error('Error fetching materials:', error);
        }
    };

    const fetchTargetGroups = async () => {
        try {
            const response = await fetch(groupUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(response.status);
            }
            const data = await response.json();
            setTargetGroups(data);
        } catch (error) {
            console.error('Error fetching target groups:', error);
        }
    };

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    const handleDelete = (materialId) => {
        fetch(`${url}${materialId}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            }
        })
        .then(() => setMaterials(materials.filter(item => item.id !== materialId)))
        .catch(error => console.error('Error:', error));
    };

    const handleAddMaterial = () => {
        setFormData({
            id: null,
            name: '',
            target_group: '',
            stock: ''   
        });
        setIsEditing(false);
        setShowModal(true);
    };

    const handleEditMaterial = (material) => {
        setFormData(material);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const method = isEditing ? 'PATCH' : 'POST';
        const endpoint = isEditing ? `${url}${formData.id}/` : url;

        fetch(endpoint, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify(formData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save material');
            }
            return response.json();
        })
        .then(data => {
            if (isEditing) {
                setMaterials(materials.map(material => (material.id === data.id ? data : material)));
            } else {
                setMaterials([...materials, data]);
            }
            setShowModal(false);
        })
        .catch(error => {
            console.error('Error saving material', error);
        });
    };

    const confirmDelete = () => {
        handleDelete(materialToDelete);
        setShowDeleteModal(false);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = materials.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(materials.length / itemsPerPage);

    return (
        <div className='material-container'>
            <div className='add-container'>
                <button className='add-button' onClick={handleAddMaterial}>Add</button>
            </div>
            <div className='material-table'>
                <table>
                    <thead>
                        <tr>
                            <th>Material</th>
                            <th>Target Group</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map(material => (
                            <tr key={material.id}>
                                <td>{material.name}</td>
                                <td>{targetGroups.find(group => group.id === material.target_group)?.group || 'N/A'}</td>
                                <td>{material.stock}</td>
                                <td>
                                    <button className='edit-button' onClick={() => handleEditMaterial(material)}>
                                        <FaEdit />
                                    </button>
                                    <button className='delete-button' onClick={() => {
                                        setMaterialToDelete(material.id);
                                        setShowDeleteModal(true);
                                    }}>
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Pagination */}
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
            </div>
            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this material?</Modal.Body>
                <Modal.Footer>
                    <Button variant='secondary' onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button variant='danger' onClick={confirmDelete}>Delete</Button>
                </Modal.Footer>
            </Modal>
            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Material' : 'Add Material'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleFormSubmit}>
                        <Form.Group controlId='name'>
                            <Form.Label>Material</Form.Label>
                            <Form.Control
                                type='text'
                                name='name'
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId='target_group'>
                            <Form.Label>Target Group</Form.Label>
                            <Form.Control
                                as='select'
                                name='target_group'
                                value={formData.target_group}
                                onChange={handleInputChange}
                                required
                            >
                                <option value=''>Select a group</option>
                                {targetGroups.map(group => (
                                    <option key={group.id} value={group.id}>
                                        {group.group}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId='stock'>
                            <Form.Label>Stock</Form.Label>
                            <Form.Control
                                type='number'
                                name='stock'
                                value={formData.stock}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Button variant='primary' type='submit'>
                            {isEditing ? 'Save Changes' : 'Add Material'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default AllMaterials;
