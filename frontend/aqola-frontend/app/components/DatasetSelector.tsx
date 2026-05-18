import { useAppStore } from "../store/AppStore";
import { stateExport, stateImport } from "../lib/FileHandling";
import { Download, Upload, Save } from "lucide-react";
import React from "react";
import Toggle from "./toggle";
import { Tooltip } from "react-tooltip";

export default function DataSelector() {
  // Read the value from Zustand directly — no useState needed
  const selectedDataset = useAppStore((state) => state.selectedDataset);
  const setDataset = useAppStore((state) => state.setDataset);
  const fileUploadRef = React.useRef<HTMLInputElement>(null);

  const datasetSelector = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDataset(e.target.value);
  };

  return (
    <div className="top-nav">
      <div className="top-nav-contents">
        <label htmlFor="data" className="data-label">
          Dataset:
        </label>
        <select
          name="data"
          id="data"
          value={selectedDataset ?? "crime"} // Maybe not default to "" ???
          onChange={datasetSelector}
          className="data-select"
        >
          {/* These options should be set from the keys in the datasetConfig json */}
          <option value="crime">Crime</option>
          <option value="schools">Schools</option>
          <option value="flood">Flood Risk</option>
          <option value="flood_occurrences">Flood Occurrences</option>
        </select>
      </div>

      <div className="top-nav-contents" data-tooltip-id="state-save-tooltip">
        {/* Temporary download button */}
        <button onClick={() => stateExport()} title="Download charts to device">
          <Save size={20} id="download" />
        </button>
        {/* Temporary upload button */}
        <input
          ref={fileUploadRef}
          type="file"
          onChange={(e) => stateImport(e)}
          style={{ display: "none" }}
        />
        <button
          onClick={() => fileUploadRef.current?.click()}
          title="Upload charts from device"
        >
          <Upload size={20} id="upload" />
        </button>
        <div
          id="invalid-file-format"
          style={{
            color: "red",
            fontSize: "15px",
            display: "none",
            fontWeight: "bold",
          }}
        >
          Invalid file format
        </div>
        <Tooltip
          id={"state-save-tooltip"}
          className="tooltip"
          style={{ 
              // maxWidth: "50%", 
              borderRadius:"10px",
              zIndex: 4000
          }}
          // delayHide={500}
          content="Save your work, to upload later."
        />
      </div>

      <div className="top-nav-contents" data-tooltip-id={"dataset-level-editing-tooltip"} >
        <Toggle />
        <Tooltip
          id={"dataset-level-editing-tooltip"}
          className="tooltip"
          style={{ 
              // maxWidth: "50%", 
              borderRadius:"10px",
              zIndex: 4000
          }}
          // delayHide={500}
          content="Toggle on for same dataset graphs to match. Off allows individual chart editing"
        />
      </div>

      <div className="top-nav-contents">
        {/* Documentation Button */}
        <div><a href="/docs">Documentation</a></div>
      </div>
    </div>
  );
}
