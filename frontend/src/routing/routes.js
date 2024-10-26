import { BrowserRouter, Routes as Router, Route, Link } from "react-router-dom";
import HomePage from "../app/pages/Home/index.js";
import Dashboard from "../app/pages/Admin/dashboard.js";
import AddWallpaper from "../app/pages/Admin/addWallpaper.js";

function Routes() {
  return (
    <>
      <BrowserRouter>
        <Router>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/addwallpaper" element={<AddWallpaper />} />
        </Router>
      </BrowserRouter>
    </>
  );
}

export default Routes;
