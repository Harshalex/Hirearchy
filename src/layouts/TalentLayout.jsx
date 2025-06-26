import Sidebar from '../components/Sidebar';

function TalentLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F6F6F6]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 w-full overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default TalentLayout; 