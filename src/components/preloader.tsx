
import Logo from "@/components/logo";

const Preloader = () => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      <div className="relative">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [&>a]:text-white">
            <Logo />
        </div>
      </div>
    </div>
  );
};

export default Preloader;
