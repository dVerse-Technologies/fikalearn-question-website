// Placeholder component for weekly papers
export default function WeeklyPapers() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 text-center">
        This Week's Mock Papers
      </h2>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Paper cards will be dynamically generated here */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Mock Paper 1</h3>
          <p className="text-gray-600 mb-4">Total: 60 marks</p>
          <button className="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
            View Questions
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Mock Paper 2</h3>
          <p className="text-gray-600 mb-4">Total: 60 marks</p>
          <button className="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
            View Questions
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Mock Paper 3</h3>
          <p className="text-gray-600 mb-4">Total: 60 marks</p>
          <button className="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
            View Questions
          </button>
        </div>
      </div>
    </div>
  )
} 