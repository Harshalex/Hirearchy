import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import {
  FaSearch,
  FaInfoCircle,
  FaChevronDown,
  FaStar,
  FaRegBookmark,
  FaFilter,
  FaRegUser,
  FaRegBuilding,
  FaRegClock,
  FaRegListAlt,
  FaMapMarkerAlt,
  FaUniversity,
  FaBriefcase,
  FaTimes,
} from "react-icons/fa";
import { HiOutlineUsers } from "react-icons/hi";
import { BsRobot } from "react-icons/bs";
import { useSearchCandidatesMutation } from "../api/candidatesApi";
import { useDispatch, useSelector } from "react-redux";
import { setCandidates } from "../slices/candidatesSlice";
import images from "../common/images.js";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const aiExamples = [
  "Senior React developers with startup experience",
  "UX designers from top tech companies",
  "Product managers who worked at unicorn startups",
  "Data scientist PhD and industry experience",
];

const locationOptions = ["All", "San Francisco, CA", "Austin, TX"];
const experienceOptions = ["All", "5 years", "10 years"];
const companyTypeOptions = ["All", "Tech", "Finance"];
const roleOptions = ["All", "Engineer", "Product Manager"];
const sortOptions = ["Best Match", "Newest First", "Name A–Z"];
const exportOptions = ["Excel", "CSV", "PDF"];
const filterOptions = ["Location", "Years of Experience", "Company Size"];

const filterCategories = [
  { key: "general", label: "General", icon: <FaRegUser className="text-lg" /> },
  { key: "locations", label: "Locations", icon: <FaMapMarkerAlt className="text-lg" /> },
  { key: "job", label: "Job", icon: <FaBriefcase className="text-lg" /> },
  { key: "company", label: "Company", icon: <FaRegBuilding className="text-lg" /> },
  { key: "industry", label: "Industry", icon: <FaRegListAlt className="text-lg" /> },
  { key: "funding", label: "Funding & Revenue", icon: <FaStar className="text-lg" /> },
  { key: "skills", label: "Skills or Keywords", icon: <FaSearch className="text-lg" /> },
  { key: "power", label: "Power Filters", icon: <FaFilter className="text-lg" /> },
  { key: "switch", label: "Likely to Switch", icon: <FaInfoCircle className="text-lg" /> },
  { key: "education", label: "Education", icon: <FaUniversity className="text-lg" /> },
  { key: "languages", label: "Languages", icon: <FaRegUser className="text-lg" /> },
  { key: "boolean", label: "Boolean & Name", icon: <FaRegListAlt className="text-lg" /> },
];

function TalentSearchPage() {
  const [tab, setTab] = useState(1); // 1: AI (default), 0: Manual
  const [searchPrompt, setSearchPrompt] = useState("");
  const [location, setLocation] = useState("All");
  const [experience, setExperience] = useState("All");
  const [companyType, setCompanyType] = useState("All");
  const [role, setRole] = useState("All");
  const [sort, setSort] = useState("Best Match");
  const [showExport, setShowExport] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [manualCandidates, setManualCandidates] = useState([]);
  const [aiCandidates, setAiCandidates] = useState([]);
  const [showManualFilterModal, setShowManualFilterModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [filterSearch, setFilterSearch] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchCandidates, { isLoading, isError }] =
    useSearchCandidatesMutation();
  // State for manual filter values
  const [manualFilterValues, setManualFilterValues] = useState({});
  const reduxCandidates = useSelector(state => state.candidates.list);

  // On mount, initialize local candidates from Redux if present
  useEffect(() => {
    if (reduxCandidates && reduxCandidates.length > 0) {
      if (tab === 0) setManualCandidates(reduxCandidates);
      else setAiCandidates(reduxCandidates);
    }
  }, [reduxCandidates, tab]);

  const handleSearch = async () => {
    try {
      const result = await searchCandidates(searchPrompt).unwrap();
      dispatch(setCandidates(result));
      if (tab === 0) {
        setManualCandidates(result);
      } else {
        setAiCandidates(result);
      }
    } catch (e) {
      if (tab === 0) {
        setManualCandidates([]);
      } else {
        setAiCandidates([]);
      }
      dispatch(setCandidates([]));
      console.error("API error:", e);
    }
  };

  // Filtering logic for manual candidates
  let filteredCandidates = [];
  if (tab === 0) {
    filteredCandidates = reduxCandidates ? [...reduxCandidates] : [];
    // Apply filters if not 'All'
    if (location !== "All") filteredCandidates = filteredCandidates.filter(c => (c.raw_data?.location_country || "") === location);
    if (experience !== "All") filteredCandidates = filteredCandidates.filter(c => (c.raw_data?.experience || "") === experience);
    if (role !== "All") filteredCandidates = filteredCandidates.filter(c => (c.raw_data?.role || "") === role);
    if (companyType !== "All") filteredCandidates = filteredCandidates.filter(c => (c.raw_data?.company_type || "") === companyType);
  } else {
    filteredCandidates = reduxCandidates ? [...reduxCandidates] : [];
  }
  if (sort === "Name A–Z")
    filteredCandidates.sort((a, b) =>
      (a.full_name || "").localeCompare(b.full_name || "")
    );
  if (sort === "Newest First") filteredCandidates.reverse();

  // Utility: Convert candidates to exportable rows
  function getExportRows() {
    return filteredCandidates.map((c) => {
      const raw = c.raw_data || {};
      const educationArr = Array.isArray(raw.education)
        ? raw.education
        : raw.education
        ? [raw.education]
        : [];
      return {
        Name: c.full_name || "",
        Title: c.title || raw.job_title || "",
        Location: raw.location_country || "",
        Education: educationArr[0]?.school?.name || "",
        Degrees: (educationArr[0]?.degrees || []).join(", "),
        Skills: (raw.skills || []).join(", "),
        "Match %": c.match || 92,
        LinkedIn: c.linkedin_url || "",
        Twitter: raw.twitter_url || "",
        GitHub: raw.github_url || "",
      };
    });
  }

  // Export to CSV
  function exportToCSV() {
    const rows = getExportRows();
    if (!rows.length) return;
    const header = Object.keys(rows[0]);
    const csv = [header.join(",")].concat(
      rows.map((row) =>
        header.map((field) => `"${String(row[field] || "").replace(/"/g, '""')}"`).join(",")
      )
    ).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "candidates.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Export to Excel
  function exportToExcel() {
    const rows = getExportRows();
    if (!rows.length) return;
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Candidates");
    XLSX.writeFile(wb, "candidates.xlsx");
  }

  // Export to PDF (readable block format)
  function exportToPDF() {
    const rows = getExportRows();
    if (!rows.length) return;
    const doc = new jsPDF();
    let y = 10;
    doc.setFont("courier", "normal");
    rows.forEach((row, idx) => {
      Object.entries(row).forEach(([key, value]) => {
        doc.text(`${key}: ${value || ""}`, 10, y);
        y += 8;
        if (y > 280) { // page break
          doc.addPage();
          y = 10;
        }
      });
      y += 4;
      if (idx < rows.length - 1) {
        doc.text("-------------------------------", 10, y);
        y += 10;
        if (y > 280) {
          doc.addPage();
          y = 10;
        }
      }
    });
    doc.save("candidates.pdf");
  }

  // Helper to update manual filter values
  function updateManualFilter(key, value) {
    setManualFilterValues((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="px-10 py-8 w-full max-w-full min-h-screen bg-[#F6F6F6] box-border">
      {/* Topbar */}
      <div className="flex items-center justify-between mb-2 sticky top-0 bg-[#F6F6F6] z-20 py-4">
        <div>
          <div className="text-3xl font-extrabold leading-tight">
            Talent Search
          </div>
          <div className="text-gray-500 text-base mt-1">
            Search and discover top talent across the web
          </div>
        </div>
        {/* Only show selected mode as badge/button */}
        <div className="flex items-center gap-3">
          {tab === 0 ? (
            <span className="bg-green-50 text-green-700 font-bold rounded-full px-4 py-1.5 text-sm border border-green-100">Manual Mode</span>
          ) : (
            <span className="bg-green-50 text-green-700 font-bold rounded-full px-4 py-1.5 text-sm border border-green-100">Ai Search Mode</span>
          )}
        </div>
      </div>
      {/* Search Bar */}
      {tab === 1 && (
        <div className="flex items-center gap-3 mt-6 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Find senior engineers with React and Python experience in tech companies"
              value={searchPrompt}
              onChange={(e) => setSearchPrompt(e.target.value)}
              className="w-full border border-gray-200 rounded-full px-5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm bg-[#F8F8F8] pr-12"
            />
            <FaSearch className="absolute right-5 top-4 text-gray-400 text-lg" />
          </div>
          <button
            className="bg-blue-500 text-white font-bold rounded-lg px-6 py-3 text-base shadow hover:bg-blue-800 transition"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      )}
      {/* Mode Switch and Export Row (single line) */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            className={`rounded-lg px-7 py-2.5 text-[15px] font-semibold transition-all duration-150 border shadow-sm h-[44px] ${
              tab === 0
                ? "bg-white text-blue-900 border-blue-500 font-bold shadow-md"
                : "bg-[#F8F8F8] text-gray-500 border-transparent font-medium"
            }`}
            style={{ minWidth: 140 }}
            onClick={() => { setTab(0); setShowManualFilterModal(true); }}
          >
            Manual Search
          </button>
          <button
            className={`rounded-lg bg-blue-500 text-white px-7 py-2.5 text-[15px] font-semibold transition-all duration-150 border shadow-sm h-[44px] flex items-center gap-2 ${
              tab === 1
                ? "bg-blue-500 text-white border-blue-500 font-bold shadow-md"
                : "bg-[#F8F8F8] text-gray-500 border-transparent font-medium"
            }`}
            style={{ minWidth: 140 }}
            onClick={() => setTab(1)}
          >
            <img src={images.logo} alt="AI" /> AI Search
          </button>
        </div>
        <Menu as="div" className="relative">
          <Menu.Button className="border rounded-lg px-5 py-2.5 text-[15px] font-medium flex items-center gap-2 bg-white text-blue-900 min-w-[140px] h-[44px] shadow-sm focus:outline-none">
            Export Result <FaChevronDown className="ml-1 text-base" />
          </Menu.Button>
          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-full bg-white border rounded-lg shadow-lg z-30">
              {exportOptions.map((opt) => (
                <Menu.Item key={opt}>
                  {({ active }) => (
                    <button
                      className={`w-full text-left px-4 py-2 text-[15px] font-normal ${
                        active ? "bg-blue-100" : ""
                      }`}
                      onClick={() => {
                        if (opt === "CSV") exportToCSV();
                        if (opt === "Excel") exportToExcel();
                        if (opt === "PDF") exportToPDF();
                      }}
                    >
                      {opt}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
      {/* Manual Search Filter Modal (Figma-style, panel, gray/opaque background) */}
      {showManualFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#e5e7eb] bg-opacity-80 transition-colors duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col border border-gray-200 pointer-events-auto mx-auto my-8 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-10 py-5 sticky top-0 bg-gradient-to-b from-[#f3f4f6] to-white z-10 shadow-sm relative">
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Edit Your Search Filters</h2>
              <div className="flex items-center gap-3">
                <button
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-lg px-7 py-2 text-base shadow-lg transition-all duration-150"
                  onClick={() => {
                    console.log('Manual Filter Values:', manualFilterValues);
                    setShowManualFilterModal(false);
                  }}
                >
                  Save Changes
                </button>
                <button
                  className="ml-4 p-2 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-150"
                  aria-label="Close modal"
                  onClick={() => setShowManualFilterModal(false)}
                  style={{ marginRight: '-12px' }}
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>
            <div className="flex flex-1 min-h-0">
              {/* Sidebar */}
              <div className="w-64 border-r border-gray-200 flex flex-col bg-[#f7f8fa] h-full">
                <div className="p-4 border-b border-gray-100">
                  <input
                    type="text"
                    placeholder="Search filters"
                    value={filterSearch}
                    onChange={e => setFilterSearch(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  />
                </div>
                <div className="flex-1 overflow-y-auto">
                  {filterCategories.filter(cat => cat.label.toLowerCase().includes(filterSearch.toLowerCase())).map(cat => (
                    <button
                      key={cat.key}
                      className={`w-full flex items-center gap-3 px-5 py-3 text-left text-[15px] font-semibold rounded-lg transition-all duration-100 mb-1
                        ${selectedCategory === cat.key ? "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 shadow font-bold" : "hover:bg-gray-100 text-gray-700"}`}
                      onClick={() => setSelectedCategory(cat.key)}
                    >
                      {cat.icon}
                      {cat.label}
                    </button>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-100 flex items-center gap-2">
                  <input type="checkbox" id="hide-inactive" className="mr-2" />
                  <label htmlFor="hide-inactive" className="text-xs text-gray-500">Hide inactive filters</label>
                </div>
              </div>
              {/* Main Content */}
              <div className="flex-1 flex flex-col h-full overflow-y-auto p-10 bg-[#fcfcfd]">
                {/* General Category Fields */}
                {selectedCategory === "general" && (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Min Experience (Years)</label>
                      <input type="number" className="w-full border rounded px-3 py-2 text-sm" placeholder="0"
                        value={manualFilterValues.minExperience || ''}
                        onChange={e => updateManualFilter('minExperience', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Max Experience (Years)</label>
                      <input type="number" className="w-full border rounded px-3 py-2 text-sm" placeholder="Example: 10 years"
                        value={manualFilterValues.maxExperience || ''}
                        onChange={e => updateManualFilter('maxExperience', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Required Contact Info</label>
                      <select className="w-full border rounded px-3 py-2 text-sm"
                        value={manualFilterValues.requiredContactInfo || 'Match Any'}
                        onChange={e => updateManualFilter('requiredContactInfo', e.target.value)}
                      >
                        <option>Match Any</option>
                        <option>Email</option>
                        <option>Phone</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Hide Viewed or Shortlisted Profiles <span className='ml-1 text-xs text-gray-400'>i</span></label>
                      <select className="w-full border rounded px-3 py-2 text-sm"
                        value={manualFilterValues.hideViewed || "Don't hide profiles"}
                        onChange={e => updateManualFilter('hideViewed', e.target.value)}
                      >
                        <option>Don't hide profiles</option>
                        <option>Hide viewed</option>
                        <option>Hide shortlisted</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">Only Connections <span className="text-xs text-gray-400 ml-1">i</span></label>
                      <select className="w-full border rounded px-3 py-2 text-sm"
                        value={manualFilterValues.onlyConnections || "Don't restrict to connections"}
                        onChange={e => updateManualFilter('onlyConnections', e.target.value)}
                      >
                        <option>Don't restrict to connections</option>
                        <option>Only 1st degree</option>
                        <option>Only 2nd degree</option>
                      </select>
                    </div>
                  </div>
                )}
                {/* Locations Category Fields */}
                {selectedCategory === "locations" && (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Location(s)</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Examples: San Francisco / United States / NYC ..."
                        value={manualFilterValues.location || ''}
                        onChange={e => updateManualFilter('location', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Timezone <span className='ml-1 text-xs text-gray-400'>i</span></label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Select timezone"
                        value={manualFilterValues.timezone || ''}
                        onChange={e => updateManualFilter('timezone', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">Past Locations</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Examples: San Francisco / United States / NYC ..."
                        value={manualFilterValues.pastLocations || ''}
                        onChange={e => updateManualFilter('pastLocations', e.target.value)}
                      />
                    </div>
                  </div>
                )}
                {/* Job Category Fields */}
                {selectedCategory === "job" && (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Job Title</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. Software Engineer"
                        value={manualFilterValues.jobTitle || ''}
                        onChange={e => updateManualFilter('jobTitle', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Seniority</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. Senior"
                        value={manualFilterValues.seniority || ''}
                        onChange={e => updateManualFilter('seniority', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">Job Titles <span className='ml-1 text-xs text-gray-400'>Current Only</span></label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Start typing a job title and select from the list"
                        value={manualFilterValues.currentJobTitles || ''}
                        onChange={e => updateManualFilter('currentJobTitles', e.target.value)}
                      />
                      <button className="mt-2 bg-purple-100 text-purple-700 font-bold rounded px-4 py-2 text-sm">Get Suggestions</button>
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-1">Time Spent at Current Role <span className='ml-1 text-xs text-gray-400'>i</span></label>
                        <div className="flex gap-2">
                          <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Between"
                            value={manualFilterValues.timeSpentBetween || ''}
                            onChange={e => updateManualFilter('timeSpentBetween', e.target.value)}
                          />
                          <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="and"
                            value={manualFilterValues.timeSpentAnd || ''}
                            onChange={e => updateManualFilter('timeSpentAnd', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Minimum Average Tenure <span className='ml-1 text-xs text-gray-400'>i</span></label>
                        <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Select duration"
                          value={manualFilterValues.minAvgTenure || ''}
                          onChange={e => updateManualFilter('minAvgTenure', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">Past Job Titles <span className='ml-1 text-xs text-gray-400'>i</span></label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Start typing a job title and select from the list"
                        value={manualFilterValues.pastJobTitles || ''}
                        onChange={e => updateManualFilter('pastJobTitles', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-1">Job Title Levels <span className='ml-1 text-xs text-gray-400'>i</span></label>
                        <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Select levels"
                          value={manualFilterValues.jobTitleLevels || ''}
                          onChange={e => updateManualFilter('jobTitleLevels', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Job Title Roles <span className='ml-1 text-xs text-gray-400'>i</span></label>
                        <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Select roles"
                          value={manualFilterValues.jobTitleRoles || ''}
                          onChange={e => updateManualFilter('jobTitleRoles', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {/* Company Category Fields */}
                {selectedCategory === "company" && (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Company Name</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. Google"
                        value={manualFilterValues.companyName || ''}
                        onChange={e => updateManualFilter('companyName', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Company Size</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. 1000+"
                        value={manualFilterValues.companySize || ''}
                        onChange={e => updateManualFilter('companySize', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">Company Industries <span className='ml-1 text-xs text-gray-400'>Current + Past</span></label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Finance Related Fields, Tech Industries, Robotic..."
                        value={manualFilterValues.companyIndustries || ''}
                        onChange={e => updateManualFilter('companyIndustries', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">Company Tags</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Clinical Trials, Semiconductor, Licensing etc."
                        value={manualFilterValues.companyTags || ''}
                        onChange={e => updateManualFilter('companyTags', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">Company HQ Locations</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Examples: San Francisco / United States / NYC ..."
                        value={manualFilterValues.companyHQLocations || ''}
                        onChange={e => updateManualFilter('companyHQLocations', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">Company Founded After</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Founding Year"
                        value={manualFilterValues.companyFoundedAfter || ''}
                        onChange={e => updateManualFilter('companyFoundedAfter', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">Company Funding Stages <span className='ml-1 text-xs text-gray-400'>Current + Past</span></label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder=""
                        value={manualFilterValues.companyFundingStages || ''}
                        onChange={e => updateManualFilter('companyFundingStages', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">Estimated Revenue</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder=""
                        value={manualFilterValues.estimatedRevenue || ''}
                        onChange={e => updateManualFilter('estimatedRevenue', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-1">Companies <span className='ml-1 text-xs text-gray-400'>Current + Past</span></label>
                        <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Search for Large recruiting agencies, Google, Indian IT companies, etc."
                          value={manualFilterValues.companies || ''}
                          onChange={e => updateManualFilter('companies', e.target.value)}
                        />
                        <button className="mt-2 ml-2 bg-purple-100 text-purple-700 font-bold rounded px-4 py-2 text-sm">Select Preset</button>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Excluded Companies <span className='ml-1 text-xs text-gray-400'>Current Only</span></label>
                        <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Example: Google, Microsoft, Apple, etc."
                          value={manualFilterValues.excludedCompanies || ''}
                          onChange={e => updateManualFilter('excludedCompanies', e.target.value)}
                        />
                        <button className="mt-2 ml-2 bg-purple-100 text-purple-700 font-bold rounded px-4 py-2 text-sm">Select Preset</button>
                      </div>
                    </div>
                  </div>
                )}
                {/* Industry Category Fields */}
                {selectedCategory === "industry" && (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Company Industries <span className='ml-1 text-xs text-gray-400'>Current + Past</span></label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Finance Related Fields, Tech Industries, Robotic..."
                        value={manualFilterValues.industryCompanyIndustries || ''}
                        onChange={e => updateManualFilter('industryCompanyIndustries', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Company Tags</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Clinical Trials, Semiconductor, Licensing etc."
                        value={manualFilterValues.industryCompanyTags || ''}
                        onChange={e => updateManualFilter('industryCompanyTags', e.target.value)}
                      />
                    </div>
                  </div>
                )}
                {/* Funding & Revenue Category Fields */}
                {selectedCategory === "funding" && (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Company Funding Stages <span className='ml-1 text-xs text-gray-400'>Current + Past</span></label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder=""
                        value={manualFilterValues.fundingStages || ''}
                        onChange={e => updateManualFilter('fundingStages', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Estimated Revenue</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder=""
                        value={manualFilterValues.fundingEstimatedRevenue || ''}
                        onChange={e => updateManualFilter('fundingEstimatedRevenue', e.target.value)}
                      />
                    </div>
                  </div>
                )}
                {/* Skills or Keywords Category Fields */}
                {selectedCategory === "skills" && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">Skills or Keywords</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Start typing — select from the list, or just hit enter..."
                        value={manualFilterValues.skills || ''}
                        onChange={e => updateManualFilter('skills', e.target.value)}
                      />
                      <button className="mt-2 bg-purple-100 text-purple-700 font-bold rounded px-4 py-2 text-sm">Get Suggestions</button>
                    </div>
                  </div>
                )}
                {/* Power Filters Category Fields */}
                {selectedCategory === "power" && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">Power Filters <span className='ml-1 text-xs text-gray-400'>Match Any</span></label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['Gender Diversity','Black or African American','Hispanic or Latinx','Promoted','Fast Career Growth (Engineering)','VC-Backed Founder','Board Member','Web3 Experience','VP+ at PE-Backed Company'].map((filter) => (
                          <button
                            key={filter}
                            className={`bg-gray-100 text-gray-700 rounded px-3 py-1 text-xs font-semibold ${manualFilterValues.powerFilters?.includes(filter) ? 'ring-2 ring-blue-400' : ''}`}
                            type="button"
                            onClick={() => {
                              const prev = manualFilterValues.powerFilters || [];
                              updateManualFilter('powerFilters', prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]);
                            }}
                          >
                            {filter}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {/* Likely to Switch Category Fields */}
                {selectedCategory === "switch" && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">Feature available on Growth & Business Plans <span className='ml-1 text-xs text-purple-700 underline cursor-pointer'>Growth & Business</span></label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={manualFilterValues.switchEnableAll || false} onChange={e => updateManualFilter('switchEnableAll', e.target.checked)} /> Enable all
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {['Average Tenure','Recent Layoffs','Company Funding','Vesting','Leadership Changes','Career Stage'].map((filter) => (
                          <button
                            key={filter}
                            className={`bg-gray-100 text-gray-700 rounded px-3 py-1 text-xs font-semibold ${manualFilterValues.switchFilters?.includes(filter) ? 'ring-2 ring-blue-400' : ''}`}
                            type="button"
                            onClick={() => {
                              const prev = manualFilterValues.switchFilters || [];
                              updateManualFilter('switchFilters', prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]);
                            }}
                          >
                            {filter}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {/* Education Category Fields */}
                {selectedCategory === "education" && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">Universities</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="HBCUs, Vanderbilt, All Ivy Leagues, Stanford, etc."
                        value={manualFilterValues.universities || ''}
                        onChange={e => updateManualFilter('universities', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Excluded Universities</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="HBCUs, Vanderbilt, All Ivy Leagues, Stanford, etc."
                        value={manualFilterValues.excludedUniversities || ''}
                        onChange={e => updateManualFilter('excludedUniversities', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">University Locations</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Examples: San Francisco / United States / NYC ..."
                        value={manualFilterValues.universityLocations || ''}
                        onChange={e => updateManualFilter('universityLocations', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Degree Requirements <span className='ml-1 text-xs text-gray-400'>Regular</span></label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder=""
                        value={manualFilterValues.degreeRequirements || ''}
                        onChange={e => updateManualFilter('degreeRequirements', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Fields of Study <span className='ml-1 text-xs text-gray-400'>Regular</span></label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="All Engineering Majors, Natural Sciences, CS, etc."
                        value={manualFilterValues.fieldsOfStudy || ''}
                        onChange={e => updateManualFilter('fieldsOfStudy', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Graduation Year (Min)</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder=""
                        value={manualFilterValues.gradYearMin || ''}
                        onChange={e => updateManualFilter('gradYearMin', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Graduation Year (Max)</label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder=""
                        value={manualFilterValues.gradYearMax || ''}
                        onChange={e => updateManualFilter('gradYearMax', e.target.value)}
                      />
                    </div>
                  </div>
                )}
                {/* Languages Category Fields */}
                {selectedCategory === "languages" && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">Languages <span className='ml-1 text-xs text-gray-400'>Any Proficiency Level</span></label>
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder=""
                        value={manualFilterValues.languages || ''}
                        onChange={e => updateManualFilter('languages', e.target.value)}
                      />
                    </div>
                  </div>
                )}
                {/* Boolean & Name Category Fields */}
                {selectedCategory === "boolean" && (
                  <div className="text-gray-400 text-center py-16">(Boolean & Name filter fields coming soon...)</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* AI Search Examples (if AI tab) */}
      {tab === 1 && (
        <div className="bg-[#F1F7FF] rounded-xl px-8 py-8 mb-6 flex flex-col md:flex-row md:items-center md:gap-12 text-[#1A237E] text-[15px] font-medium shadow-sm">
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex gap-8 flex-wrap mb-2">
              <a
                href="#"
                className="underline hover:text-blue-500 px-3 py-2 rounded-lg bg-white/60"
                onClick={(e) => {
                  e.preventDefault();
                  setSearchPrompt(aiExamples[0]);
                }}
              >
                “{aiExamples[0]}”
              </a>
              <a
                href="#"
                className="underline hover:text-blue-500 px-3 py-2 rounded-lg bg-white/60"
                onClick={(e) => {
                  e.preventDefault();
                  setSearchPrompt(aiExamples[1]);
                }}
              >
                “{aiExamples[1]}”
              </a>
            </div>
            <div className="flex gap-8 flex-wrap">
              <a
                href="#"
                className="underline hover:text-blue-500 px-3 py-2 rounded-lg bg-white/60"
                onClick={(e) => {
                  e.preventDefault();
                  setSearchPrompt(aiExamples[2]);
                }}
              >
                “{aiExamples[2]}”
              </a>
              <a
                href="#"
                className="underline hover:text-blue-500 px-3 py-2 rounded-lg bg-white/60"
                onClick={(e) => {
                  e.preventDefault();
                  setSearchPrompt(aiExamples[3]);
                }}
              >
                “{aiExamples[3]}”
              </a>
            </div>
          </div>
        </div>
      )}
      {/* Found Candidates Row */}
      <div className="flex items-center justify-between mb-4 mt-2">
        <div className="font-semibold text-lg">
          Found Matching Candidates ({filteredCandidates.length})
        </div>
        {/* Filter Button/Dropdown moved here */}
        <Menu as="div" className="relative">
          <Menu.Button className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-[15px] font-medium flex items-center gap-2 shadow-sm h-[44px] ml-2">
            <FaFilter className="text-blue-500 text-lg" /> Filter
            <FaChevronDown className="ml-1 text-base" />
          </Menu.Button>
          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-30">
              {filterOptions.map((opt) => (
                <Menu.Item key={opt}>
                  {({ active }) => (
                    <button
                      className={`w-full text-left px-4 py-2 text-[15px] font-normal ${
                        active ? "bg-blue-100" : ""
                      }`}
                    >
                      {opt}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
      <div className="flex flex-col gap-6">
        {isLoading && (
          <div className="text-center text-gray-400 py-10">
            Loading candidates...
          </div>
        )}
        {isError && (
          <div className="text-center text-red-500 py-10">
            Failed to load candidates.
          </div>
        )}
        {!isLoading &&
          !isError &&
          filteredCandidates.map((c, i) => {
            const raw = c.raw_data || {};
            const educationArr = Array.isArray(raw.education)
              ? raw.education
              : raw.education
              ? [raw.education]
              : [];
            // Fake match % for demo (since not in API)
            const match = c.match || 92;
            return (
              <div
                key={c.id || c.full_name || i}
                className="bg-white rounded-2xl shadow figma-shadow p-6 flex items-start gap-6 border border-gray-100"
              >
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-500 mr-2 border border-gray-200 min-w-[56px]">
                  {c.full_name
                    ? c.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "?"}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg text-gray-800">
                      {c.full_name || "Unknown"}
                    </span>
                    <span className="bg-green-100 text-green-700 font-bold text-xs px-2 py-0.5 rounded ml-1 min-w-[60px] text-center">
                      {match}% Match
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <FaBriefcase className="text-gray-400 text-base" />
                    <span className="block font-medium text-gray-700 text-[15px] leading-tight">
                      {c.title || raw.job_title || ""}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-gray-500 text-[15px] mb-1 items-center">
                    <span className="flex items-center gap-1">
                      <FaMapMarkerAlt className="text-gray-400" />
                      {raw.location_country || ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaUniversity className="text-gray-400" />
                      {educationArr[0]?.school?.name || ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 text-[15px] mb-1">
                    <FaStar className="text-yellow-400" />
                    <span>{educationArr[0]?.degrees?.join(", ")}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {(raw.skills || []).slice(0, 6).map((skill) => (
                      <span
                        key={skill}
                        className="bg-yellow-100 text-gray-800 font-semibold text-xs rounded px-2 py-1"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  {/* Achievements (if any) */}
                  {raw.achievements && raw.achievements.length > 0 && (
                    <div className="flex gap-4 flex-wrap text-[15px] text-gray-600 items-center mb-1">
                      {raw.achievements.map((ach, idx) => (
                        <span key={ach} className="flex items-center gap-1">
                          <FaStar className="text-yellow-400" /> {ach}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-4 flex-wrap text-[15px] text-gray-600 items-center mb-1">
                    {c.linkedin_url && (
                      <a
                        href={
                          c.linkedin_url.startsWith("http")
                            ? c.linkedin_url
                            : `https://${c.linkedin_url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-500"
                      >
                        LinkedIn
                      </a>
                    )}
                    {raw.twitter_url && (
                      <a
                        href={
                          raw.twitter_url.startsWith("http")
                            ? raw.twitter_url
                            : `https://${raw.twitter_url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-500"
                      >
                        Twitter
                      </a>
                    )}
                    {raw.github_url && (
                      <a
                        href={
                          raw.github_url.startsWith("http")
                            ? raw.github_url
                            : `https://${raw.github_url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-500"
                      >
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
                {/* Actions */}
                <div className="flex flex-col items-end gap-2 min-w-[140px]">
                  <button className="border border-gray-200 bg-white text-blue-900 font-bold rounded-lg px-6 py-2 text-base shadow hover:bg-blue-50 transition min-w-[110px]">
                    Shortlist
                  </button>
                  <button
                    className="bg-blue-500 text-white font-bold rounded-lg px-6 py-2 text-base shadow hover:bg-blue-800 transition min-w-[110px]"
                    onClick={() =>
                      navigate(`/talent-search/${i}`, {
                        state: { candidates: filteredCandidates },
                      })
                    }
                  >
                    View Profile
                  </button>
                  {c.linkedin_url && (
                    <a
                      href={
                        c.linkedin_url.startsWith("http")
                          ? c.linkedin_url
                          : `https://${c.linkedin_url}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-50 text-blue-500 rounded-full p-2 mt-1"
                    >
                      <FaRegUser className="text-lg" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

function DropdownMenu({
  value,
  setValue,
  options,
  label,
  icon,
  customClass = "",
}) {
  return (
    <Menu as="div" className={`relative ${customClass}`}>
      <Menu.Button
        className={`border rounded-lg px-4 ${customClass} font-medium flex items-center gap-2 bg-white text-blue-900 min-w-[140px] h-[44px] focus:outline-none`}
      >
        {icon}
        {value === "All" ? label : value}{" "}
        <FaChevronDown className="ml-1 text-base" />
      </Menu.Button>
      <Transition
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 mt-2 w-full bg-white border rounded-lg shadow-lg z-30">
          {options.map((opt) => (
            <Menu.Item key={opt}>
              {({ active }) => (
                <button
                  className={`w-full text-left px-4 py-2 text-[15px] font-normal ${
                    active ? "bg-blue-100" : ""
                  }`}
                  onClick={() => setValue(opt)}
                >
                  {opt}
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

export default TalentSearchPage;
