import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { FaChevronLeft, FaStar, FaRegBookmark, FaChevronDown } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const approveOptions = ['Strong Tech Fit', 'Good Communication', 'Highly Recommended'];

function CandidateProfilePage() {
  const navigate = useNavigate();
  const { candidateId } = useParams();
  const location = useLocation();
  const reduxCandidates = useSelector(state => state.candidates.list);
  // Prefer navigation state, fallback to Redux
  const candidates = location.state?.candidates || reduxCandidates;
  const candidate = candidates[Number(candidateId)] || null;
  const [approveValue, setApproveValue] = useState(approveOptions[0]);
  const [approved, setApproved] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [reason, setReason] = useState('');
  const [showRejectedTag, setShowRejectedTag] = useState(false);

  if (!candidate) return <div className="p-10 text-center text-red-500">Candidate not found or failed to load.</div>;
  const raw = candidate.raw_data || {};
  const educationArr = Array.isArray(raw.education) ? raw.education : (raw.education ? [raw.education] : []);

  return (
    <div className="px-10 py-8 w-full max-w-full min-h-screen bg-[#F6F6F6] box-border">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button className="flex items-center gap-2 text-blue-900 font-bold text-lg hover:underline" onClick={() => navigate('/talent-search')}>
          <FaChevronLeft /> Back to Search
        </button>
        <div className="text-2xl font-extrabold flex-1">Candidate Profile</div>
        <div className="flex gap-3">
          <button className="bg-red-50 text-red-700 border border-red-200 font-bold rounded-md px-6 py-2 text-base shadow hover:bg-red-100 transition" onClick={() => { setRejected(true); setApproved(false); }}>Reject</button>
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
                {approveOptions.map(opt => (
                  <Menu.Item key={opt}>
                    {({ active }) => (
                      <button
                        className={`w-full text-left px-4 py-2 text-sm ${active ? 'bg-blue-100' : ''}`}
                        onClick={() => { setApproveValue(opt); setApproved(true); setRejected(false); }}
                      >
                        {opt}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Transition>
          </Menu>
          <button className="bg-blue-100 text-blue-700 font-bold rounded-md px-6 py-2 text-base shadow hover:bg-blue-200 transition">Download</button>
        </div>
      </div>
      {/* Candidate Card */}
      <div className="bg-white rounded-md shadow figma-shadow p-6 flex flex-col gap-4 border border-gray-100 mb-6 relative">
        {/* Feedback Tag (below dropdown in DOM) */}
        {approved && (
          <div className="absolute top-4 right-4 bg-blue-50 text-blue-900 rounded-md shadow p-4 text-[15px] font-medium max-w-xs z-20">
            "Candidate approved successfully."
          </div>
        )}
        {showRejectedTag && (
          <div className="absolute top-4 right-4 bg-red-50 text-red-900 rounded-md shadow p-4 text-[15px] font-medium max-w-xs z-20">
            "Candidate rejected. Please provide a reason."
          </div>
        )}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-500 border border-gray-200 min-w-[56px]">
            {candidate.full_name ? candidate.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-lg text-gray-800">{candidate.full_name || 'Unknown'}</span>
            </div>
            <span className="block font-medium text-gray-700 text-[15px] leading-tight mb-1">{candidate.title || raw.job_title || ''}</span>
            <div className="flex flex-wrap gap-4 text-gray-500 text-[15px] mb-1">
              <span>{raw.location_country || ''}</span>
              <span>{educationArr[0]?.school?.name || ''}</span>
            </div>
            <div className="text-gray-600 text-[15px] mb-1">{educationArr[0]?.degrees?.join(', ')}</div>
            <div className="flex gap-2 flex-wrap mb-2">
              {(raw.skills || []).slice(0, 6).map(skill => (
                <span key={skill} className="bg-yellow-100 text-gray-800 font-semibold text-xs rounded px-2 py-1">{skill}</span>
              ))}
            </div>
            <div className="flex gap-4 flex-wrap text-[15px] text-gray-600 items-center mb-1">
              {candidate.linkedin_url && <a href={candidate.linkedin_url.startsWith('http') ? candidate.linkedin_url : `https://${candidate.linkedin_url}`} target="_blank" rel="noopener noreferrer" className="underline text-blue-700">LinkedIn</a>}
              {raw.twitter_url && <a href={raw.twitter_url.startsWith('http') ? raw.twitter_url : `https://${raw.twitter_url}`} target="_blank" rel="noopener noreferrer" className="underline text-blue-700">Twitter</a>}
              {raw.github_url && <a href={raw.github_url.startsWith('http') ? raw.github_url : `https://${raw.github_url}`} target="_blank" rel="noopener noreferrer" className="underline text-blue-700">GitHub</a>}
            </div>
          </div>
          <button className="bg-blue-50 text-blue-700 rounded-full p-2 ml-2"><FaRegBookmark className="text-lg" /></button>
        </div>
        {/* Reason/Comment Box */}
        {rejected && (
          <div className="mt-4">
            <div className="font-semibold mb-1">Reason</div>
            <div className="flex items-center gap-2">
              <input type="text" className="flex-1 border rounded-md px-4 py-2 text-base" placeholder="Add Comment" value={reason} onChange={e => setReason(e.target.value)} />
              <button className="bg-blue-600 text-white rounded-full p-3" disabled={!reason.trim()} onClick={() => setShowRejectedTag(true)}><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M2 21l21-9-21-9v7l15 2-15 2v7z" fill="currentColor"/></svg></button>
            </div>
          </div>
        )}
      </div>
      {/* Highlights, Skills, Profile Viewed, Interview Scheduled */}
      <div className="flex gap-6">
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-white rounded-md shadow figma-shadow p-6 border border-gray-100">
            <div className="font-bold text-xl mb-2 flex items-center gap-2 text-yellow-600"><FaStar /> Key Highlights</div>
            <ul className="text-base text-gray-800 space-y-2">
              {educationArr.map((edu, i) => (
                <li key={i} className="flex items-center gap-2"><span className="text-gray-400">🏅</span> {edu.school?.name || ''} - {Array.isArray(edu.degrees) ? edu.degrees.join(', ') : ''} {Array.isArray(edu.majors) && edu.majors.length > 0 ? `(${edu.majors.join(', ')})` : ''}</li>
              ))}
              {(raw.skills || []).slice(0, 6).map((skill, i) => (
                <li key={i + 'skill'} className="flex items-center gap-2"><span className="text-gray-400">🏅</span> {skill}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-white rounded-md shadow figma-shadow p-6 border border-gray-100">
            <div className="font-bold text-xl mb-2">Top Skills</div>
            <div className="flex gap-2 flex-wrap">
              {(raw.skills || []).slice(0, 12).map(skill => (
                <span key={skill} className="bg-yellow-100 text-gray-800 font-semibold text-xs rounded px-2 py-1 mb-2">{skill}</span>
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