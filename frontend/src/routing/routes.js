import { BrowserRouter, Routes as Router, Route, Link } from "react-router-dom";
import HomePage from "../app/pages/Home/index.js";

function Routes() {
  return (
    <>
      <BrowserRouter>
        <Router>
          <Route path="/" element={<HomePage />} />
        </Router>
      </BrowserRouter>
    </>
  );
}

export default Routes;
