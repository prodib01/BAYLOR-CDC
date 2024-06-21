
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
      const upcoming = data.filter(event => new Date(event.start_date) > today);
      const ongoing = data.filter(event => {
        const eventStartDate = new Date(event.start_date).toLocaleDateString();
        return eventStartDate === now;
      });
      const closed = data.filter(event => new Date(event.end_date) < today);

      setUpcomingEvents(upcoming.length);
      setOngoingEvents(ongoing.length);
      setClosedEvents(closed.length);
      // setEventAttendances(data.map(event => ({ id: event.id, name: event.name })));
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchAssessments = async () => {
    try {

      const response = await fetch(attendancesUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
      const data = await response.json();

      // Calculate completion percentage for the selected event
      const selectedEvent = eventAttendances.find(event => event.id === selectedEventId);
      if (selectedEvent) {
    console.log('reached 1');
        const eventAssessments = data.filter(assessment => assessment.event === selectedEvent.id);
        const completedCount = eventAssessments.filter(assessment => assessment.finished_program).length;
        const selfSufficientCount = eventAssessments.filter(assessment => assessment.self_sufficient).length;
        const totalCount = eventAssessments.length;
        const completedPercentage = (completedCount / totalCount) * 100;
        const selfSufficientPercentage = (selfSufficientCount / totalCount) * 100;
        console.log("Percent", completedPercentage);
        // setAssessments({completedPercentage, selfSufficientPercentage });
        assessments.completedPercentage = completedPercentage;
        assessments.selfSufficientPercentage = selfSufficientPercentage;
      } else {
    console.log('reached 2');
    assessments.completedPercentage = 0;
    assessments.selfSufficientPercentage = 0;
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchParticipants();
    fetchAssessments();
  }, [participantsUrl, eventsUrl, attendancesUrl, token, selectedEventId, eventAttendances, assessments]);

  const doughnutOptions = {
    animationEnabled: true,
    title: {
      text: selectedEventId ? `Assessment for ${eventAttendances.find(event => event.id === selectedEventId)?.name}` : 'Completion Status'
    },
    data: [{
      type: 'doughnut',
      startAngle: 60,
      indexLabelFontSize: 17,
      indexLabel: '{label} - {y}%',
      toolTipContent: '<b>{label}:</b> {y}%',
      dataPoints: selectedEventId ? [
        { label: 'Completed Program', y: assessments.completedPercentage },
        { label: 'Not Completed', y: 100 - assessments.completedPercentage }
      ] : []
    }]
  };

  const doughnutOptions1 = {
    animationEnabled: true,
    title: {
      text: selectedEventId ? `Assessment for ${eventAttendances.find(event => event.id === selectedEventId)?.name}` : 'Sufficiency Status'
    },
    data: [{
      type: 'doughnut',
      startAngle: 60,
      indexLabelFontSize: 17,
      indexLabel: '{label} - {y}%',
      toolTipContent: '<b>{label}:</b> {y}%',
      dataPoints: selectedEventId ? [
        { label: 'Sufficient', y: Math.random() * 100 }, // Example random data
        { label: 'Insufficient', y: Math.random() * 100 }
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
        <div className='line-graph'>
          {/* Placeholder for line graph */}
        </div>
        <div className='doughnut-graph'>
          <div className='first-graph'>
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
          <div className='second-graph'>
            <div className='selection-container'>
              <label>Select Event for Sufficiency Status</label>
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
            <CanvasJSReact.CanvasJSChart options={doughnutOptions1} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
