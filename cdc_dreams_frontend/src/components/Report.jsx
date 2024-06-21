import React, { useEffect, useState } from 'react';
import { FaCalendarDay, FaCalendarMinus, FaCalendarPlus, FaUsers } from 'react-icons/fa';
import CanvasJSReact from '@canvasjs/react-charts';
import '../css/Report.css';

const Report = () => {
  const [totalCount, setTotalCount] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState(0);
  const [ongoingEvents, setOngoingEvents] = useState(0);
  const [closedEvents, setClosedEvents] = useState(0);
  const [eventAttendances, setEventAttendances] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [assessments, setAssessments] = useState({
    completedPercentage: 0,
    selfSufficientPercentage: 0
  });

  const token = localStorage.getItem('token');
  const participantsUrl = 'http://localhost:8000/api/participants/';
  const eventsUrl = 'http://localhost:8000/api/events/';
  const attendancesUrl = 'http://localhost:8000/api/participantattendances/';

  const fetchParticipants = async () => {
    try {
      const response = await fetch(participantsUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setTotalCount(data.length);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(eventsUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const today = new Date();
      const now = new Date().toLocaleDateString();
      
      // Separate events into upcoming, ongoing, and closed
      const upcoming = data.filter(event => new Date(event.start_date) > today);
      const ongoing = data.filter(event => {
        const eventStartDate = new Date(event.start_date).toLocaleDateString();
        return eventStartDate === now;
      });
      const closed = data.filter(event => new Date(event.end_date) < today);
  
      // Map events to include event_attendances
      const eventsWithAttendances = data.map(event => ({
        id: event.id,
        name: event.name,
        event_attendances: event.event_attendances || [] // Assuming event_attendances is an array
      }));
  
      // Update state with counts and events with attendances
      setUpcomingEvents(upcoming.length);
      setOngoingEvents(ongoing.length);
      setClosedEvents(closed.length);
      setEventAttendances(eventsWithAttendances);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchAssessments = async () => {
    try {
      if (selectedEventId) {
        const response = await fetch(`${attendancesUrl}?event=${selectedEventId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch assessments');
        }
        const data = await response.json();
        const eventAssessments = data.filter(assessment => assessment.event === selectedEventId);
        const completedCount = eventAssessments.filter(assessment => assessment.finished_program).length;
        const selfSufficientCount = eventAssessments.filter(assessment => assessment.self_sufficient).length;
        const totalCount = eventAssessments.length;
        const completedPercentage = (completedCount / totalCount) * 100;
        const selfSufficientPercentage = (selfSufficientCount / totalCount) * 100;
        setAssessments({ completedPercentage, selfSufficientPercentage });
      } else {
        setAssessments({ completedPercentage: 0, selfSufficientPercentage: 0 });
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchParticipants();
    fetchAssessments();
  }, [selectedEventId]);

  const doughnutOptions = {
    animationEnabled: true,
    title: {
      text: selectedEventId ? `Completion Assessment for ${eventAttendances.find(event => event.id === selectedEventId)?.name} : ${eventAttendances.find(event => event.id === selectedEventId)?.event_attendances.length}` : 'Completion Status'
    },
    data: [{
      type: 'doughnut',
      startAngle: 60,
      indexLabelFontSize: 10,
      indexLabel: '{label} - {y}%',
      toolTipContent: '<b>{label}:</b> {y}%',
      dataPoints: selectedEventId ? [
        { label: 'Completed Program', y: isNaN(assessments.completedPercentage) ? 0 : assessments.completedPercentage },
        { label: 'Not Completed', y: isNaN(100 - assessments.completedPercentage) ? 0 : 100 - assessments.completedPercentage }
      ] : []
    }]
  };

  const doughnutOptions1 = {
    animationEnabled: true,
    title: {
      text: selectedEventId ? `Sufficiency Assessment for ${eventAttendances.find(event => event.id === selectedEventId)?.name}` : 'Sufficiency Status'
    },
    data: [{
      type: 'doughnut',
      startAngle: 60,
      indexLabelFontSize: 10,
      indexLabel: '{label} - {y}%',
      toolTipContent: '<b>{label}:</b> {y}%',
      dataPoints: selectedEventId ? [
        { label: 'Sufficient', y: isNaN(assessments.selfSufficientPercentage)? 0 : assessments.selfSufficientPercentage },
        { label: 'Insufficient', y: isNaN(100 - assessments.selfSufficientPercentage) ? 0 : 100 - assessments.selfSufficientPercentage }
      ] : []
    }]
  };

  return (
    <div className='report-container'>
      <div className='cards-container'>
        <div className='card'>
          <div className='card-content'>
            <div className='first-content'>
              <p>Participants</p>
              <div className='card-icon'>
                <FaUsers />
              </div>
            </div>
            <div className='second-content'>
              <p>Total participants</p>
              <h2>{totalCount}</h2>
            </div>
          </div>
        </div>
        <div className='card'>
          <div className='card-content'>
            <div className='first-content'>
              <p>Upcoming Events</p>
              <div className='card-icon'>
                <FaCalendarPlus />
              </div>
            </div>
            <div className='second-content'>
              <p>Count</p>
              <h2>{upcomingEvents}</h2>
            </div>
          </div>
        </div>
        <div className='card'>
          <div className='card-content'>
            <div className='first-content'>
              <p>Ongoing Events</p>
              <div className='card-icon'>
                <FaCalendarDay />
              </div>
            </div>
            <div className='second-content'>
              <p>Count</p>
              <h2>{ongoingEvents}</h2>
            </div>
          </div>
        </div>
        <div className='card'>
          <div className='card-content'>
            <div className='first-content'>
              <p>Closed Events</p>
              <div className='card-icon'>
                <FaCalendarMinus />
              </div>
            </div>
            <div className='second-content'>
              <p>Count</p>
              <h2>{closedEvents}</h2>
            </div>
          </div>
        </div>
      </div>
      <div className='graphs-container'>
        <div className='doughnut-graph'>
          <div className='selection-container'>
            <label>Select Event for Completion Status</label>
            <select
              value={selectedEventId || ''}
              onChange={(e) => setSelectedEventId(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value=''>Select an event</option>
              {eventAttendances.map(event => (
                <option key={event.id} value={event.id}>{event.name}</option>
              ))}
            </select>
          </div>
          <CanvasJSReact.CanvasJSChart options={doughnutOptions} />
        </div>

        <div className='doughnut-graph'>
          <CanvasJSReact.CanvasJSChart options={doughnutOptions1} />
        </div>
      </div>
    </div>
  );
};

export default Report;
