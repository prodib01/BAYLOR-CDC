import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Modal, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Progress.css';

const Progress = () => {
    const [participants, setParticipants] = useState([]);
    const [events, setEvents] = useState([]);
    const [attendances, setAttendances] = useState([]);
    const [filteredAttendances, setFilteredAttendances] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        participant: '',
        event: '',
        skills: '',
        lessons_attended: 0,
        finished_program: false,
        self_sufficient: false,
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingAttendanceId, setDeletingAttendanceId] = useState(null);
    const token = localStorage.getItem('token');
    const participantsUrl = 'http://localhost:8000/api/participants/';
    const eventsUrl = 'http://localhost:8000/api/events/';
    const attendancesUrl = 'http://localhost:8000/api/participantattendances/';

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const response = await fetch(participantsUrl, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch participants');
                }
                const data = await response.json();
                
                setParticipants(data);
            } catch (error) {
                console.error('Error fetching participants:', error);
            }
        };

        const fetchEvents = async () => {
            try {
                const response = await fetch(eventsUrl, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch events');
                }
                const data = await response.json();
                setEvents(data);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        const fetchAttendances = async () => {
            try {
                const response = await fetch(attendancesUrl, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch attendances');
                }
                const data = await response.json();
                setAttendances(data);
                setFilteredAttendances(data); 
            } catch (error) {
                console.error('Error fetching attendances:', error);
            }
        };

        fetchParticipants();
        fetchEvents();
        fetchAttendances();
    }, [token]);

    useEffect(() => {
        if (selectedEvent) {
            const filtered = attendances.filter(attendance => attendance.event.toString() === selectedEvent);
            setFilteredAttendances(filtered);
        } else {
            setFilteredAttendances(attendances);
        }
    }, [selectedEvent, attendances]);
    

    const indexOfLastItem = currentPage * 5;
    const indexOfFirstItem = indexOfLastItem - 5;
    const currentAttendances = filteredAttendances.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleEditClick = (id) => {
        const attendanceToEdit = filteredAttendances.find(attendance => attendance.id === id);
        if (attendanceToEdit) {
            setIsEditing(true);
            setEditId(id);
            setFormData({
                participant: attendanceToEdit.participant.toString(),
                event: attendanceToEdit.event.toString(),
                skills: attendanceToEdit.skills,
                lessons_attended: attendanceToEdit.lessons_attended,
                finished_program: attendanceToEdit.finished_program,
                self_sufficient: attendanceToEdit.self_sufficient,
            });
            setShowModal(true);
        }
    };

    const handleAddClick = () => {
        setIsEditing(false);
        setFormData({
            participant: '',
            event: '',
            skills: '',
            lessons_attended: 0,
            finished_program: false,
            self_sufficient: false,
        });
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setIsEditing(false);
        setEditId(null);
        setFormData({
            participant: '',
            event: '',
            skills: '',
            lessons_attended: 0,
            finished_program: false,
            self_sufficient: false,
        });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const attendanceData = {
            participant: formData.participant,
            event: formData.event,
            skills: formData.skills,
            lessons_attended: parseInt(formData.lessons_attended, 10),
            finished_program: formData.finished_program,
            self_sufficient: formData.self_sufficient,
        };

        try {
            if (isEditing) {
                const response = await fetch(`${attendancesUrl}${editId}/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                    body: JSON.stringify(attendanceData),
                });

                if (!response.ok) {
                    throw new Error('Failed to update record');
                }

                const updatedAttendance = await response.json();
                const updatedAttendances = attendances.map(attendance =>
                    attendance.id === editId ? updatedAttendance : attendance
                );
                setAttendances(updatedAttendances);
            } else {
                const response = await fetch(attendancesUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                    body: JSON.stringify(attendanceData),
                });

                if (!response.ok) {
                    throw new Error('Failed to add record');
                }

                const data = await response.json();
                setAttendances([data, ...attendances]);
            }

            handleModalClose();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = (id) => {
        setDeletingAttendanceId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            const response = await fetch(`${attendancesUrl}${deletingAttendanceId}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete record');
            }

            const updatedAttendances = attendances.filter(attendance => attendance.id !== deletingAttendanceId);
            setAttendances(updatedAttendances);
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Error deleting record:', error);
        }
    };

    const getParticipantName = (id) => {
        const participant = participants.find(p => p.id === id);
        return participant ? participant.name : 'Unknown';
    };

    const getEventName = (id) => {
        const event = events.find(e => e.id === id);
        return event ? event.name : 'Unknown';
    };

    const handleEventFilterChange = (e) => {
        setSelectedEvent(e.target.value);
    };

    return (
        <div className='progress-container'>
            <div className='add-container'>
                <Button className='add-button' onClick={handleAddClick}>Add</Button>
            </div>
            <div className='event-selection-container'>
                <Form.Group controlId="Form.ControlSelect1">
                    <Form.Label>Choose an event:</Form.Label>
                    <Form.Control as="select" value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
                        <option value="">Select Event</option>
                        {events.map(event => (
                            <option key={event.id} value={event.id}>{event.name}</option>
                        ))}
                    </Form.Control>
                </Form.Group>
            </div>
            <div className='progress-table'>
                <table>
                    <thead>
                        <tr>
                            <th>Participant</th>
                            <th>Lessons Attended</th>
                            <th>Skills Attained</th>
                            <th>Finished program</th>
                            <th>Assessment</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentAttendances.map(attendance => (
                            <tr key={attendance.id}>
                                <td>{getParticipantName(attendance.participant)}</td>
                                <td>{attendance.lessons_attended}</td>
                                <td>{attendance.skills}</td>
                                <td>{attendance.finished_program ? 'Yes' : 'No'}</td>
                                <td>{attendance.self_sufficient ? 'Self-sufficient' : 'Not self-sufficient'}</td>
                                <td>
                                    <button className='edit-button' onClick={() => handleEditClick(attendance.id)}>
                                        <FaEdit />
                                    </button>
                                    <button className='delete-button' onClick={() => handleDelete(attendance.id)}>
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className='pagination'>
                    {Array.from({ length: Math.ceil(filteredAttendances.length / 5) }, (_, index) => (
                        <button
                            key={index}
                            className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
                            onClick={() => paginate(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>

            <Modal show={showModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Participant Event Attendance' : 'Add Participant Event Attendance'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="Form.ControlSelectParticipant">
                            <Form.Label>Select Participant:</Form.Label>
                            <Form.Control as="select" name="participant" value={formData.participant} onChange={handleInputChange}>
                                <option value="">Select Participant</option>
                                {participants.map(participant => (
                                    <option key={participant.id} value={participant.id}>{participant.name}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="Form.ControlSelectEvent">
                            <Form.Label>Select Event:</Form.Label>
                            <Form.Control as="select" name="event" value={formData.event} onChange={handleInputChange}>
                                <option value="">Select Event</option>
                                {events.map(event => (
                                    <option key={event.id} value={event.id}>{event.name}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="Form.ControlTextareaSkills">
                            <Form.Label>Skills Attained:</Form.Label>
                            <Form.Control as="textarea" rows={3} name="skills" value={formData.skills} onChange={handleInputChange} />
                        </Form.Group>
                        <Form.Group controlId="Form.ControlInputLessons">
                            <Form.Label>Lessons Attended:</Form.Label>
                            <Form.Control type="number" name="lessons_attended" value={formData.lessons_attended} onChange={handleInputChange} />
                        </Form.Group>
                        <Form.Group controlId="formBasicCheckboxFinishedProgram">
                        <Form.Label>Program completion</Form.Label>
                            <Form.Check
                                type="checkbox"
                                label="Completed"
                                name="finished_program"
                                checked={formData.finished_program}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formBasicCheckboxSelfSufficient">
                        <Form.Label>Assessment</Form.Label>
                            <Form.Check
                                type="checkbox"
                                label="Self-sufficient"
                                name="self_sufficient"
                                checked={formData.self_sufficient}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            {isEditing ? 'Update Record' : 'Add Record'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this record?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Progress;
