//https://tailgrids.com/docs/components/toggle
import { useAppStore } from "../store/AppStore";
import { Tooltip } from "react-tooltip";

function Toggle(){
  const toggleDatasetWideEditing = useAppStore((state) => state.toggleDatasetWideEditing)
  const datasetWideEditing = useAppStore((state) => state.datasetWideEditing);

  return (
    <label className="relative inline-flex items-center cursor-pointer gap-3">
      <input type="checkbox" className="sr-only peer" checked={datasetWideEditing} onChange={() => setTimeout(toggleDatasetWideEditing, 0)}/>
      <span className="relative w-11 h-6 bg-gray-200 rounded-full 
        peer-checked:bg-cyan-500
        after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
        after:bg-white after:rounded-full after:h-5 after:w-5 
        after:transition-all peer-checked:after:translate-x-5"
      />
      <span className="text-sm">Dataset level editing</span>
    </label>
  );
}

export default Toggle;