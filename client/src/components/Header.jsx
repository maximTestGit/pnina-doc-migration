import React from 'react';
import './Header.css';

const Header = ({ user, onLogout }) => {
    return (
        <header className="header">
            <div className="header-content">
                <h1 className="header-title">Pnina Document Migration</h1>
                <div className="header-user">
                    {user && (
                        <>
                            <span className="user-name">{user.name}</span>
                            <button onClick={onLogout} className="logout-button">
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
