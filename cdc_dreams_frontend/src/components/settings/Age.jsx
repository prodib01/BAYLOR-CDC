import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Modal, Button, Form } from 'react-bootstrap';

const Age = () => {
  const [age, setAge] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    group: '',
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const url = 'http://localhost:8000/api/agegroups/';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAgeGroups();
  }, []);

  const fetchAgeGroups = async () => {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setAge(data);
    } catch (error) {
      console.error('Error fetching age groups:', error);
      
    }
  };
  

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = age.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(age.length / itemsPerPage);
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${url}${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete');
      }
      setAge(age.filter((age) => age.id !== id));
    } catch (error) {
      console.error('Failed to delete', error);
    }
  };

  const handleAddAgeGroup = () => {
    setFormData({
      group: '',
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = (age) => {
    setFormData({
      ...age,
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, group: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const ageData = {
      group: formData.group,
    };

    if (isEditing) {
      fetch(`${url}${formData.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(ageData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to update data');
          }
          return response.json();
        })
        .then((data) => {
          setAge(age.map((item) => (item.id === data.id ? data : item)));
          setShowModal(false);
        })
        .catch((error) => {
          console.error('Failed to update data', error);
        });
    } else {
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(ageData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to add data');
          }
          return response.json();
        })
        .then((data) => {
          setAge([...age, data]);
          setShowModal(false);
        })
        .catch((error) => {
          console.error('Failed to add data', error);
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
        <button className='add-button' onClick={handleAddAgeGroup}>
          Add
        </button>
      </div>
      <div className='settings-table'>
        <table>
          <thead>
            <tr>
              <th>Groups</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item.id}>
                <td>{item.group}</td>
                <td>
                  <button className='edit-button' onClick={() => handleEdit(item)}>
                    <FaEdit />
                  </button>
                  <button className='delete-button' onClick={() => {setDeleteId(item.id); setShowDeleteModal(true);}}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className='pagination'>
          {Array.from({ length: totalPages }, (_, index) => (
            <button key={index} onClick={() => handlePageChange(index + 1)}>
              {index + 1}
            </button>
          ))}
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Age Group' : 'Add Age Group'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleFormSubmit}>
            <Form.Group controlId='group'>
              <Form.Label>Age Group</Form.Label>
              <Form.Control
                type='text'
                value={formData.group}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Button variant='primary' type='submit'>
              {isEditing ? 'Edit Age group' : 'Add Age group'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this age group?</Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant='danger' onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Age;
