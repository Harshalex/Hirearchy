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
  {
    key: "locations",
    label: "Locations",
    icon: <FaMapMarkerAlt className="text-lg" />,
  },
  { key: "job", label: "Job", icon: <FaBriefcase className="text-lg" /> },
  {
    key: "company",
    label: "Company",
    icon: <FaRegBuilding className="text-lg" />,
  },
  {
    key: "industry",
    label: "Industry",
    icon: <FaRegListAlt className="text-lg" />,
  },
  {
    key: "funding",
    label: "Funding & Revenue",
    icon: <FaStar className="text-lg" />,
  },
  {
    key: "skills",
    label: "Skills or Keywords",
    icon: <FaSearch className="text-lg" />,
  },
  {
    key: "power",
    label: "Power Filters",
    icon: <FaFilter className="text-lg" />,
  },
  {
    key: "switch",
    label: "Likely to Switch",
    icon: <FaInfoCircle className="text-lg" />,
  },
  {
    key: "education",
    label: "Education",
    icon: <FaUniversity className="text-lg" />,
  },
  {
    key: "languages",
    label: "Languages",
    icon: <FaRegUser className="text-lg" />,
  },
  {
    key: "boolean",
    label: "Boolean & Name",
    icon: <FaRegListAlt className="text-lg" />,
  },
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
  const reduxCandidates = useSelector((state) => state.candidates.list);

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
    if (location !== "All")
      filteredCandidates = filteredCandidates.filter(
        (c) => (c.raw_data?.location_country || "") === location
      );
    if (experience !== "All")
      filteredCandidates = filteredCandidates.filter(
        (c) => (c.raw_data?.experience || "") === experience
      );
    if (role !== "All")
      filteredCandidates = filteredCandidates.filter(
        (c) => (c.raw_data?.role || "") === role
      );
    if (companyType !== "All")
      filteredCandidates = filteredCandidates.filter(
        (c) => (c.raw_data?.company_type || "") === companyType
      );
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
    const csv = [header.join(",")]
      .concat(
        rows.map((row) =>
          header
            .map((field) => `"${String(row[field] || "").replace(/"/g, '""')}"`)
            .join(",")
        )
      )
      .join("\r\n");
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
        if (y > 280) {
          // page break
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

  // Utility: Capitalize first letter of each word
  function toTitleCase(str) {
    if (!str) return "";
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  useEffect(() => {
    // Try window first
    window.scrollTo(0, 0);

    // Try main scrollable container if you have one
    const main = document.querySelector(
      ".main-scroll, .main-content, main, .overflow-y-auto"
    );
    if (main) main.scrollTop = 0;

    // Fallback: try again after render
    setTimeout(() => {
      window.scrollTo(0, 0);
      if (main) main.scrollTop = 0;
    }, 50);
  }, []);

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
            <span className="bg-green-50 text-green-700 font-bold rounded-full px-4 py-1.5 text-sm border border-green-100">
              Manual Mode
            </span>
          ) : (
            <span className="bg-green-50 text-green-700 font-bold rounded-full px-4 py-1.5 text-sm border border-green-100">
              Ai Search Mode
            </span>
          )}
        </div>
      </div>
      {/* Search Bar */}
      {tab === 1 && (
        <div className="flex items-center gap-6 mt-6 mb-4">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-200 text-2xl pointer-events-none">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Find senior engineers with React and Python experience in tech companies"
              value={searchPrompt}
              onChange={(e) => setSearchPrompt(e.target.value)}
              className="w-full pl-14 pr-4 py-3 rounded-md bg-white border border-gray-100 text-lg placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
              style={{ fontWeight: 500 }}
            />
          </div>
          <button
            className="flex items-center gap-2 px-8 py-3 rounded-md bg-[#7B8CFF] text-white text-lg font-semibold h-[56px] -ml-1 hover:bg-[#6a7be6] transition-all duration-150"
            style={{ boxShadow: "none", border: "none" }}
            onClick={handleSearch}
          >
            <FaSearch className="text-xl" />
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
                : "bg-[#F8F8F8] border-transparent font-medium"
            }`}
            style={{ minWidth: 140 }}
            onClick={() => {
              setTab(0);
              setShowManualFilterModal(true);
            }}
          >
            <img
              src={images.filter}
              alt="Filter"
              className="inline-block h-5 w-5 mr-2 align-middle"
            />
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
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
                Edit Your Search Filters
              </h2>
              <div className="flex items-center gap-3">
                <button
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-lg px-7 py-2 text-base shadow-lg transition-all duration-150"
                  onClick={() => {
                    console.log("Manual Filter Values:", manualFilterValues);
                    setShowManualFilterModal(false);
                  }}
                >
                  Save Changes
                </button>
                <button
                  className="ml-4 p-2 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-150"
                  aria-label="Close modal"
                  onClick={() => setShowManualFilterModal(false)}
                  style={{ marginRight: "-12px" }}
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
                    onChange={(e) => setFilterSearch(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  />
                </div>
                <div className="flex-1 overflow-y-auto">
                  {filterCategories
                    .filter((cat) =>
                      cat.label
                        .toLowerCase()
                        .includes(filterSearch.toLowerCase())
                    )
                    .map((cat) => (
                      <button
                        key={cat.key}
                        className={`w-full flex items-center gap-3 px-5 py-3 text-left text-[15px] font-semibold rounded-lg transition-all duration-100 mb-1
                        ${
                          selectedCategory === cat.key
                            ? "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 shadow font-bold"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                        onClick={() => setSelectedCategory(cat.key)}
                      >
                        {cat.icon}
                        {cat.label}
                      </button>
                    ))}
                </div>
                <div className="p-3 border-t border-gray-100 flex items-center gap-2">
                  <input type="checkbox" id="hide-inactive" className="mr-2" />
                  <label
                    htmlFor="hide-inactive"
                    className="text-xs text-gray-500"
                  >
                    Hide inactive filters
                  </label>
                </div>
              </div>
              {/* Main Content */}
              <div className="flex-1 flex flex-col h-full overflow-y-auto p-10 bg-[#fcfcfd]">
                {/* General Category Fields */}
                {selectedCategory === "general" && (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Min Experience (Years)
                      </label>
                      <input
                        type="number"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="0"
                        value={manualFilterValues.minExperience || ""}
                        onChange={(e) =>
                          updateManualFilter("minExperience", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Max Experience (Years)
                      </label>
                      <input
                        type="number"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="Example: 10 years"
                        value={manualFilterValues.maxExperience || ""}
                        onChange={(e) =>
                          updateManualFilter("maxExperience", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Required Contact Info
                      </label>
                      <select
                        className="w-full border rounded px-3 py-2 text-sm"
                        value={
                          manualFilterValues.requiredContactInfo || "Match Any"
                        }
                        onChange={(e) =>
                          updateManualFilter(
                            "requiredContactInfo",
                            e.target.value
                          )
                        }
                      >
                        <option>Match Any</option>
                        <option>Email</option>
                        <option>Phone</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Hide Viewed or Shortlisted Profiles{" "}
                        <span className="ml-1 text-xs text-gray-400">i</span>
                      </label>
                      <select
                        className="w-full border rounded px-3 py-2 text-sm"
                        value={
                          manualFilterValues.hideViewed || "Don't hide profiles"
                        }
                        onChange={(e) =>
                          updateManualFilter("hideViewed", e.target.value)
                        }
                      >
                        <option>Don't hide profiles</option>
                        <option>Hide viewed</option>
                        <option>Hide shortlisted</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">
                        Only Connections{" "}
                        <span className="text-xs text-gray-400 ml-1">i</span>
                      </label>
                      <select
                        className="w-full border rounded px-3 py-2 text-sm"
                        value={
                          manualFilterValues.onlyConnections ||
                          "Don't restrict to connections"
                        }
                        onChange={(e) =>
                          updateManualFilter("onlyConnections", e.target.value)
                        }
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
                      <label className="block text-sm font-semibold mb-1">
                        Location(s)
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="Examples: San Francisco / United States / NYC ..."
                        value={manualFilterValues.location || ""}
                        onChange={(e) =>
                          updateManualFilter("location", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Timezone{" "}
                        <span className="ml-1 text-xs text-gray-400">i</span>
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="Select timezone"
                        value={manualFilterValues.timezone || ""}
                        onChange={(e) =>
                          updateManualFilter("timezone", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">
                        Past Locations
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="Examples: San Francisco / United States / NYC ..."
                        value={manualFilterValues.pastLocations || ""}
                        onChange={(e) =>
                          updateManualFilter("pastLocations", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
                {/* Job Category Fields */}
                {selectedCategory === "job" && (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Job Title
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="e.g. Software Engineer"
                        value={manualFilterValues.jobTitle || ""}
                        onChange={(e) =>
                          updateManualFilter("jobTitle", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Seniority
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="e.g. Senior"
                        value={manualFilterValues.seniority || ""}
                        onChange={(e) =>
                          updateManualFilter("seniority", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">
                        Job Titles{" "}
                        <span className="ml-1 text-xs text-gray-400">
                          Current Only
                        </span>
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="Start typing a job title and select from the list"
                        value={manualFilterValues.currentJobTitles || ""}
                        onChange={(e) =>
                          updateManualFilter("currentJobTitles", e.target.value)
                        }
                      />
                      <button className="mt-2 bg-purple-100 text-purple-700 font-bold rounded px-4 py-2 text-sm">
                        Get Suggestions
                      </button>
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-1">
                          Time Spent at Current Role{" "}
                          <span className="ml-1 text-xs text-gray-400">i</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="w-full border rounded px-3 py-2 text-sm"
                            placeholder="Between"
                            value={manualFilterValues.timeSpentBetween || ""}
                            onChange={(e) =>
                              updateManualFilter(
                                "timeSpentBetween",
                                e.target.value
                              )
                            }
                          />
                          <input
                            type="text"
                            className="w-full border rounded px-3 py-2 text-sm"
                            placeholder="and"
                            value={manualFilterValues.timeSpentAnd || ""}
                            onChange={(e) =>
                              updateManualFilter("timeSpentAnd", e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">
                          Minimum Average Tenure{" "}
                          <span className="ml-1 text-xs text-gray-400">i</span>
                        </label>
                        <input
                          type="text"
                          className="w-full border rounded px-3 py-2 text-sm"
                          placeholder="Select duration"
                          value={manualFilterValues.minAvgTenure || ""}
                          onChange={(e) =>
                            updateManualFilter("minAvgTenure", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">
                        Past Job Titles{" "}
                        <span className="ml-1 text-xs text-gray-400">i</span>
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="Start typing a job title and select from the list"
                        value={manualFilterValues.pastJobTitles || ""}
                        onChange={(e) =>
                          updateManualFilter("pastJobTitles", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-1">
                          Job Title Levels{" "}
                          <span className="ml-1 text-xs text-gray-400">i</span>
                        </label>
                        <input
                          type="text"
                          className="w-full border rounded px-3 py-2 text-sm"
                          placeholder="Select levels"
                          value={manualFilterValues.jobTitleLevels || ""}
                          onChange={(e) =>
                            updateManualFilter("jobTitleLevels", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">
                          Job Title Roles{" "}
                          <span className="ml-1 text-xs text-gray-400">i</span>
                        </label>
                        <input
                          type="text"
                          className="w-full border rounded px-3 py-2 text-sm"
                          placeholder="Select roles"
                          value={manualFilterValues.jobTitleRoles || ""}
                          onChange={(e) =>
                            updateManualFilter("jobTitleRoles", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
                {/* Company Category Fields */}
                {selectedCategory === "company" && (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="e.g. Google"
                        value={manualFilterValues.companyName || ""}
                        onChange={(e) =>
                          updateManualFilter("companyName", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Company Size
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="e.g. 1000+"
                        value={manualFilterValues.companySize || ""}
                        onChange={(e) =>
                          updateManualFilter("companySize", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">
                        Company Industries{" "}
                        <span className="ml-1 text-xs text-gray-400">
                          Current + Past
                        </span>
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="Finance Related Fields, Tech Industries, Robotic..."
                        value={manualFilterValues.companyIndustries || ""}
                        onChange={(e) =>
                          updateManualFilter(
                            "companyIndustries",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">
                        Company Tags
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="Clinical Trials, Semiconductor, Licensing etc."
                        value={manualFilterValues.companyTags || ""}
                        onChange={(e) =>
                          updateManualFilter("companyTags", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">
                        Company HQ Locations
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="Examples: San Francisco / United States / NYC ..."
                        value={manualFilterValues.companyHQLocations || ""}
                        onChange={(e) =>
                          updateManualFilter(
                            "companyHQLocations",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">
                        Company Founded After
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="Founding Year"
                        value={manualFilterValues.companyFoundedAfter || ""}
                        onChange={(e) =>
                          updateManualFilter(
                            "companyFoundedAfter",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">
                        Company Funding Stages{" "}
                        <span className="ml-1 text-xs text-gray-400">
                          Current + Past
                        </span>
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder=""
                        value={manualFilterValues.companyFundingStages || ""}
                        onChange={(e) =>
                          updateManualFilter(
                            "companyFundingStages",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">
                        Estimated Revenue
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder=""
                        value={manualFilterValues.estimatedRevenue || ""}
                        onChange={(e) =>
                          updateManualFilter("estimatedRevenue", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-1">
                          Companies{" "}
                          <span className="ml-1 text-xs text-gray-400">
                            Current + Past
                          </span>
                        </label>
                        <input
                          type="text"
                          className="w-full border rounded px-3 py-2 text-sm"
                          placeholder="Search for Large recruiting agencies, Google, Indian IT companies, etc."
                          value={manualFilterValues.companies || ""}
                          onChange={(e) =>
                            updateManualFilter("companies", e.target.value)
                          }
                        />
                        <button className="mt-2 ml-2 bg-purple-100 text-purple-700 font-bold rounded px-4 py-2 text-sm">
                          Select Preset
                        </button>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">
                          Excluded Companies{" "}
                          <span className="ml-1 text-xs text-gray-400">
                            Current Only
                          </span>
                        </label>
                        <input
                          type="text"
                          className="w-full border rounded px-3 py-2 text-sm"
                          placeholder="Example: Google, Microsoft, Apple, etc."
                          value={manualFilterValues.excludedCompanies || ""}
                          onChange={(e) =>
                            updateManualFilter(
                              "excludedCompanies",
                              e.target.value
                            )
                          }
                        />
                        <button className="mt-2 ml-2 bg-purple-100 text-purple-700 font-bold rounded px-4 py-2 text-sm">
                          Select Preset
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {/* Industry Category Fields */}
                {selectedCategory === "industry" && (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Company Industries{" "}
                        <span className="ml-1 text-xs text-gray-400">
                          Current + Past
                        </span>
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="Finance Related Fields, Tech Industries, Robotic..."
                        value={
                          manualFilterValues.industryCompanyIndustries || ""
                        }
                        onChange={(e) =>
                          updateManualFilter(
                            "industryCompanyIndustries",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Company Tags
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="Clinical Trials, Semiconductor, Licensing etc."
                        value={manualFilterValues.industryCompanyTags || ""}
                        onChange={(e) =>
                          updateManualFilter(
                            "industryCompanyTags",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                )}
                {/* Funding & Revenue Category Fields */}
                {selectedCategory === "funding" && (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Company Funding Stages{" "}
                        <span className="ml-1 text-xs text-gray-400">
                          Current + Past
                        </span>
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder=""
                        value={manualFilterValues.fundingStages || ""}
                        onChange={(e) =>
                          updateManualFilter("fundingStages", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Estimated Revenue
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder=""
                        value={manualFilterValues.fundingEstimatedRevenue || ""}
                        onChange={(e) =>
                          updateManualFilter(
                            "fundingEstimatedRevenue",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                )}
                {/* Skills or Keywords Category Fields */}
                {selectedCategory === "skills" && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">
                        Skills or Keywords
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="Start typing — select from the list, or just hit enter..."
                        value={manualFilterValues.skills || ""}
                        onChange={(e) =>
                          updateManualFilter("skills", e.target.value)
                        }
                      />
                      <button className="mt-2 bg-purple-100 text-purple-700 font-bold rounded px-4 py-2 text-sm">
                        Get Suggestions
                      </button>
                    </div>
                  </div>
                )}
                {/* Power Filters Category Fields */}
                {selectedCategory === "power" && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">
                        Power Filters{" "}
                        <span className="ml-1 text-xs text-gray-400">
                          Match Any
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {[
                          "Gender Diversity",
                          "Black or African American",
                          "Hispanic or Latinx",
                          "Promoted",
                          "Fast Career Growth (Engineering)",
                          "VC-Backed Founder",
                          "Board Member",
                          "Web3 Experience",
                          "VP+ at PE-Backed Company",
                        ].map((filter) => (
                          <button
                            key={filter}
                            className={`bg-gray-100 text-gray-700 rounded px-3 py-1 text-xs font-semibold ${
                              manualFilterValues.powerFilters?.includes(filter)
                                ? "ring-2 ring-blue-400"
                                : ""
                            }`}
                            type="button"
                            onClick={() => {
                              const prev =
                                manualFilterValues.powerFilters || [];
                              updateManualFilter(
                                "powerFilters",
                                prev.includes(filter)
                                  ? prev.filter((f) => f !== filter)
                                  : [...prev, filter]
                              );
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
                      <label className="block text-sm font-semibold mb-1">
                        Feature available on Growth & Business Plans{" "}
                        <span className="ml-1 text-xs text-purple-700 underline cursor-pointer">
                          Growth & Business
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={
                              manualFilterValues.switchEnableAll || false
                            }
                            onChange={(e) =>
                              updateManualFilter(
                                "switchEnableAll",
                                e.target.checked
                              )
                            }
                          />{" "}
                          Enable all
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {[
                          "Average Tenure",
                          "Recent Layoffs",
                          "Company Funding",
                          "Vesting",
                          "Leadership Changes",
                          "Career Stage",
                        ].map((filter) => (
                          <button
                            key={filter}
                            className={`bg-gray-100 text-gray-700 rounded px-3 py-1 text-xs font-semibold ${
                              manualFilterValues.switchFilters?.includes(filter)
                                ? "ring-2 ring-blue-400"
                                : ""
                            }`}
                            type="button"
                            onClick={() => {
                              const prev =
                                manualFilterValues.switchFilters || [];
                              updateManualFilter(
                                "switchFilters",
                                prev.includes(filter)
                                  ? prev.filter((f) => f !== filter)
                                  : [...prev, filter]
                              );
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
                      <label className="block text-sm font-semibold mb-1">
                        Universities
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="HBCUs, Vanderbilt, All Ivy Leagues, Stanford, etc."
                        value={manualFilterValues.universities || ""}
                        onChange={(e) =>
                          updateManualFilter("universities", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Excluded Universities
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="HBCUs, Vanderbilt, All Ivy Leagues, Stanford, etc."
                        value={manualFilterValues.excludedUniversities || ""}
                        onChange={(e) =>
                          updateManualFilter(
                            "excludedUniversities",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        University Locations
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="Examples: San Francisco / United States / NYC ..."
                        value={manualFilterValues.universityLocations || ""}
                        onChange={(e) =>
                          updateManualFilter(
                            "universityLocations",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Degree Requirements{" "}
                        <span className="ml-1 text-xs text-gray-400">
                          Regular
                        </span>
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder=""
                        value={manualFilterValues.degreeRequirements || ""}
                        onChange={(e) =>
                          updateManualFilter(
                            "degreeRequirements",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Fields of Study{" "}
                        <span className="ml-1 text-xs text-gray-400">
                          Regular
                        </span>
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="All Engineering Majors, Natural Sciences, CS, etc."
                        value={manualFilterValues.fieldsOfStudy || ""}
                        onChange={(e) =>
                          updateManualFilter("fieldsOfStudy", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Graduation Year (Min)
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder=""
                        value={manualFilterValues.gradYearMin || ""}
                        onChange={(e) =>
                          updateManualFilter("gradYearMin", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Graduation Year (Max)
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder=""
                        value={manualFilterValues.gradYearMax || ""}
                        onChange={(e) =>
                          updateManualFilter("gradYearMax", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
                {/* Languages Category Fields */}
                {selectedCategory === "languages" && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold mb-1">
                        Languages{" "}
                        <span className="ml-1 text-xs text-gray-400">
                          Any Proficiency Level
                        </span>
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder=""
                        value={manualFilterValues.languages || ""}
                        onChange={(e) =>
                          updateManualFilter("languages", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
                {/* Boolean & Name Category Fields */}
                {selectedCategory === "boolean" && (
                  <div className="text-gray-400 text-center py-16">
                    (Boolean & Name filter fields coming soon...)
                  </div>
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
            <img src={images.filter} alt="Filter" className="text-blue-500 text-lg" /> Filter
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
            const jobTitle = typeof raw.job_title === "string"
              ? raw.job_title
              : raw.job_title?.title || c.title || "";
            const companyName = typeof raw.company_name === "string"
              ? raw.company_name
              : raw.company_name?.name || "";
            const experience = typeof raw.experience === "string"
              ? raw.experience
              : raw.experience?.title || '';
            const skills = Array.isArray(raw.skills)
              ? raw.skills
              : typeof raw.skills === "string"
              ? [raw.skills]
              : [];
            const achievements = Array.isArray(raw.achievements)
              ? raw.achievements
              : typeof raw.achievements === "string"
              ? [raw.achievements]
              : [];
            return (
              <div
                key={c.id || c.full_name || i}
                className="bg-white rounded-2xl shadow-[0_2px_12px_0_rgba(16,24,40,0.06)] p-6 flex items-start gap-6 border border-gray-100 min-h-[170px]"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center text-lg font-bold text-gray-400 mr-4 border border-gray-200 min-w-[48px]">
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
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-[20px] text-gray-900 leading-tight">
                      {toTitleCase(c.full_name) || "Unknown"}
                    </span>
                    <span className="bg-[#E9F9F1] text-[#2DB67C] font-semibold text-xs px-3 py-1 rounded-full ml-2 min-w-[70px] text-center shadow-sm" style={{fontWeight:600}}>
                      {(c.match || 92) + "% Match"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <FaRegBuilding className="text-gray-400 text-base" />
                    <a href="#" className="text-[#2D5BD1] underline font-medium text-[16px] hover:text-[#1a3a8c]">
                      {toTitleCase(jobTitle)}
                    </a>
                    {companyName && <span className="text-[#A0A0A0] text-[15px] ml-2">at {toTitleCase(companyName)}</span>}
                  </div>
                  <div className="flex items-center gap-2 mb-1 text-gray-500 text-[15px]">
                    <FaMapMarkerAlt className="text-gray-400" />
                    <span>{toTitleCase(raw.location_country || "")}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1 text-gray-500 text-[15px]">
                    <FaUniversity className="text-gray-400" />
                    <span>{toTitleCase(educationArr[0]?.school?.name || "")}</span>
                  </div>
                  {experience && (
                    <div className="text-[#757575] text-[15px] mb-1">"{toTitleCase(experience)}"</div>
                  )}
                  <div className="flex gap-2 flex-wrap mb-2">
                    {skills.slice(0, 6).map((skill, idx) => (
                      <span
                        key={skill}
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${idx === 0 ? 'bg-[#FFF9E5] text-[#222] border-[#F6E9C6]' : 'bg-white text-[#222] border-[#D0D5DD]'}`}
                        style={{minWidth: idx === 0 ? 56 : 0, fontWeight: idx === 0 ? 600 : 500}}
                      >
                        {toTitleCase(skill)}
                      </span>
                    ))}
                  </div>
                  {/* Achievements (if any) */}
                  {achievements.length > 0 && (
                    <div className="flex flex-col gap-1 text-[15px] text-[#757575] mb-1">
                      {achievements.map((ach, idx) => (
                        <span key={ach} className="flex items-center gap-2">
                          <img src={images.star} alt="Star" className="h-5 w-5" /> {toTitleCase(ach)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {/* Actions */}
                <div className="flex flex-col items-end gap-2 min-w-[180px]">
                  <div className="flex gap-3 mb-2">
                    <button className="border border-[#E0E0E0] bg-white text-[#222] font-semibold rounded-lg px-7 py-2 text-base shadow-sm hover:bg-[#F6F6F6] transition min-w-[110px]">
                      Shortlist
                    </button>
                    <button
                      className="bg-[#7B8CFF] text-white font-semibold rounded-lg px-7 py-2 text-base shadow-sm hover:bg-[#6a7be6] transition min-w-[110px]"
                      onClick={() =>
                        navigate(`/talent-search/${i}`, {
                          state: { candidates: filteredCandidates },
                        })
                      }
                    >
                      View Profile
                    </button>
                  </div>
                  <button className="bg-transparent border border-green-400 rounded-full p-2 m-0 hover:opacity-80">
                    <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M15 3H5a2 2 0 0 0-2 2v12a1 1 0 0 0 1.447.894L10 15.118l5.553 2.776A1 1 0 0 0 17 17V5a2 2 0 0 0-2-2Z" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
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
