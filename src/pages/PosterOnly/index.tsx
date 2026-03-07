import React from "react";
import PosterPage from "@/pages/Poster";
import "./styles.less";

const PosterOnlyPage: React.FC = () => {
  return (
    <main className="poster-only-page">
      <PosterPage standalone />
    </main>
  );
};

export default PosterOnlyPage;
