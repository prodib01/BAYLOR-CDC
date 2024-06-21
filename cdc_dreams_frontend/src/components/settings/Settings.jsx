import React from 'react'
import { Outlet } from 'react-router-dom'
import '../../css/settings.css';

const Settings = () => {
  return (
    <div className='settings-container'>
      <Outlet />
    </div>
  )
}

export default Settings