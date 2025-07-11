import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import { LuBuilding } from "react-icons/lu";
import { SlLocationPin } from "react-icons/sl";
import { RiGraduationCapLine } from "react-icons/ri";
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
import { IoSparklesOutline } from "react-icons/io5";
import { useSearchCandidatesMutation, useSearchCandidatesWithFiltersMutation } from "../api/candidatesApi";
import { useDispatch, useSelector } from "react-redux";
import { setCandidates } from "../slices/candidatesSlice";
import images from "../common/images.js";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AISearch from '../components/AISearch';
import ManualSearch from '../components/ManualSearch';

const aiExamples = [
  "Senior React developers with startup experience",
  "UX designers from top tech companies",
  "Product managers who worked at unicorn startups",
  "Data scientist PhD and industry experience",
];

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
  const [selectedLocation, setSelectedLocation] = useState("All");
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
  const [isManualSearchLoading, setIsManualSearchLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [searchCandidates, { isLoading, isError }] = useSearchCandidatesMutation();
  const [searchCandidatesWithFilters] = useSearchCandidatesWithFiltersMutation();
  
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

  // Restore searchPrompt from navigation state if present
  useEffect(() => {
    if (location.state?.searchPrompt) {
      setSearchPrompt(location.state.searchPrompt);
    }
  }, [location.state]);

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

  // New function to handle manual search with filters
  const handleManualSearch = async () => {
    setIsManualSearchLoading(true);
    try {
      const result = await searchCandidatesWithFilters(manualFilterValues).unwrap();
      dispatch(setCandidates(result));
      setManualCandidates(result);
      setShowManualFilterModal(false);
    } catch (e) {
      setManualCandidates([]);
      dispatch(setCandidates([]));
      console.error("Manual search API error:", e);
    } finally {
      setIsManualSearchLoading(false);
    }
  };

  // Filtering logic for manual candidates
  let filteredCandidates = [];
  if (tab === 0) {
    filteredCandidates = reduxCandidates ? [...reduxCandidates] : [];
    // Apply filters if not 'All'
    if (selectedLocation !== "All")
      filteredCandidates = filteredCandidates.filter(
        (c) => (c.raw_data?.location_country || "") === selectedLocation
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

  // Add handler to sync AI prompt parsing to manual filters
  const handlePromptParsed = (parsed) => {
    if (!parsed) return;

    setManualFilterValues((prev) => {
      const next = {
        ...prev,
        ...(parsed.minExperience && { minExperience: parsed.minExperience }),
        ...(parsed.maxExperience && { maxExperience: parsed.maxExperience }),
        ...(parsed.location && { location: String(parsed.location) }),
        ...(parsed.skills && { skills: Array.isArray(parsed.skills) ? parsed.skills : String(parsed.skills).split(',').map(s => s.trim()).filter(Boolean) }),
        ...(parsed.jobTitle && { jobTitle: parsed.jobTitle }),
        ...(parsed.universities && { universities: parsed.universities }),
        ...(parsed.companyName && { companyName: parsed.companyName }),
        ...(parsed.industry && { industry: parsed.industry }),
        ...(parsed.fundingStage && { fundingStage: parsed.fundingStage }),
        ...(parsed.revenue && { revenue: parsed.revenue }),
      };
      // Only update if something actually changed
      const keys = Object.keys(next);
      for (let key of keys) {
        if (Array.isArray(next[key]) && Array.isArray(prev[key])) {
          if (next[key].join(',') !== prev[key].join(',')) return next;
        } else if (next[key] !== prev[key]) {
          return next;
        }
      }
      return prev; // No change, don't update state
    });
  };

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
        <AISearch
          searchPrompt={searchPrompt}
          setSearchPrompt={setSearchPrompt}
          onPromptParsed={handlePromptParsed}
          onSearch={handleSearch}
          isLoading={isLoading}
          aiExamples={aiExamples}
        />
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
      <ManualSearch
        manualFilterValues={manualFilterValues}
        setManualFilterValues={setManualFilterValues}
        onManualSearch={handleManualSearch}
        isLoading={isManualSearchLoading}
        show={showManualFilterModal}
        onClose={() => setShowManualFilterModal(false)}
        filterCategories={filterCategories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        filterSearch={filterSearch}
        setFilterSearch={setFilterSearch}
        updateManualFilter={updateManualFilter}
      />
      {/* AI Search Examples (if AI tab) */}
      {tab === 1 && (
        <div className="rounded-[32px] px-12 py-10 mb-6 w-full min-h-[120px] flex flex-col justify-center" style={{ background: 'rgba(224, 233, 255, 1)', boxShadow: 'none' }}>
          {/* Heading Row */}
          <div className="flex items-center mb-6">
            <IoSparklesOutline className="text-[#7B8CFF] text-xl mr-3 mt-[-2px]" />
            <span className="text-[18px] font-semibold text-[#181C32]">AI Search Examples</span>
          </div>
          {/* Examples: Two columns, smaller font, spaced far apart */}
          <div className="flex flex-row gap-0 w-full">
            <div className="flex flex-col gap-6 flex-1">
              <a
                href="#"
                className="underline text-[#4F7FFF] hover:text-[#2B5CD6] text-[15px] font-medium leading-tight"
                style={{background: 'none', borderRadius: 0, padding: 0}}
                onClick={e => { e.preventDefault(); setSearchPrompt(aiExamples[0]); }}
              >
                "{aiExamples[0]}"
              </a>
              <a
                href="#"
                className="underline text-[#4F7FFF] hover:text-[#2B5CD6] text-[15px] font-medium leading-tight"
                style={{background: 'none', borderRadius: 0, padding: 0}}
                onClick={e => { e.preventDefault(); setSearchPrompt(aiExamples[1]); }}
              >
                "{aiExamples[1]}"
              </a>
            </div>
            <div className="flex flex-col gap-6 flex-1">
              <a
                href="#"
                className="underline text-[#4F7FFF] hover:text-[#2B5CD6] text-[15px] font-medium leading-tight"
                style={{background: 'none', borderRadius: 0, padding: 0}}
                onClick={e => { e.preventDefault(); setSearchPrompt(aiExamples[2]); }}
              >
                "{aiExamples[2]}"
              </a>
              <a
                href="#"
                className="underline text-[#4F7FFF] hover:text-[#2B5CD6] text-[15px] font-medium leading-tight"
                style={{background: 'none', borderRadius: 0, padding: 0}}
                onClick={e => { e.preventDefault(); setSearchPrompt(aiExamples[3]); }}
              >
                "{aiExamples[3]}"
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
            No candidates found matching your criteria
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
                <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center text-2xl text-gray-400 mr-4 border border-gray-200 min-w-[48px]">
                  <FaRegUser />
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
                  <div className="flex items-center gap-2 mb-1 py-1">
                    <LuBuilding className="text-gray-400 text-xl" />
                    <a href="#" className="text-gray-500 underline font-medium text-[16px] hover:text-[#1a3a8c]">
                      {toTitleCase(jobTitle)}
                    </a>
                    {companyName && <span className="text-[#A0A0A0] text-[15px] ml-2">at {toTitleCase(companyName)}</span>}
                  </div>
                  <div className="flex items-center gap-2 mb-1 text-gray-500 text-[16px] py-1">
                    <SlLocationPin className="text-gray-400 text-xl" />
                    <span>{toTitleCase(raw.location_country || "")}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1 text-gray-500 text-[15px] pb-2">
                    <RiGraduationCapLine className="text-gray-400 text-xl" />
                    <span>{toTitleCase(educationArr[0]?.school?.name || "")}</span>
                  </div>
                  {experience && (
                    <div className="text-[#757575] text-[15px] mb-1">"{toTitleCase(experience)}"</div>
                  )}
                  <div className="flex gap-2 flex-wrap mb-2">
                    {skills.slice(0, 6).map((skill, idx) => (
                      <span
                        key={skill}
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${idx === 0 ? 'bg-[rgba(254,249,195,1)] text-[#222] border-[rgba(254,249,195,1)]' : 'bg-white text-[#222] border-[#D0D5DD]'}`}
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
                {/* Actions: all in one row */}
                <div className="flex items-center gap-2 min-w-[180px] justify-end mt-2">
                  <button className="border border-gray-200 bg-white text-gray-700 font-medium rounded-md px-4 py-1.5 text-sm shadow-sm hover:bg-gray-100 transition">
                    Shortlist
                  </button>
                  <button
                    className="bg-blue-500 text-white font-medium rounded-md px-4 py-1.5 text-sm shadow-sm hover:bg-blue-600 transition"
                    onClick={() =>
                      navigate(`/talent-search/${i}`, {
                        state: { candidates: filteredCandidates, searchPrompt },
                      })
                    }
                  >
                    View Profile
                  </button>
                  <button className="bg-white border-2 border-green-400 rounded-full p-2 hover:bg-green-50 transition ml-1">
                    <svg width="18" height="18" fill="none" viewBox="0 0 20 20"><path d="M15 3H5a2 2 0 0 0-2 2v12a1 1 0 0 0 1.447.894L10 15.118l5.553 2.776A1 1 0 0 0 17 17V5a2 2 0 0 0-2-2Z" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
