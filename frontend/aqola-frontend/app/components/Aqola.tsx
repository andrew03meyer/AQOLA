import DatasetSelector from './DatasetSelector';
import { ChartControls } from './ChartControls';
import Charts from './charts/Charts';
import MinimisedChartList from './charts/MinimisedChartList';
import dynamic from 'next/dynamic';
import Tutorial from './Tutorial';

//dynamically import of the leaflet map from a map component
const LeafletMap = dynamic(() => import("./maps/Map"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default function Aqola() {
    return (
        <div className="page-container">
            <Tutorial />
            {/* Map */}
            <div className="map-wrapper">
                <LeafletMap />
                <Charts />
                <div className="minimised-container">
                <MinimisedChartList />
                </div>
            </div>

            {/* Dropdown for dataset selection */}
            <DatasetSelector />

            {/* Toolbar for available charts */}
            <ChartControls />
        </div>
    )
}