import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/dashboard/Home';
import Login from '../pages/auth/Login';
import ChapterList from '../pages/dashboard/ChapterList';
import ChapterDetails from '../pages/dashboard/ChapterDrillDown';
import CreateChallenge from '../pages/teacher/CreateChallenge';

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/subjects/:subjectId/chapters" element={<ChapterList />} />
                <Route path="/chapters/:chapterId" element={<ChapterDetails />} />
                <Route path="/teacher/challenge" element={<CreateChallenge />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
