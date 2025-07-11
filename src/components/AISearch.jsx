import React, { useEffect } from "react";
import { FaSearch } from "react-icons/fa";

function parsePrompt(prompt) {
  // Enhanced parsing logic for demo: extract experience, skills, location, job title, university
  const result = {};
  // Experience (e.g. "experience 2 years" or "2 years experience")
  const expMatch = prompt.match(/(?:experience|exp)\s*(\d+)/i) || prompt.match(/(\d+)\s*years?\s*(?:experience|exp)?/i);
  if (expMatch) result.minExperience = expMatch[1];
  // Skills (e.g. "skills: Python, ML, Numpy")
  const skillsMatch = prompt.match(/skills?:?\s*([\w,\s]+)/i);
  if (skillsMatch) {
    result.skills = skillsMatch[1].split(/,| /).map(s => s.trim()).filter(Boolean);
  }
  // Location (e.g. "in Bangalore" or "location: Bangalore")
  const locMatch = prompt.match(/in ([A-Za-z ]+)/i) || prompt.match(/location:?\s*([A-Za-z ]+)/i);
  if (locMatch) result.location = locMatch[1].trim();
  // Job Title (e.g. "Python developer", "React developer")
  const jobMatch = prompt.match(/([A-Za-z ]+ developer|engineer|manager|designer|scientist)/i);
  if (jobMatch) result.jobTitle = jobMatch[1].trim();
  // University/Education (e.g. "from Stanford", "education: Stanford")
  const eduMatch = prompt.match(/from ([A-Za-z ]+)(?: university)?/i) || prompt.match(/education:?\s*([A-Za-z ]+)/i);
  if (eduMatch) result.universities = eduMatch[1].trim();
  return result;
}

const AISearch = ({ searchPrompt, setSearchPrompt, onPromptParsed, onSearch, isLoading, aiExamples }) => {
  useEffect(() => {
    if (searchPrompt) {
      const parsed = parsePrompt(searchPrompt);
      onPromptParsed(parsed);
    }
  }, [searchPrompt, onPromptParsed]);

  return (
    <div className="flex items-center gap-6 mt-6 mb-4">
      <div className="relative flex-1">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-200 text-2xl pointer-events-none">
          <FaSearch />
        </span>
        <input
          type="text"
          placeholder="Find senior engineers with React and Python experience in tech companies"
          value={searchPrompt}
          onChange={e => setSearchPrompt(e.target.value)}
          className="w-full pl-14 pr-4 py-3 rounded-md bg-white border border-gray-100 text-lg placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
          style={{ fontWeight: 500 }}
        />
      </div>
      <button
        className="flex items-center gap-2 px-8 py-3 rounded-md bg-[#7B8CFF] text-white text-lg font-semibold h-[56px] -ml-1 hover:bg-[#6a7be6] transition-all duration-150"
        style={{ boxShadow: "none", border: "none" }}
        onClick={onSearch}
        disabled={isLoading}
      >
        <FaSearch className="text-xl" />
        {isLoading ? "Searching..." : "Search"}
      </button>
    </div>
  );
};

export default AISearch; 