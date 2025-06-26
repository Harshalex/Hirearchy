import { FaRegCommentDots, FaRegFileAlt, FaRegLightbulb } from 'react-icons/fa';

function TalentCard({ name, role, company, match, onRemove }) {
  return (
    <div className="bg-white rounded-md shadow-md p-4 mb-5 flex flex-col gap-2 relative border border-gray-100">
      <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl font-bold" onClick={onRemove} title="Remove">×</button>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-lg">{name.split(' ').map(n => n[0]).join('')}</div>
        <div>
          <div className="font-bold text-sm leading-tight">{name}</div>
          <div className="text-xs text-gray-500 leading-tight font-semibold">{role}</div>
          <div className="text-xs text-gray-400 leading-tight">{company}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded">{match}% Match</span>
      </div>
      <div className="flex gap-2 mt-2">
        <button className="flex-1 flex items-center gap-1 border rounded px-2 py-1 text-xs hover:bg-blue-50 font-semibold"><FaRegCommentDots /> Message</button>
        <button className="flex-1 flex items-center gap-1 border rounded px-2 py-1 text-xs hover:bg-blue-50 font-semibold"><FaRegFileAlt /> Contract</button>
      </div>
      <div className="flex gap-2 mt-1">
        <button className="flex-1 flex items-center gap-1 border rounded px-2 py-1 text-xs hover:bg-blue-50 font-semibold"><FaRegCommentDots /> Comment</button>
        <button className="flex-1 flex items-center gap-1 border rounded px-2 py-1 text-xs hover:bg-blue-50 font-semibold"><FaRegLightbulb /> Tag</button>
      </div>
    </div>
  );
}

export default TalentCard; 