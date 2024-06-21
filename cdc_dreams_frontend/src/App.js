import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Participants from './components/Participants';
import Events from './components/events/Events';
import Progress from './components/Progress';
import Materials from './components/materials/Materials';
import Report from './components/Report';
import Upcoming from './components/events/Upcoming';
import Ongoing from './components/events/Ongoing';
import Closed from './components/events/Closed';
import 'bootstrap/dist/css/bootstrap.min.css';
import Settings from './components/settings/Settings';
import Age from './components/settings/Age';
import AllMaterials from './components/materials/AllMaterials';
import AssignMaterials from './components/materials/AssignMaterials';
import Facilitators from './components/settings/Facilitators';


function App() {
  return (
    <div className="App">
<BrowserRouter>
<Routes>
<Route path="/" element={<Login />}/>
<Route path="/dashboard" element={<Dashboard />}/>

<Route path="/dashboard" element={<Dashboard />}>
<Route index element={<Report />} />
<Route path="report" element={<Report />}/>
<Route path="participants" element={<Participants />}/>
<Route path="events" element={<Events />}/>
<Route path="progress" element={<Progress />}/>
<Route path="materials" element={<Materials />}/>

<Route path="materials" element={<Materials />}>
<Route index element={<AllMaterials />} />
<Route path="all-materials" element={<AllMaterials />} />
<Route path="assign-materials" element={<AssignMaterials />} />
</Route>

<Route path="settings" element={<Settings />}/>

<Route path="settings" element={<Settings />}>
<Route index element={<Age />} />
<Route path="age-group" element={<Age />}/>
<Route path="facilitators" element={<Facilitators />}/>
</Route>

<Route path="events" element={<Events />}>
<Route index element={<Upcoming />} />
<Route path="upcoming" element={<Upcoming />}/>
<Route path="ongoing" element={<Ongoing />}/>
<Route path="closed" element={<Closed />}/>
</Route>
</Route>




<Route path="*" element={<Navigate to="/" />} />

</Routes>
</BrowserRouter>
    </div>
  );
}

export default App;
