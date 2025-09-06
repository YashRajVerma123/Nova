import Logo from "@/components/logo";

const Preloader = () => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      <div className="animate-pulse">
        <Logo />
      </div>
    </div>
  );
};

export default Preloader;
