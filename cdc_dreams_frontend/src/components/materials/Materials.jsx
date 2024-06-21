import React from 'react';
import '../../css/Material.css';
import { Outlet } from 'react-router-dom';

const Materials = () => {
  return (
   <div className='materials-container'>
    <Outlet />
   </div>
  );
}

export default Materials