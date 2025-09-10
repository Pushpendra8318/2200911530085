import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import ShortenForm from "./components/ShortenForm";
import StatsPage from "./components/StatsPage";

export default function App() {
  return (
    <div className="container">
      <header>
        <h1>URL Shortener</h1>
        <nav>
          <Link to="/">Shorten</Link> | <Link to="/stats">Stats</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<ShortenForm />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </main>

      <footer>
        <small>Assignment demo</small>
      </footer>
    </div>
  );
}
