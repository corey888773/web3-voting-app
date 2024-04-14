export const Header = () => {
    return (
      <div className="px-6 md:px-12 sm:px-2">
        <div className="flex justify-between items-centers">
          <div className="flex-1 px-2 mx-2">
            <span>🟢</span>
          </div>
          <div className="flex gap-8 items-center">
            <span>Balance</span>
            <span>Chain Id</span>
            <span>Network</span>
          </div>
        </div>
      </div>
    );
  };