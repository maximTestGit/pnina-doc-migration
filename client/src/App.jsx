import React from 'react';
import { AuthWrapper, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

const AppContent = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return user ? <Dashboard /> : <Login />;
};

const App = () => {
    return (
        <AuthWrapper>
            <AppContent />
        </AuthWrapper>
    );
};

export default App;
