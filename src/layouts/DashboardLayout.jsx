import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F6F6F6]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
