import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { _BrowserFileSystem as BrowserFileSystem, loadInBatches, parse } from "@loaders.gl/core";
import { ShapefileLoader } from "@loaders.gl/shapefile";
import { CSVLoader } from '@loaders.gl/csv';
import { JSONLoader } from '@loaders.gl/json';
import {GeoJSONLoader} from '@loaders.gl/gis';
import { FormattedMessage } from 'react-intl';
import { setFileData } from '../actions/fileActions';
import { processRowObject, processGeojson } from 'kepler.gl/dist/processors';

const FileHandler = () => {
  const dispatch = useDispatch();

  const getFileExtension = (fileName) => fileName.split('.').pop().toLowerCase();

  // Process the different spatial files
  const processShapeFiles = async (shpFiles) => {
    if (!shpFiles.has("shp") || !shpFiles.has("dbf")) {
      alert('Missing required Shapefile files (shp, dbf)');
      return;
    }
    const fileSystem = new BrowserFileSystem(Array.from(shpFiles.values()));
    const { fetch } = fileSystem;
    const batches = await loadInBatches(
      shpFiles.get("shp").name,
      ShapefileLoader,
      { fetch, gis: { reproject: false }, shp: { _maxDimensions: Number.MAX_SAFE_INTEGER }, metadata: false }
    );
    const data = [];
    for await (const batch of batches) {
      data.push(...batch.data);
    }
    return processGeojson({ type: "FeatureCollection", features: data });
  };

  const processCSVFile = async (file) => {
    const data = await parse(file, CSVLoader);
    return processRowObject(data);
  };

  // Delete?
  const processJSONFile = async (file) => await parse(file, JSONLoader);

  const processGeoJSONFile = async (file) => {
    const data = await parse(file, GeoJSONLoader);
    return processGeojson(data);
  };


  // Now handle the actual file upload
  const onDrop = useCallback(async (acceptedFiles) => {
    const shpFiles = acceptedFiles.reduce((acc, file) => {
      const ext = getFileExtension(file.name);
      if (["shp", "shx", "dbf", "prj"].includes(ext)) acc.set(ext, file);
      return acc;
    }, new Map());

    // Handle the different data formats that are not shapefiles
    let data;
    if (shpFiles.size > 0) data = await processShapeFiles(shpFiles);
    else {
      const file = acceptedFiles[0];
      const ext = getFileExtension(file.name);
      switch (ext) {
        case 'csv': data = await processCSVFile(file); break;
        case 'json': data = await processJSONFile(file); break;
        case 'geojson': data = await processGeoJSONFile(file); break;
        default: alert('Unsupported file format'); return;
      }
    }
    dispatch(setFileData(data));
  }, [dispatch]);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

  const dropzoneStyle = {
    cursor: 'pointer', 
    borderRadius: '5px', 
    padding: '10px', 
    border: '2px dashed #ccc', 
    textAlign: 'center', 
    margin: '20px 0', 
    backgroundColor: isDragActive ? '#eee' : '#fafafa'
  };

  return (
    <div {...getRootProps()} style={dropzoneStyle}>
      <input {...getInputProps()} />
      {
        isDragActive ?
          <p><FormattedMessage id="fileUpload.dropHere" defaultMessage="Drop the files here ..." /></p> :
          <p><FormattedMessage id="fileUpload.dragDropClick" defaultMessage="Drag and drop csv, geojson, or json files here, or click to select files" /></p>
      }
    </div>
  );
};

export default FileHandler;