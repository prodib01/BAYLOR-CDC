import React from 'react'
import { Outlet } from 'react-router-dom';

const Events = () => {

  return (
    <div className='events-container'>
     <Outlet />
    </div>
  );
}
export default Events