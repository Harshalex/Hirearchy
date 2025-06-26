import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import {
  FaChevronLeft,
  FaStar,
  FaRegBookmark,
  FaChevronDown,
  FaRegBuilding,
  FaMapMarkerAlt,
  FaUniversity,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import images from "../common/images";

const approveOptions = [
  "Strong Tech Fit",
  "Good Communication",
  "Highly Recommended",
];

// Utility: Capitalize first letter of each word
function toTitleCase(str) {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function CandidateProfilePage() {
  const navigate = useNavigate();
  const { candidateId } = useParams();
  const location = useLocation();
  const reduxCandidates = useSelector((state) => state.candidates.list);
  // Prefer navigation state, fallback to Redux
  const candidates = location.state?.candidates || reduxCandidates;
  const candidate = candidates[Number(candidateId)] || null;
  const [approveValue, setApproveValue] = useState(approveOptions[0]);
  const [approved, setApproved] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [reason, setReason] = useState("");
  const [showRejectedTag, setShowRejectedTag] = useState(false);

  useEffect(() => {
    // Always scroll window to top
    window.scrollTo(0, 0);

    // After render, also scroll any main scrollable container to top
    setTimeout(() => {
      window.scrollTo(0, 0);
      const main = document.querySelector('.main-content, .overflow-y-auto, main, #root');
      if (main) main.scrollTop = 0;
    }, 0);
  }, []);

  if (!candidate)
    return (
      <div className="p-10 text-center text-red-500">
        Candidate not found or failed to load.
      </div>
    );
  const raw = candidate.raw_data || {};
  const educationArr = Array.isArray(raw.education)
    ? raw.education
    : raw.education
    ? [raw.education]
    : [];

  return (
    <div className="px-10 py-8 w-full max-w-full min-h-screen bg-[#F6F6F6] box-border">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          className="flex items-center gap-2 text-blue-900 font-bold text-lg hover:underline"
          onClick={() => navigate("/")}
        >
          <FaChevronLeft /> Back to Search
        </button>
        <div className="text-2xl font-extrabold flex-1">Candidate Profile</div>
        <div className="flex gap-3">
          <button
            className="bg-red-50 text-red-700 border border-red-200 font-bold rounded-md px-6 py-2 text-base shadow hover:bg-red-100 transition"
            onClick={() => {
              setRejected(true);
              setApproved(false);
            }}
          >
            Reject
          </button>
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="bg-green-600 text-white font-bold rounded-md px-6 py-2 text-base shadow hover:bg-green-700 transition flex items-center gap-2">
              Approve <FaChevronDown className="ml-1" />
            </Menu.Button>
            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-56 bg-white border rounded-md shadow-lg z-30">
                {approveOptions.map((opt) => (
                  <Menu.Item key={opt}>
                    {({ active }) => (
                      <button
                        className={`w-full text-left px-4 py-2 text-sm ${
                          active ? "bg-blue-100" : ""
                        }`}
                        onClick={() => {
                          setApproveValue(opt);
                          setApproved(true);
                          setRejected(false);
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
          <button className="bg-blue-100 text-blue-700 font-bold rounded-md px-6 py-2 text-base shadow hover:bg-blue-200 transition">
            Download
          </button>
        </div>
      </div>
      {/* Candidate Card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_0_rgba(16,24,40,0.06)] p-6 flex items-start gap-6 border border-gray-100 min-h-[170px] mb-6 relative">
        <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center text-lg font-bold text-gray-400 mr-4 border border-gray-200 min-w-[48px]">
          {candidate.full_name
            ? candidate.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            : "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-bold text-[20px] text-gray-900 leading-tight">
              {toTitleCase(candidate.full_name) || "Unknown"}
            </span>
            <span className="bg-[#E9F9F1] text-[#2DB67C] font-semibold text-xs px-3 py-1 rounded-full ml-2 min-w-[70px] text-center shadow-sm" style={{fontWeight:600}}>
              {(candidate.match || 92) + "% Match"}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <FaRegBuilding className="text-gray-400 text-base" />
            <a href="#" className="text-[#2D5BD1] underline font-medium text-[16px] hover:text-[#1a3a8c]">
              {toTitleCase(candidate.title || raw.job_title?.title || raw.job_title || "")}
            </a>
            {raw.company_name && <span className="text-[#A0A0A0] text-[15px] ml-2">at {toTitleCase(raw.company_name?.name || raw.company_name || "")}</span>}
          </div>
          <div className="flex items-center gap-2 mb-1 text-gray-500 text-[15px]">
            <FaMapMarkerAlt className="text-gray-400" />
            <span>{toTitleCase(raw.location_country || "")}</span>
          </div>
          <div className="flex items-center gap-2 mb-1 text-gray-500 text-[15px]">
            <FaUniversity className="text-gray-400" />
            <span>{toTitleCase(educationArr[0]?.school?.name || "")}</span>
          </div>
          {raw.experience && (
            <div className="text-[#757575] text-[15px] mb-1">"{toTitleCase(raw.experience)}"</div>
          )}
          <div className="flex gap-2 flex-wrap mb-2">
            {(raw.skills || []).slice(0, 6).map((skill, idx) => (
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
          {Array.isArray(raw.achievements) && raw.achievements.length > 0 && (
            <div className="flex flex-col gap-1 text-[15px] text-[#757575] mb-1">
              {raw.achievements.map((ach, idx) => (
                <span key={ach} className="flex items-center gap-2">
                  <img src={images.star} alt="Star" className="h-5 w-5" /> {toTitleCase(ach)}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 min-w-[180px]">
          <div className="flex gap-3 mb-2">
            <button className="border border-[#E0E0E0] bg-white text-[#222] font-semibold rounded-lg px-7 py-2 text-base shadow-sm hover:bg-[#F6F6F6] transition min-w-[110px]">
              Shortlist
            </button>
            <button
              className="bg-[#7B8CFF] text-white font-semibold rounded-lg px-7 py-2 text-base shadow-sm hover:bg-[#6a7be6] transition min-w-[110px]"
              onClick={() => navigate(-1)}
            >
              View Profile
            </button>
          </div>
          <button className="bg-transparent border border-green-400 rounded-full p-2 m-0 hover:opacity-80">
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M15 3H5a2 2 0 0 0-2 2v12a1 1 0 0 0 1.447.894L10 15.118l5.553 2.776A1 1 0 0 0 17 17V5a2 2 0 0 0-2-2Z" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
      {/* Highlights, Skills, Profile Viewed, Interview Scheduled */}
      <div className="flex gap-6">
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-white rounded-md shadow figma-shadow p-6 border border-gray-100">
            <div className="font-bold text-xl mb-2 flex items-center gap-2 text-yellow-600">
              <FaStar /> Key Highlights
            </div>
            <ul className="text-base text-gray-800 space-y-2">
              {educationArr.map((edu, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-gray-400">🏅</span>{" "}
                  {toTitleCase(edu.school?.name || "")} -{" "}
                  {Array.isArray(edu.degrees) ? edu.degrees.map(toTitleCase).join(", ") : ""}{" "}
                  {Array.isArray(edu.majors) && edu.majors.length > 0
                    ? `(${edu.majors.map(toTitleCase).join(", ")})`
                    : ""}
                </li>
              ))}
              {(raw.skills || []).slice(0, 6).map((skill, i) => (
                <li key={i + "skill"} className="flex items-center gap-2">
                  <span className="text-gray-400">🏅</span> {toTitleCase(skill)}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-white rounded-md shadow figma-shadow p-6 border border-gray-100">
            <div className="font-bold text-xl mb-2">Top Skills</div>
            <div className="flex gap-2 flex-wrap">
              {(raw.skills || []).slice(0, 12).map((skill) => (
                <span
                  key={skill}
                  className="bg-yellow-100 text-gray-800 font-semibold text-xs rounded px-2 py-1 mb-2"
                >
                  {toTitleCase(skill)}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 min-w-[220px]">
          {/* No profileViewed/interviewScheduled in API, so skip */}
        </div>
      </div>
    </div>
  );
}

export default CandidateProfilePage;
