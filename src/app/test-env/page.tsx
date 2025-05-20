export default function TestEnv() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Environment Variable Test</h1>
      <div className="bg-gray-100 p-4 rounded">
        <p>API Key exists: {apiKey ? '✅ Yes' : '❌ No'}</p>
        <p>API Key length: {apiKey?.length || 0} characters</p>
        <p className="text-sm text-gray-500 mt-2">
          Note: The actual API key is not displayed for security reasons
        </p>
      </div>
    </div>
  );
} 