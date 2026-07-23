import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

const Loader = ({ fullScreen = false }) => {
  return (
    <div
      className={clsx(
        'flex items-center justify-center text-primary',
        fullScreen ? 'min-h-screen bg-background' : 'h-full w-full p-8'
      )}
    >
      <Loader2 className="w-10 h-10 animate-spin" />
    </div>
  );
};

export default Loader;
