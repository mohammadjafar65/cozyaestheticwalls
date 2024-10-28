import { BrowserRouter, Routes as Router, Route } from "react-router-dom";
import Dashboard from "../app/pages/Admin/dashboard.js";
import AddWallpaper from "../app/pages/Admin/addWallpaper.js";

function Routes() {
  return (
    <BrowserRouter>
      <Router>
        <Route path="/" element={<Dashboard />} />
        <Route path="/addwallpaper" element={<AddWallpaper />} />
      </Router>
    </BrowserRouter>
  );
}

export default Routes;