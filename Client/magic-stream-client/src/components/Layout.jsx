import { Outlet, useLocation } from "react-router-dom";
import Footer from "./footer/Footer";

const Layout = () => {
  const location = useLocation();
  const hideFooter = location.pathname.startsWith("/stream/");

  return (
    <>
      <main>
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </>
  );
};

export default Layout;
