import { Outlet } from 'react-router-dom';
import Header from './header/Header';

const Layout = ({ handleLogout }) => {
    return (
        <div className="app-shell">
            <Header handleLogout={handleLogout} />
            <main className="app-main">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
