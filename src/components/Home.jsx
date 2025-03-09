import { useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import UploadKML from "./UploadKML";
import * as turf from "@turf/turf";
import "leaflet/dist/leaflet.css";

const Home = () => {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [detailedResults, setDetailedResults] = useState([]);

  // summary of kml file calucation :
  const generateSummary = () => {
    if (!geoJsonData) return;

    let counts = { Point: 0, LineString: 0, Polygon: 0 };

    geoJsonData.features.forEach((feature) => {
      if (feature.geometry && counts.hasOwnProperty(feature.geometry.type)) {
        counts[feature.geometry.type]++;
      }
    });

    setSummary(counts);
  };

  // detailed summary calculation of kml file :
  const handleDetailedSummary = () => {
    if (!geoJsonData || !geoJsonData.features) return;

    let summaryData = {};

    geoJsonData.features.forEach((feature) => {
      const type = feature.geometry.type;

      // LineString and MultiLineString total length
      if (type === "LineString" || type === "MultiLineString") {
        if (!summaryData[type]) {
          summaryData[type] = { type, length: 0 };
        }
        summaryData[type].length += turf.length(feature, {
          units: "kilometers",
        });
      }
    });

    const detailedData = Object.values(summaryData).map((item) => ({
      type: item.type,
      length: item.length.toFixed(2) + " km",
    }));

    setDetailedResults(detailedData);
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-4">
          KML File Uploader
        </h1>
        <UploadKML
          onFileUpload={(data) => {
            setGeoJsonData(null);
            setSummary(null);
            setDetailedResults([]);

            setTimeout(() => {
              setGeoJsonData(data);
            }, 0);
          }}
        />

        {geoJsonData && (
          <div className="flex flex-col sm:flex-row sm:gap-4 mt-4">
            <button
              onClick={generateSummary}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Show Summary
            </button>
            <button
              onClick={handleDetailedSummary}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 mt-2 sm:mt-0"
            >
              Show Detailed Info
            </button>
          </div>
        )}

        {/* KML Content Display */}
        {geoJsonData && (
          <div className="w-full max-w-4xl mt-6 p-4 bg-white rounded-lg shadow-lg overflow-auto max-h-60">
            <h2 className="text-lg font-semibold mb-2">KML File Content:</h2>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(geoJsonData, null, 2)}
            </pre>
          </div>
        )}

        {/* Summary Table */}
        {summary && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg overflow-x-auto">
            <h2 className="text-lg font-semibold mb-2">Element Count:</h2>
            <table className="w-full border-collapse border border-gray-300 min-w-max">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Element Type</th>
                  <th className="border p-2">Count</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(summary).map(([type, count]) => (
                  <tr key={type} className="text-center">
                    <td className="border p-2">{type}</td>
                    <td className="border p-2">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Detailed Info Table  */}
        {detailedResults.length > 0 && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg overflow-x-auto">
            <h2 className="text-lg font-semibold mb-2">
              Detailed Element Info:
            </h2>
            <table className="w-full border-collapse border border-gray-300 min-w-max">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Element Type</th>
                  <th className="border p-2">Total Length</th>
                </tr>
              </thead>
              <tbody>
                {detailedResults.map((item, index) => (
                  <tr key={index} className="text-center">
                    <td className="border p-2">{item.type}</td>
                    <td className="border p-2">{item.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Leaflet Map  */}
      {geoJsonData && (
        <div className="w-full max-w-4xl mt-6">
          <h2 className="text-lg font-bold text-center mb-2">
            Map Visualization
          </h2>
          <MapContainer
            center={[20, 0]}
            zoom={2}
            className="h-96 w-full rounded-lg shadow-lg"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <GeoJSON key={JSON.stringify(geoJsonData)} data={geoJsonData} />
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default Home;
