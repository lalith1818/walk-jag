export default function OrderSuccess() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="bg-green-100 text-green-800 p-4 rounded-full mb-6 mx-auto w-16 h-16 flex justify-center items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round" // changed to camelCase
              strokeLinejoin="round" // changed to camelCase
              strokeWidth="2" // changed to camelCase
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">Payment Successful!</h1>
        <p className="text-lg text-gray-600 mb-6">
          Thank you for your order. 
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
}
