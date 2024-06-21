import React, { useEffect, useState } from 'react';
import '../css/Participants.css';
import { FaEdit, FaEye, FaTrash } from 'react-icons/fa';
import { Modal, Button, Form } from 'react-bootstrap';

const Participants = () => {
    const [participants, setParticipants] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        age_group: '',
        dob: '',
        has_hiv: false,
        is_in_school: true,
        village: '',
        enrollment_date: '' 
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [ageGroups, setAgeGroups] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingParticipantId, setDeletingParticipantId] = useState(null);

    const baseUrl = 'http://localhost:8000/api/participants/';

    useEffect(() => {
        fetchParticipants();
        fetchAgeGroups();
    }, []);

    const fetchParticipants = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found in localStorage.');
                return;
            }

            const response = await fetch(baseUrl, {
                headers: {
                    Authorization: `Token ${token}`,
                }
            });

            if (response.ok) {
                const data = await response.json();
                setParticipants(data);
                console.log(data);
            } else {
                console.error('Failed to fetch participants:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error fetching participants:', error);
        }
    };

    const fetchAgeGroups = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found in localStorage.');
                return;
            }

            const response = await fetch('http://localhost:8000/api/agegroups/', {
                headers: {
                    Authorization: `Token ${token}`,
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAgeGroups(data);
                console.log('Age groups fetched successfully:', data);
            } else {
                console.error('Failed to fetch age groups:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error fetching age groups:', error);
        }
    };

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    const handleShowModal = () => setShowModal(true);

    const handleCloseModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setFormData({
            name: '',
            age_group: '',
            dob: '',
            has_hiv: false,
            is_in_school: true,
            village: '',
            enrollment_date: '' 
        });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : type === 'radio' ? JSON.parse(value) : value;
        setFormData({ ...formData, [name]: val });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

       
        const formattedFormData = {
            ...formData,
            enrollment_date: formData.enrollment_date ? new Date(formData.enrollment_date).toISOString().split('T')[0] : ''
        };

        const requestOptions = {
            method: isEditing ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Token ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(formattedFormData),
        };

        try {
            const url = isEditing ? `${baseUrl}${editingId}/` : baseUrl;
            const response = await fetch(url, requestOptions);

            if (response.ok) {
                fetchParticipants();
                handleCloseModal();
            } else {
                console.error('Failed to submit form:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleEdit = (participant) => {
        setIsEditing(true);
        setEditingId(participant.id);
        setFormData({
            name: participant.name,
            age_group: participant.age_group, 
            dob: participant.dob,
            has_hiv: participant.has_hiv,
            is_in_school: participant.is_in_school,
            village: participant.village,
            enrollment_date: participant.enrollment_date ? new Date(participant.enrollment_date).toISOString().split('T')[0] : ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        setDeletingParticipantId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await fetch(`${baseUrl}${deletingParticipantId}/`, { method: 'DELETE' });
            fetchParticipants();
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Error deleting participant:', error);
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = participants.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(participants.length / itemsPerPage);

    return (
        <div className='participants-container'>
            <div className='add-container'>
                <button className='add-button' onClick={handleShowModal}>Add</button>
            </div>
            <div className='participant-table'>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Age Group</th>
                            <th>Date of Birth</th>
                            <th>HIV Status</th>
                            <th>School Status</th>
                            <th>Village</th>
                            <th>Enrollment Date</th> 
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((participant) => {
                  
                            const ageGroup = ageGroups.find(ag => ag.id === participant.age_group);
                            return (
                                <tr key={participant.id}>
                                    <td>{participant.name}</td>
                                    <td>{ageGroup ? ageGroup.group : '-'}</td>
                                    <td>{participant.dob}</td>
                                    <td>{participant.has_hiv ? 'Positive' : 'Negative'}</td>
                                    <td>{participant.is_in_school ? 'In School' : 'Out of School'}</td>
                                    <td>{participant.village}</td>
                                    <td>{participant.enrollment_date}</td> {/* Display Enrollment Date */}
                                    <td>
                                        <button className='view-button'>
                                            <FaEye />
                                        </button>
                                        <button className='edit-button' onClick={() => handleEdit(participant)}>
                                            <FaEdit />
                                        </button>
                                        <button className='delete-button' onClick={() => handleDelete(participant.id)}>
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className='pagination'>
                {[...Array(totalPages).keys()].map((number) => (
                    <button
                        key={number + 1}
                        className={`page-button ${currentPage === number + 1 ? 'active' : ''}`}
                        onClick={() => handlePageChange(number + 1)}
                    >
                        {number + 1}
                    </button>
                ))}
            </div>

           
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this participant?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

            
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Participant' : 'Add Participant'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleFormSubmit}>
                        <Form.Group controlId="formName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formAgeGroup">
                            <Form.Label>Age Group</Form.Label>
                            <Form.Control
                                as="select"
                                name="age_group"
                                value={formData.age_group}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Age Group</option>
                                {ageGroups.map(ag => (
                                    <option key={ag.id} value={ag.id}>{ag.group}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>

                        <Form.Group controlId="formDob">
                            <Form.Label>Date of Birth</Form.Label>
                            <Form.Control
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formHivStatus">
                            <Form.Label>HIV Status</Form.Label>
                            <div className="checkbox-group">
                                <Form.Check
                                    type="radio"
                                    label="Positive"
                                    name="has_hiv"
                                    value="true"
                                    checked={formData.has_hiv === true}
                                    onChange={handleInputChange}
                                />
                                <Form.Check
                                    type="radio"
                                    label="Negative"
                                    name="has_hiv"
                                    value="false"
                                    checked={formData.has_hiv === false}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </Form.Group>

                        <Form.Group controlId="formSchoolStatus">
                            <Form.Label>School Status</Form.Label>
                            <div className="checkbox-group">
                                <Form.Check
                                    type="radio"
                                    label="In School"
                                    name="is_in_school"
                                    value="true"
                                    checked={formData.is_in_school === true}
                                    onChange={handleInputChange}
                                />
                                <Form.Check
                                    type="radio"
                                    label="Not In School"
                                    name="is_in_school"
                                    value="false"
                                    checked={formData.is_in_school === false}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </Form.Group>

                        <Form.Group controlId="formVillage">
                            <Form.Label>Village</Form.Label>
                            <Form.Control
                                type="text"
                                name="village"
                                value={formData.village}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formEnrollmentDate">
                            <Form.Label>Enrollment Date</Form.Label>
                            <Form.Control
                                type="date"
                                name="enrollment_date"
                                value={formData.enrollment_date}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className='mt-3'>
                            {isEditing ? 'Update Participant' : 'Add Participant'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Participants;
