import * as React from "react";

export const usePathRouting = () => {
  const [pathname, setPathname] = React.useState(() => window.location.pathname);

  const popstateHandler = React.useCallback(() => {
    setPathname(window.location.pathname);
  }, []);

  React.useEffect(() => {
    window.addEventListener("popstate", popstateHandler);
    return () => {
      window.removeEventListener("popstate", popstateHandler);
    };
  }, [popstateHandler]);

  const navigate = React.useCallback((newPath: string) => {
    if (newPath !== pathname) {
      window.history.pushState({}, '', newPath);
      setPathname(newPath);
    }
  }, [pathname]);

  return [pathname, navigate] as const;
};