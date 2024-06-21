import React, { useState } from 'react';
import '../css/Dashboard.css';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import {
    FaTable, FaUsers, FaCalendarAlt, FaChartLine, FaBook, FaBell, FaPowerOff, FaCaretDown, FaCaretUp,
    FaCogs
} from 'react-icons/fa';

const Dashboard = () => {
    const navigate = useNavigate();
    const [dropdowns, setDropdowns] = useState({
        events: false,
        settings: false,
    });

    const toggleDropdown = (dropdown) => {
        setDropdowns(prevState => ({
            ...prevState,
            [dropdown]: !prevState[dropdown],
        }));
    };

    const closeDropdown = (dropdown) => {
        setDropdowns(prevState => ({
            ...prevState,
            [dropdown]: false,
        }));
    };

    const Logout = () => {
      
        localStorage.removeItem('token');
        navigate('/login');
    }

    return (
        <div className='dashboard-container'>
            <div className='side-bar'>
                <div className='company-info'>
                    <img src='path/to/your/logo.png' alt='Company Logo' className='company-logo' />
                </div>
                <div className='side-bar-links'>
                    <Link to='/dashboard' className='link-item'>
                        <FaTable />
                        <span>Dashboard</span>
                    </Link>
                    <Link to='participants' className='link-item'>
                        <FaUsers />
                        <span>Participants</span>
                    </Link>
                    <div className='link-item' onClick={() => toggleDropdown('events')}>
                        <FaCalendarAlt />
                        <span>Events</span>
                        {dropdowns.events ? <FaCaretUp /> : <FaCaretDown />}
                    </div>
                    {dropdowns.events && (
                        <div className='dropdown'>
                            <Link to='events/upcoming' className='dropdown-item' onClick={() => closeDropdown('events')}>Upcoming</Link>
                            <Link to='events/ongoing' className='dropdown-item' onClick={() => closeDropdown('events')}>Ongoing</Link>
                            <Link to='events/closed' className='dropdown-item' onClick={() => closeDropdown('events')}>Closed</Link>
                        </div>
                    )}
                    <Link to='progress' className='link-item'>
                        <FaChartLine />
                        <span>Progress</span>
                    </Link>
                    <div className='link-item' onClick={() => toggleDropdown('materials')}>
                        <FaBook />
                        <span>Materials</span>
                        {dropdowns.settings ? <FaCaretUp /> : <FaCaretDown />}
                    </div>
                    {dropdowns.materials && (
                        <div className='dropdown'>
                            <Link to='materials/all-materials' className='dropdown-item' onClick={() => closeDropdown('materials')}>Materials</Link>
                            <Link to='materials/assign-materials' className='dropdown-item' onClick={() => closeDropdown('materials')}>Material Assignment</Link>
                        </div>
                    )}
                    <div className='link-item' onClick={() => toggleDropdown('settings')}>
                        <FaCogs />
                        <span>Settings</span>
                        {dropdowns.settings ? <FaCaretUp /> : <FaCaretDown />}
                    </div>
                    {dropdowns.settings && (
                        <div className='dropdown'>
                            <Link to='settings/age-group' className='dropdown-item' onClick={() => closeDropdown('settings')}>Age Group</Link>
                            <Link to='settings/facilitators' className='dropdown-item' onClick={() => closeDropdown('settings')}>Facilitators</Link>
                        </div>
                    )}
                </div>
            </div>
            <div className='main-content'>
                <div className='nav-bar'>
                    <div className='logout-icon' onClick={Logout}>
                        <FaPowerOff />
                    </div>
                </div>
                <div className='content'>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
