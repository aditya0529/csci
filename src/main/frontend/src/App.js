import Navbar from './components/navbar';
import Sidebar from './components/sidebar';
import UserLandingPage from './pages/UserLandingPage';
import ViewEntry from './pages/ViewEntry';
import CreateEntry from './pages/CreateEntry';
import './App.css';
import {HashRouter, Route, Routes} from "react-router-dom"
import normalizeUrl from "normalize-url";
import {useEffect, useState} from "react";
import restController from "./utils/useRestController";

function App() {

  const { data: userProfile, isPending, Error } = restController({api: '/userProfile'});

  return (
      <>
        {<Navbar userProfile={userProfile} />}
        {<Sidebar/>}
        <Routes>
          <Route path="/viewEntry" element={<ViewEntry userProfile={userProfile} />}/>
          <Route path="/createEntry" element={<CreateEntry userProfile={userProfile} />}/>
          <Route path="/" element={<UserLandingPage userProfile={userProfile} />}/>
        </Routes>
      </>
  );
}

export default App;
