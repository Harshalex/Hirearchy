import React, { useState, useEffect } from "react";

const ManualSearch = ({
  manualFilterValues,
  setManualFilterValues,
  onManualSearch,
  isLoading,
  show,
  onClose,
  filterCategories,
  selectedCategory,
  setSelectedCategory,
  filterSearch,
  setFilterSearch,
  updateManualFilter,
}) => {
  const [skillsInput, setSkillsInput] = useState(manualFilterValues.skills ? manualFilterValues.skills.join(", ") : "");

  useEffect(() => {
    const joined = manualFilterValues.skills ? manualFilterValues.skills.join(", ") : "";
    if (joined !== skillsInput) {
      setSkillsInput(joined);
    }
    // eslint-disable-next-line
  }, [manualFilterValues.skills]);

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#e5e7eb] bg-opacity-80 transition-colors duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col border border-gray-200 pointer-events-auto mx-auto my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-10 py-5 sticky top-0 bg-gradient-to-b from-[#f3f4f6] to-white z-10 shadow-sm relative">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
            Edit Your Search Filters
          </h2>
          <div className="flex items-center gap-3">
            <button
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-lg px-7 py-2 text-base shadow-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onManualSearch}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Searching...
                </div>
              ) : (
                "Save Changes"
              )}
            </button>
            <button
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              onClick={onClose}
            >
              ×
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
              {filterCategories
                .filter(cat =>
                  cat.label.toLowerCase().includes(filterSearch.toLowerCase())
                )
                .map(cat => (
                  <button
                    key={cat.key}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-left text-[15px] font-semibold rounded-lg transition-all duration-100 mb-1
                    ${selectedCategory === cat.key
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
              <label htmlFor="hide-inactive" className="text-xs text-gray-500">
                Hide inactive filters
              </label>
            </div>
          </div>
          {/* Main Content: Render all category fields */}
          <div className="flex-1 flex flex-col h-full overflow-y-auto p-10 bg-[#fcfcfd]">
            {/* General Category */}
            {selectedCategory === "general" && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-1">Min Experience (Years)</label>
                  <input type="number" className="w-full border rounded px-3 py-2 text-sm" placeholder="0" value={manualFilterValues.minExperience || ""} onChange={e => updateManualFilter("minExperience", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Max Experience (Years)</label>
                  <input type="number" className="w-full border rounded px-3 py-2 text-sm" placeholder="Example: 10 years" value={manualFilterValues.maxExperience || ""} onChange={e => updateManualFilter("maxExperience", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Required Contact Info</label>
                  <select className="w-full border rounded px-3 py-2 text-sm" value={manualFilterValues.requiredContactInfo || "Match Any"} onChange={e => updateManualFilter("requiredContactInfo", e.target.value)}>
                    <option>Match Any</option>
                    <option>Email</option>
                    <option>Phone</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Hide Viewed or Shortlisted Profiles</label>
                  <select className="w-full border rounded px-3 py-2 text-sm" value={manualFilterValues.hideViewed || "Don't hide profiles"} onChange={e => updateManualFilter("hideViewed", e.target.value)}>
                    <option>Don't hide profiles</option>
                    <option>Hide viewed</option>
                    <option>Hide shortlisted</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Only Connections</label>
                  <select className="w-full border rounded px-3 py-2 text-sm" value={manualFilterValues.onlyConnections || "Don't restrict to connections"} onChange={e => updateManualFilter("onlyConnections", e.target.value)}>
                    <option>Don't restrict to connections</option>
                    <option>Only 1st degree</option>
                    <option>Only 2nd degree</option>
                  </select>
                </div>
              </div>
            )}
            {/* Locations Category */}
            {selectedCategory === "locations" && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-1">Location(s)</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Examples: San Francisco / United States / NYC ..." value={manualFilterValues.location || ""} onChange={e => updateManualFilter("location", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Timezone</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Select timezone" value={manualFilterValues.timezone || ""} onChange={e => updateManualFilter("timezone", e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Past Locations</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Examples: San Francisco / United States / NYC ..." value={manualFilterValues.pastLocations || ""} onChange={e => updateManualFilter("pastLocations", e.target.value)} />
                </div>
              </div>
            )}
            {/* Job Category */}
            {selectedCategory === "job" && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-1">Job Title</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. Software Engineer" value={manualFilterValues.jobTitle || ""} onChange={e => updateManualFilter("jobTitle", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Seniority</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. Senior" value={manualFilterValues.seniority || ""} onChange={e => updateManualFilter("seniority", e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Job Titles (Current Only)</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Start typing a job title and select from the list" value={manualFilterValues.currentJobTitles || ""} onChange={e => updateManualFilter("currentJobTitles", e.target.value)} />
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Time Spent at Current Role</label>
                    <div className="flex gap-2">
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Between" value={manualFilterValues.timeSpentBetween || ""} onChange={e => updateManualFilter("timeSpentBetween", e.target.value)} />
                      <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="and" value={manualFilterValues.timeSpentAnd || ""} onChange={e => updateManualFilter("timeSpentAnd", e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Minimum Average Tenure</label>
                    <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Select duration" value={manualFilterValues.minAvgTenure || ""} onChange={e => updateManualFilter("minAvgTenure", e.target.value)} />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Past Job Titles</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Start typing a job title and select from the list" value={manualFilterValues.pastJobTitles || ""} onChange={e => updateManualFilter("pastJobTitles", e.target.value)} />
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Job Title Levels</label>
                    <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Select levels" value={manualFilterValues.jobTitleLevels || ""} onChange={e => updateManualFilter("jobTitleLevels", e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Job Title Roles</label>
                    <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Select roles" value={manualFilterValues.jobTitleRoles || ""} onChange={e => updateManualFilter("jobTitleRoles", e.target.value)} />
                  </div>
                </div>
              </div>
            )}
            {/* Skills Category */}
            {selectedCategory === "skills" && (
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Skills or Keywords</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. Python, Machine Learning, Numpy"
                    value={skillsInput}
                    onChange={e => setSkillsInput(e.target.value)}
                    onBlur={() =>
                      updateManualFilter(
                        "skills",
                        skillsInput.split(",").map(s => s.trim()).filter(Boolean)
                      )
                    }
                  />
                </div>
              </div>
            )}
            {/* Education Category */}
            {selectedCategory === "education" && (
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Universities</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="HBCUs, Vanderbilt, All Ivy Leagues, Stanford, etc." value={manualFilterValues.universities || ""} onChange={e => updateManualFilter("universities", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Excluded Universities</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="HBCUs, Vanderbilt, All Ivy Leagues, Stanford, etc." value={manualFilterValues.excludedUniversities || ""} onChange={e => updateManualFilter("excludedUniversities", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">University Locations</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Examples: San Francisco / United States / NYC ..." value={manualFilterValues.universityLocations || ""} onChange={e => updateManualFilter("universityLocations", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Degree Requirements</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="" value={manualFilterValues.degreeRequirements || ""} onChange={e => updateManualFilter("degreeRequirements", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Fields of Study</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="All Engineering Majors, Natural Sciences, CS, etc." value={manualFilterValues.fieldsOfStudy || ""} onChange={e => updateManualFilter("fieldsOfStudy", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Graduation Year (Min)</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="" value={manualFilterValues.gradYearMin || ""} onChange={e => updateManualFilter("gradYearMin", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Graduation Year (Max)</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="" value={manualFilterValues.gradYearMax || ""} onChange={e => updateManualFilter("gradYearMax", e.target.value)} />
                </div>
              </div>
            )}
            {/* Languages Category */}
            {selectedCategory === "languages" && (
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Languages</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. English, Hindi, French" value={manualFilterValues.languages || ""} onChange={e => updateManualFilter("languages", e.target.value)} />
                </div>
              </div>
            )}
            {/* Boolean & Name Category */}
            {selectedCategory === "boolean" && (
              <div className="text-gray-400 text-center py-16">
                (Boolean & Name filter fields coming soon...)
              </div>
            )}
            {/* Company Category */}
            {selectedCategory === "company" && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-1">Company Name</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. Google, Microsoft" value={manualFilterValues.job_company_name || ""} onChange={e => updateManualFilter("job_company_name", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Company Type</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. Startup, MNC" value={manualFilterValues.companyType || ""} onChange={e => updateManualFilter("companyType", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Company Size</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. 100-500" value={manualFilterValues.job_company_size || ""} onChange={e => updateManualFilter("job_company_size", e.target.value)} />
                </div>
              </div>
            )}
            {/* Industry Category */}
            {selectedCategory === "industry" && (
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Industry</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. IT, Finance, Healthcare" value={manualFilterValues.industry || ""} onChange={e => updateManualFilter("industry", e.target.value)} />
                </div>
              </div>
            )}
            {/* Funding & Revenue Category */}
            {selectedCategory === "funding" && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-1">Funding Stage</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. Series A, Seed" value={manualFilterValues.fundingStage || ""} onChange={e => updateManualFilter("fundingStage", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Revenue</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. $1M-$10M" value={manualFilterValues.revenue || ""} onChange={e => updateManualFilter("revenue", e.target.value)} />
                </div>
              </div>
            )}
            {/* Power Filters Category */}
            {selectedCategory === "power" && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-1">Power Filter 1</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Custom filter 1" value={manualFilterValues.powerFilter1 || ""} onChange={e => updateManualFilter("powerFilter1", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Power Filter 2</label>
                  <input type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Custom filter 2" value={manualFilterValues.powerFilter2 || ""} onChange={e => updateManualFilter("powerFilter2", e.target.value)} />
                </div>
              </div>
            )}
            {/* Likely to Switch Category */}
            {selectedCategory === "switch" && (
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Likely to Switch</label>
                  <select className="w-full border rounded px-3 py-2 text-sm" value={manualFilterValues.likelyToSwitch || ""} onChange={e => updateManualFilter("likelyToSwitch", e.target.value)}>
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualSearch; 