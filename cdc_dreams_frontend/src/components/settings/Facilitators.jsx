import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Modal, Button, Form } from 'react-bootstrap'; 


const Facilitators = () => {
    const [facilitators, setFacilitators] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        dob: '',
        gender: '',
        facilitates: '',
        contact: '',
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const itemsPerPage = 10;
    const url = 'http://localhost:8000/api/facilitators/';
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchFacilitators();
    }, []);

    const fetchFacilitators = async () => {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-type': 'application/json',
                    Authorization: `Token ${token}`,
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            setFacilitators(data);
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = facilitators.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(facilitators.length / itemsPerPage);
    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    const handleDelete = (id) => {
        fetch(`${url}${id}/`, {
            method: 'DELETE',
            headers: {
                'Content-type': 'application/json',
                Authorization: `Token ${token}`,
            }
        })
        .then(() => setFacilitators(facilitators.filter(facilitator => facilitator.id !== id)))
        .catch(error => console.error('Error deleting facilitator', error));
    };

    const handleAddFacilitator = () => {
        setFormData({
            id: null,
            name: '',
            dob: '',
            gender: '',
            facilitates: '',
            contact: '',
        });
        setShowModal(true);
        setIsEditing(false);
    };

    const handleEdit = (facilitator) => {
        setFormData({
            id: facilitator.id,
            name: facilitator.name,
            dob: facilitator.dob,
            gender: facilitator.gender,
            facilitates: facilitator.facilitates,
            contact: facilitator.contact,
        });
        setIsEditing(true);
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({...formData, [name]: value });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        const facilitatorData = {
            name: formData.name,
            dob: formData.dob,
            gender: formData.gender,
            facilitates: formData.facilitates,
            contact: formData.contact
        };

        if (isEditing) {
            fetch(`${url}${formData.id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${token}`,
                },
                body: JSON.stringify(facilitatorData),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update');
                }
                return response.json();
            })
            .then(data => {
                setFacilitators(facilitators.map(facilitator => (facilitator.id === data.id ? data : facilitator)));
                setShowModal(false);
            })
            .catch(error => {
                console.error('Error updating facilitator', error);
            });
        } else {
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${token}`,
                },
                body: JSON.stringify(facilitatorData),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to create');
                }
                return response.json();
            })
            .then(data => {
                setFacilitators([...facilitators, data]);
                setShowModal(false);
            })
            .catch(error => {
                console.error('Error creating facilitator', error);
            });
        }
    };

    const confirmDelete = () => {
        handleDelete(deleteId);
        setShowDeleteModal(false);
    };

    return (
        <div className='settings-container'>
            <div className='add-container'>
                <button className='add-button' onClick={handleAddFacilitator}>Add</button>
            </div>
            <div className='settings-table'>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Date of birth</th>
                            <th>Gender</th>
                            <th>Area of facilitation</th>
                            <th>Contact</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {facilitators.map(facilitator => (
                            <tr key={facilitator.id}>
                                <td>{facilitator.name}</td>
                                <td>{facilitator.dob}</td>
                                <td>{facilitator.gender}</td>
                                <td>{facilitator.facilitates}</td>
                                <td>{facilitator.contact}</td>
                                <td>
                                    <button className='edit-button' onClick={() => handleEdit(facilitator)}><FaEdit /></button>
                                    <button className='delete-button' onClick={() => {setShowDeleteModal(true); setDeleteId(facilitator.id);}}><FaTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {totalPages > 1 && (
                    <div className='pagination'>
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button key={index} onClick={() => handlePageChange(index + 1)}>{index + 1}</button>
                        ))}
                    </div>
                )}
            </div>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Facilitator' : 'Add Facilitator'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleFormSubmit}>
                        <Form.Group controlId='name'>
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type='text'
                                placeholder='Enter name'
                                name='name'
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId='dob'>
                            <Form.Label>Date of Birth</Form.Label>
                            <Form.Control
                                type='date'
                                name='dob'
                                value={formData.dob}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId='gender'>
                            <Form.Label>Gender</Form.Label>
                            <Form.Control
                                as='select'
                                name='gender'
                                value={formData.gender}
                                onChange={handleInputChange}
                                required
                            >
                                <option value=''>Select gender</option>
                                <option value='Male'>Male</option>
                                <option value='Female'>Female</option>
                                <option value='Other'>Other</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId='facilitates'>
                            <Form.Label>Area of Facilitation</Form.Label>
                            <Form.Control
                                type='text'
                                placeholder='Enter area of facilitation'
                                name='facilitates'
                                value={formData.facilitates}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId='contact'>
                            <Form.Label>Contact</Form.Label>
                            <Form.Control
                                type='text'
                                placeholder='Enter contact details'
                                name='contact'
                                value={formData.contact}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Button variant='primary' type='submit'>
                            {isEditing ? 'Update' : 'Add'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this facilitator?</Modal.Body>
                <Modal.Footer>
                    <Button variant='secondary' onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button variant='danger' onClick={confirmDelete}>Delete</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Facilitators;
