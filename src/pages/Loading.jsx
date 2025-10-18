const Loading = () => {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex space-x-2">
          <div className="w-4 h-4 bg-[#155CA5] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-4 h-4 bg-[#155CA5] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-4 h-4 bg-[#155CA5] rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  };
  
  export default Loading;
  