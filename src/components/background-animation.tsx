const BackgroundAnimation = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full filter blur-3xl opacity-50 animate-[move-circle-1_15s_ease-in-out_infinite]"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500/20 rounded-full filter blur-3xl opacity-50 animate-[move-circle-2_20s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-pink-500/20 rounded-full filter blur-3xl opacity-50 animate-[move-circle-3_18s_ease-in-out_infinite]"></div>
    </div>
  );
}

export default BackgroundAnimation;
