import { useState, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { DEFAULT_PATH } from "@routes/index";
import Navbar from "@components/layout/header/Navbar";
import HeroHeader from "@components/HeroHeader";
import VisualDefinitions from "@components/layout/VisualDefinitions";

import BeamPage from "@pages/BeamPage";
import ColumnPage from "@pages/ColumnPage";
import SlabPage from "@pages/SlabPage";
import FoundationPage from "@pages/FoundationPage";
import RoadPage from "@pages/RoadPage";
import { BridgePage, BOQPage, ReportPage } from "@pages/OtherPages";
import DashboardPage from "@pages/DashboardPage";

export default function App() {
  const [allData, setAllData] = useState({});

  const onDataChange = useCallback((pageId, data) => {
    setAllData((prev) => ({ ...prev, [pageId]: data }));
  }, []);

  return (
    <>
      <VisualDefinitions />
      {/* Sidebar */}
      <Navbar />

      {/* Main content area */}
      <div
        style={{
          marginLeft: "var(--sidebar-width)",
          minHeight: "100vh",
          width: "calc(100% - var(--sidebar-width))",
          transition: "margin-left 0.25s ease, width 0.25s ease",
        }}
      >
        <main style={{ maxWidth: "100%", margin: "0 10px" }}>
          <div
            style={{
              padding: "24px 32px 72px",
              width: "100%",
              maxWidth: "1600px",
              margin: "0 auto",
            }}
          >
            <HeroHeader />

            <Routes>
              <Route
                path="/"
                element={<Navigate to={DEFAULT_PATH} replace />}
              />
              <Route
                path="/beam"
                element={
                  <BeamPage onDataChange={(d) => onDataChange("beam", d)} />
                }
              />
              <Route
                path="/column"
                element={
                  <ColumnPage onDataChange={(d) => onDataChange("column", d)} />
                }
              />
              <Route
                path="/slab"
                element={
                  <SlabPage onDataChange={(d) => onDataChange("slab", d)} />
                }
              />
              <Route
                path="/foundation"
                element={
                  <FoundationPage
                    onDataChange={(d) => onDataChange("foundation", d)}
                  />
                }
              />
              <Route
                path="/road"
                element={
                  <RoadPage onDataChange={(d) => onDataChange("road", d)} />
                }
              />
              <Route
                path="/bridge"
                element={
                  <BridgePage onDataChange={(d) => onDataChange("bridge", d)} />
                }
              />
              <Route
                path="/boq"
                element={
                  <BOQPage onDataChange={(d) => onDataChange("boq", d)} />
                }
              />
              <Route
                path="/report"
                element={<ReportPage allData={allData} />}
              />
              <Route
                path="/dashboard"
                element={<DashboardPage allData={allData} />}
              />
              <Route
                path="*"
                element={<Navigate to={DEFAULT_PATH} replace />}
              />
            </Routes>
          </div>
        </main>
      </div>
    </>
  );
}
