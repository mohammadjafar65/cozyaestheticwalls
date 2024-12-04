import { BrowserRouter, Routes as Router, Route, Link } from "react-router-dom";
import HomePage from "../app/pages/Home/index.js";
import Articles from "../app/pages/Articles/index.js";
// import DesktopPage from "../app/pages/Desktop/index.js";
// import TabletPage from "../app/pages/Tablet/index.js";

function Routes() {
  return (
    <>
      <BrowserRouter>
        <Router>
          <Route path="/" element={<HomePage />} />
          <Route path="/articles" element={<Articles />} />
          {/* <Route path="/desktop" element={<DesktopPage />} />
          <Route path="/tablet" element={<TabletPage />} /> */}
        </Router>
      </BrowserRouter>
    </>
  );
}

export default Routes;
