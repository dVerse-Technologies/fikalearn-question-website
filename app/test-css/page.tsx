export default function TestCSSPage() {
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">CSS Test Page</h1>
        <p className="text-gray-700 mb-4">
          If you can see this styled properly, CSS is working!
        </p>
        <div className="space-y-2">
          <div className="bg-red-500 text-white p-2 rounded">Red background</div>
          <div className="bg-green-500 text-white p-2 rounded">Green background</div>
          <div className="bg-purple-500 text-white p-2 rounded">Purple background</div>
        </div>
        <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
          Test Button
        </button>
      </div>
    </div>
  );
} 