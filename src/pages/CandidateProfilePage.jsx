import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import { LuBuilding } from "react-icons/lu";
import { SlLocationPin } from "react-icons/sl";
import { RiGraduationCapLine } from "react-icons/ri";

import {
  FaChevronLeft,
  FaStar,
  FaRegBookmark,
  FaChevronDown,
  FaRegBuilding,
  FaMapMarkerAlt,
  FaUniversity,
  FaEnvelope,
  FaPhoneAlt,
  FaGlobe,
  FaRegUser,
} from "react-icons/fa";
import { SiLinkedin } from "react-icons/si";
import { useSelector } from "react-redux";
import images from "../common/images";
import { RxCrossCircled } from "react-icons/rx";
import { FiCheckCircle } from "react-icons/fi";

const approveOptions = [
  "Strong Tech Fit",
  "Good Communication",
  "Highly Recommended",
];

// Utility: Capitalize first letter of each word
function toTitleCase(str) {
  if (!str) return "";
  if (typeof str !== "string") str = String(str);
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
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
  // Tag state
  const [approvedTag, setApprovedTag] = useState("");
  const [rejectedTag, setRejectedTag] = useState(false);
  const [showReasonInput, setShowReasonInput] = useState(false);

  useEffect(() => {
    // Always scroll window to top
    window.scrollTo(0, 0);

    // After render, also scroll any main scrollable container to top
    setTimeout(() => {
      window.scrollTo(0, 0);
      const main = document.querySelector(
        ".main-content, .overflow-y-auto, main, #root"
      );
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

  // --- Candidate Card Data Mapping ---
  const initials = (candidate.full_name || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const matchPercent = candidate.match || 92;
  const jobTitle =
    candidate.title || raw.job_title?.name || raw.job_title || "";
  const company =
    raw.job_company_name ||
    candidate.company ||
    raw.company_name?.name ||
    raw.company_name ||
    "";
  const candidateLocation =
    raw.job_company_location_name || raw.location_country || "";
  // Education
  let educationLine = "";
  if (educationArr.length > 0) {
    const edu = educationArr[0];
    if (edu.school?.name) educationLine += edu.school.name;
    if (Array.isArray(edu.majors) && edu.majors.length > 0)
      educationLine += ", " + edu.majors[0];
  }
  // Experience summary
  let experienceSummary = "";
  if (Array.isArray(raw.experience) && raw.experience.length > 0) {
    const exp = raw.experience[0];
    if (exp.title?.name && exp.company?.name) {
      experienceSummary = `${exp.title.name} at ${exp.company.name}`;
    } else if (exp.title?.name) {
      experienceSummary = exp.title.name;
    }
  } else if (typeof raw.experience === "string") {
    experienceSummary = raw.experience;
  }
  // Contact info
  const email =
    raw.emails && Array.isArray(raw.emails) ? raw.emails[0] : raw.email || "";
  const phone =
    raw.phone_numbers && Array.isArray(raw.phone_numbers)
      ? raw.phone_numbers[0]
      : "";
  const website = raw.website || raw.personal_website || "";
  // LinkedIn logic: prefer raw_data.linkedin_url, fallback to profiles
  let linkedinUrl = raw.linkedin_url || candidate.linkedin_url || "";
  let linkedinUsername = "";
  if (!linkedinUrl && Array.isArray(raw.profiles)) {
    const linkedinProfile = raw.profiles.find((p) => p.network === "linkedin");
    if (linkedinProfile) {
      linkedinUrl = linkedinProfile.url;
      linkedinUsername = linkedinProfile.username;
    }
  } else if (linkedinUrl) {
    // Extract username from url
    const match = linkedinUrl.match(/linkedin.com\/in\/([a-zA-Z0-9-_.]+)/);
    linkedinUsername = match
      ? match[1]
      : linkedinUrl
          .replace("https://linkedin.com/in/", "")
          .replace("linkedin.com/in/", "");
  }
  if (linkedinUrl && !linkedinUrl.startsWith("http"))
    linkedinUrl = "https://" + linkedinUrl;
  // Skills
  const skills = Array.isArray(raw.skills) ? raw.skills : [];
  // Achievements
  const achievements = Array.isArray(raw.achievements)
    ? raw.achievements.filter((a) => typeof a === "string")
    : [];

  // --- Key Highlights ---
  const highlights = [];
  if (educationLine) highlights.push(educationLine);
  if (
    educationArr.length > 0 &&
    Array.isArray(educationArr[0].degrees) &&
    educationArr[0].degrees.length > 0
  )
    highlights.push(educationArr[0].degrees[0]);
  if (educationArr.length > 0 && educationArr[0].end_date)
    highlights.push("Graduated in " + educationArr[0].end_date);
  achievements.forEach((a) => highlights.push(a));

  // Approve handler
  function handleApprove(option) {
    setApprovedTag(option);
    setRejectedTag(false);
    setShowReasonInput(false);
  }
  // Reject handler
  function handleReject() {
    setShowReasonInput(true);
    setApprovedTag("");
    setRejectedTag(false);
  }
  // Send reason handler
  function handleSendReason() {
    if (reason.trim()) {
      setRejectedTag(true);
      setApprovedTag("");
      setShowReasonInput(false);
    }
  }

  return (
    <div className="px-6 py-6 w-full max-w-full min-h-screen bg-[#F8F9FA] box-border">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          className="flex items-center gap-2 text-blue-900 font-bold text-lg hover:underline"
          onClick={() => navigate("/talent-search")}
        >
          <FaChevronLeft /> Back to Search
        </button>
        <div className="text-2xl font-extrabold flex-1">Candidate Profile</div>
        <div className="flex gap-3">
          <button
            className="bg-red-50 text-red-700 border border-red-200 font-bold rounded-md px-6 py-2 text-base shadow hover:bg-red-100 transition flex items-center gap-2"
            onClick={handleReject}
          >
            <RxCrossCircled className="text-red-500 text-lg" />
            Reject
          </button>
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="bg-green-600 text-white font-bold rounded-md px-6 py-2 text-base shadow hover:bg-green-700 transition flex items-center gap-2">
              <FiCheckCircle className="text-green-200 text-lg" />
              Approve
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
                        onClick={() => handleApprove(opt)}
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

      {/* Main Candidate Card */}
      <div
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6 relative"
        style={{ boxShadow: "0 4px 24px 0 rgba(16,24,40,0.14)" }}
      >
        {/* Approve/Reject Tag */}
        {approvedTag && (
          <span className="absolute top-4 right-20 bg-green-100 text-green-700 font-semibold px-4 py-1 rounded-full text-sm shadow-sm z-10">
            Approved: {approvedTag}
          </span>
        )}
        {rejectedTag && (
          <span className="absolute top-4 right-20 bg-red-100 text-red-700 font-semibold px-4 py-1 rounded-full text-sm shadow-sm z-10">
            Rejected
          </span>
        )}
        <div className="flex items-start gap-4">
          {/* Profile Avatar */}
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl text-blue-400 min-w-[64px] border-2 border-blue-200">
            <FaRegUser />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Name and Match */}
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {toTitleCase(candidate.full_name) || "Unknown"}
              </h1>
              <span className="bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
                {matchPercent}% Match
              </span>
            </div>

            {/* Job Title & Company */}
            {jobTitle && (
              <div className="flex items-center gap-2 mb-4">
                <LuBuilding className="text-gray-400 text-xl " />
                <span className="text-gray-600 font-medium capitalize">
                  {toTitleCase(jobTitle)}
                  {company && (
                    <span className="text-gray-500 font-normal capitalize">
                      {" "}
                      at {toTitleCase(company)}
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* Location */}
            {candidateLocation && (
              <div className="flex items-center gap-2 mb-4">
                <SlLocationPin className="text-gray-400 text-xl" />
                <span className="text-gray-600 capitalize">
                  {toTitleCase(candidateLocation)}
                </span>
              </div>
            )}

            {/* Education */}
            {educationLine && (
              <div className="flex items-center gap-2 mb-4">
                <RiGraduationCapLine className="text-gray-400 text-xl" />
                <span className="text-gray-600 capitalize">
                  {toTitleCase(educationLine)}
                </span>
              </div>
            )}

            {/* Experience Quote */}
            {experienceSummary && (
              <div className="text-gray-500 text-sm mb-4 italic">
                "{toTitleCase(experienceSummary)}"
              </div>
            )}

            {/* Contact Information Row */}
            {(email || phone || website || linkedinUrl) && (
              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-500">
                {email && (
                  <div className="flex items-center gap-1">
                    <FaEnvelope className="text-gray-400" />
                    <span>{email}</span>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-1">
                    <FaPhoneAlt className="text-gray-400" />
                    <span>{phone}</span>
                  </div>
                )}
                {website && (
                  <div className="flex items-center gap-1">
                    <FaGlobe className="text-gray-400" />
                    <span>{website}</span>
                  </div>
                )}
                {linkedinUrl && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-gray-500 hover:underline"
                  >
                    <SiLinkedin className="text-blue-600" />
                    <span>{linkedinUsername || "LinkedIn"}</span>
                  </a>
                )}
              </div>
            )}

            {/* Skills Tags */}
            {skills.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-3">
                {skills.slice(0, 6).map((skill, idx) => (
                  <span
                    key={skill}
                    className={
                      idx === 0
                        ? "bg-yellow-100 text-yellow-800 text-xs font-medium px-3 py-1 rounded-full border border-yellow-200 capitalize"
                        : "bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full border border-gray-200 capitalize"
                    }
                  >
                    {toTitleCase(skill)}
                  </span>
                ))}
              </div>
            )}

            {/* First two Key Highlights (star icon + text) */}
            {highlights.slice(0, 2).map((highlight, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-gray-700 text-sm mb-4"
              >
                <img src={images.star} alt="Star" className="h-5 w-5" />
                <span className="capitalize">{toTitleCase(highlight)}</span>
              </div>
            ))}

            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="space-y-1">
                {achievements.map((achievement, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <FaStar className="text-yellow-500 text-xs" />
                    <span className="capitalize">
                      {toTitleCase(achievement)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Only keep the bookmark button */}
          <div className="flex flex-col items-end gap-3 min-w-[48px] mt-2">
            <button className="bg-white border-2 border-green-400 rounded-full p-2 hover:bg-green-50 transition">
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                <path
                  d="M15 3H5a2 2 0 0 0-2 2v12a1 1 0 0 0 1.447.894L10 15.118l5.553 2.776A1 1 0 0 0 17 17V5a2 2 0 0 0-2-2Z"
                  stroke="#22C55E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Reason Section (only show if rejecting) */}
        {showReasonInput && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Reason</h3>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Add Comment"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                className="bg-white text-white p-2 border-1 border-blue-600 hover:bg-blue-200 rounded-full  transition"
                onClick={handleSendReason}
              >
                <img src={images.send} alt="" srcset="" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Key Highlights and Skills Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Highlights */}
        <div
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          style={{ boxShadow: "0 4px 24px 0 rgba(16,24,40,0.14)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <FaStar className="text-yellow-500 text-xl" />
            <h2 className="text-xl font-bold text-gray-900">Key Highlights</h2>
          </div>
          <div className="space-y-3">
            {highlights.map((highlight, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <img
                  src={images.badge}
                  alt=""
                  className="w-5 h-5 object-contain self-start mt-0.5"
                />
                <span className="text-gray-700 leading-relaxed capitalize">
                  {toTitleCase(highlight)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Skills */}
        <div
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          style={{ boxShadow: "0 4px 24px 0 rgba(16,24,40,0.14)" }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Skills</h2>
          <div className="flex flex-wrap gap-2">
            {(raw.skills || []).slice(0, 12).map((skill, idx) => (
              <span
                key={skill}
                className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full border border-yellow-200 capitalize"
              >
                {toTitleCase(skill)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateProfilePage;
