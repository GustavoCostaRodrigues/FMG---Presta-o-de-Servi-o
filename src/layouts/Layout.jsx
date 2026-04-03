import { Outlet } from 'react-router-dom';
import './Layout.css';

const Layout = () => {
    return (
        <div className="layout-root">
            <Outlet />
        </div>
    );
};

export default Layout;
