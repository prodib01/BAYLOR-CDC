import React, { useState, useEffect } from 'react';
import { FaEdit, FaEye, FaTrash } from 'react-icons/fa';
import { Modal, Button, Form } from 'react-bootstrap';
import '../../css/Events.css';

const Ongoing = () => {
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;



  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState(null);
  const token = localStorage.getItem('token');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const eventsUrl = 'http://localhost:8000/api/events/';

  useEffect(() => {
    fetchEvents();
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
      
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const today = new Date().toLocaleDateString(); 
  const filteredEvents = events.filter(event => {
    const eventStartDate = new Date(event.start_date).toLocaleDateString();
    return eventStartDate === today;
  });
  

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  const handleDelete = (eventId) => {
    fetch(`${eventsUrl}${eventId}/`, {
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

  const confirmDelete = () => {
    handleDelete(deleteEventId);
    setShowDeleteModal(false);
  };

  const onClose = () => {
    setShowEventModal(false);
    setSelectedEvent(null); 
  };

  return (
    <div className='events-container'>
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
                <td>
                  <button className='view-button' onClick={() => handleViewEvent(event)}>
                    <FaEye />
                  </button>
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

    </div >
  );
};

export default Ongoing