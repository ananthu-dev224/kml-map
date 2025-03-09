import { useState } from "react";
import * as toGeoJSON from "togeojson";

const UploadKML = ({ onFileUpload }) => {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith(".kml")) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => {
        // Convert KML to GeoJSON
        const parser = new DOMParser();
        const kml = parser.parseFromString(reader.result, "text/xml");
        const geoJson = toGeoJSON.kml(kml);

        onFileUpload(geoJson);
      };
    } else {
      alert("Please upload a valid KML file.");
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      <input
        type="file"
        accept=".kml"
        className="block w-full text-sm text-gray-700
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-500 file:text-white
                  hover:file:bg-blue-600"
        onChange={handleFileChange}
      />
      {fileName && (
        <p className="mt-2 text-gray-600 text-sm">Uploaded: {fileName}</p>
      )}
    </div>
  );
};

export default UploadKML;
