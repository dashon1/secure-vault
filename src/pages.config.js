import Activity from './pages/Activity';
import Analytics from './pages/Analytics';
import BulkUpload from './pages/BulkUpload';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Folders from './pages/Folders';
import Upload from './pages/Upload';
import __Layout from './Layout.jsx';
import Login from './pages/Login';


export const PAGES = {
    "Activity": Activity,
    "Analytics": Analytics,
    "BulkUpload": BulkUpload,
    "Dashboard": Dashboard,
    "Documents": Documents,
    "Folders": Folders,
    "Upload": Upload,
    "Login": Login,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};