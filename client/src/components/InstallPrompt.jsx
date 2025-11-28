import { usePWAInstall } from '../hooks/usePWAInstall.js';

const InstallPrompt = () => {
  const { isInstallable, promptInstall, isInstalled } = usePWAInstall();

  return (
    <button
      type="button"
      className="btn btn--outline"
      onClick={promptInstall}
      disabled={isInstalled || !isInstallable}
      style={{ opacity: isInstalled || !isInstallable ? 0.65 : 1, cursor: isInstalled || !isInstallable ? 'not-allowed' : 'pointer' }}
      title={isInstalled ? 'App already installed' : !isInstallable ? 'Install prompt becomes available when supported by your browser' : 'Install app'}
    >
      Install app
    </button>
  );
};

export default InstallPrompt;
