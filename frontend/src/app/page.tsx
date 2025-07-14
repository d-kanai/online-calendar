import Rectangle1 from '../components/Rectangle1';

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">
          Hello World
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Welcome to OnlineCalendar
        </p>
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Figma Component:</h2>
          <div className="w-32 h-32 mx-auto">
            <Rectangle1 />
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Powered by Next.js with TypeScript and Tailwind CSS
        </div>
      </div>
    </div>
  );
}
