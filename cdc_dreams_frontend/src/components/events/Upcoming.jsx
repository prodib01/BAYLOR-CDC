import React, { useState, useEffect } from 'react';
import { FaEdit, FaEye, FaTrash } from 'react-icons/fa';
import { Modal, Button, Form } from 'react-bootstrap';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import '../../css/Events.css';

const animatedComponents = makeAnimated();

const Upcoming = () => {
  const [events, setEvents] = useState([]);
  const [facilitators, setFacilitators] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    event_type: '',
    start_date: '',
    end_date: '',
    location: '',
    lessons: '',
    learning_outcomes: '',
    facilitators: []
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState(null);
  const itemsPerPage = 10;
  const eventsUrl = 'http://localhost:8000/api/events/';
  const facilitatorsUrl = 'http://localhost:8000/api/facilitators/';
  const token = localStorage.getItem('token');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);


  useEffect(() => {
    fetchEvents();
    fetchFacilitators();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in local storage');
        return;
      }
      const response = await fetch(eventsUrl, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data);
      console.log(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchFacilitators = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in local storage');
        return;
      }
      const response = await fetch(facilitatorsUrl, {
        headers: {
          'Authorization': `Token ${token}`,
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch facilitators');
      }
      const data = await response.json();
      setFacilitators(data);
    } catch (error) {
      console.error('Error fetching facilitators:', error);
    }
  };

  const today = new Date();
  const filteredEvents = events.filter(event => new Date(event.start_date) > today);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleDelete = (eventId) => {
    fetch(`${eventsUrl} ${eventId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${token}`
      }
    })
      .then(() => setEvents(events.filter(event => event.id !== eventId)))
      .catch(error => console.error('There was an error deleting the event!', error));
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };


  const handleAddEvent = () => {
    setFormData({
      name: '',
      event_type: '',
      start_date: '',
      end_date: '',
      location: '',
      lessons: '',
      learning_outcomes: '',
      facilitators: []
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEditEvent = (event) => {
    const facilitatorIds = event.facilitators_details.map(facilitator => facilitator.id);
    setFormData({
      ...event,
      start_date: event.start_date,
      end_date: event.end_date,
      facilitators: facilitatorIds
    });
    setIsEditing(true);
    setCurrentEvent(event);
    setShowModal(true);
  };


  const handleInputChange = (selectedOptions) => {
    const selectedValues = selectedOptions.map(option => option.value); // Extract IDs from selected options
    setFormData({ ...formData, facilitators: selectedValues });
  };


  const handleFormSubmit = (e) => {
    e.preventDefault();

    const eventData = {
      name: formData.name,
      event_type: formData.event_type,
      start_date: formData.start_date,
      end_date: formData.end_date,
      location: formData.location,
      facilitators: formData.facilitators,
      lessons: formData.lessons,
      learning_outcomes: formData.learning_outcomes
    };

    console.log('Data being sent:', eventData); // Log the data being sent

    if (isEditing) {
      fetch(`${eventsUrl} ${currentEvent.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(eventData)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to update event');
          }
          return response.json();
        })
        .then(data => {
          setEvents(events.map(event => (event.id === currentEvent.id ? data : event)));
          setShowModal(false);
        })
        .catch(error => {
          console.error('Error updating event:', error);
          // Display error message to the user
        });
    } else {
      fetch(eventsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(eventData)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to add event');
          }
          return response.json();
        })
        .then(data => {
          setEvents([...events, data]);
          setShowModal(false);
        })
        .catch(error => {
          console.error('Error adding event:', error);
          // Display error message to the user
        });
    }
  };

  const confirmDelete = () => {
    handleDelete(deleteEventId);
    setShowDeleteModal(false);
  };

  const onClose = () => {
    setShowEventModal(false);
    setSelectedEvent(null); // Optionally reset selectedEvent state
  };


  return (
    <div className='events-container'>
      <div className='add-container'>
        <button className='add-button' onClick={handleAddEvent}>Add</button>
      </div>
      <div className='events-table'>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Event Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((event) => (
              <tr key={event.id}>
                <td>{event.name}</td>
                <td>{event.event_type}</td>
                <td>{event.start_date}</td>
                <td>{event.end_date}</td>
                <td>{event.location}</td>
                <td><button className='view-button' onClick={() => handleViewEvent(event)}><FaEye /></button>
                  <button className='edit-button' onClick={() => handleEditEvent(event)}><FaEdit /></button>
                  <button className='delete-button' onClick={() => {
                    setDeleteEventId(event.id);
                    setShowDeleteModal(true);
                  }}><FaTrash /></button>
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
          <Modal.Title>{isEditing ? 'Edit Event' : 'Add Event'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleFormSubmit}>
            <Form.Group controlId='name'>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type='text'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group controlId='eventType'>
              <Form.Label>Event Type</Form.Label>
              <Form.Control
                type='text'  // Change to text input as per your requirement
                name='event_type'
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group controlId='startDate'>
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type='date'
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group controlId='endDate'>
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type='date'
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group controlId='venue'>
              <Form.Label>Location</Form.Label>
              <Form.Control
                type='text'
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group controlId='facilitators'>
              <Form.Label>Facilitators</Form.Label>
              <Select
                closeMenuOnSelect={false}
                components={animatedComponents}
                isMulti
                options={facilitators.map(facilitator => ({ value: facilitator.id, label: facilitator.name }))}
                value={formData.facilitators.map(facilitatorId => ({ value: facilitatorId, label: facilitators.find(f => f.id === facilitatorId)?.name }))}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId='lessons'>
              <Form.Label>Lessons</Form.Label>
              <Form.Control
                as='textarea'
                rows={3}
                value={formData.lessons}
                onChange={(e) => setFormData({ ...formData, lessons: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group controlId='learningOutcomes'>
              <Form.Label>Learning Outcomes</Form.Label>
              <Form.Control
                as='textarea'
                rows={3}
                value={formData.learning_outcomes}
                onChange={(e) => setFormData({ ...formData, learning_outcomes: e.target.value })}
                required
              />
            </Form.Group>
            <Button variant='primary' type='submit'>
              {isEditing ? 'Update Event' : 'Add Event'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this event?</Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant='danger' onClick={confirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showEventModal} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Event Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <div>
              <p><strong>Name:</strong> {selectedEvent.name}</p>
              <p><strong>Event Type:</strong> {selectedEvent.event_type}</p>
              <p><strong>Start Date:</strong> {selectedEvent.start_date}</p>
              <p><strong>End Date:</strong> {selectedEvent.end_date}</p>
              <p><strong>Location:</strong> {selectedEvent.location}</p>
              <p><strong>Facilitators:</strong> {selectedEvent.facilitators_details.map(facilitator => facilitator.name).join(', ')}</p>
              <p><strong>Lessons:</strong> {selectedEvent.lessons}</p>
              <p><strong>Learning Outcomes:</strong> {selectedEvent.learning_outcomes}</p>
            </div>
          )}
        </Modal.Body>

      </Modal>


    </div>
  );
};

export default Upcoming;
