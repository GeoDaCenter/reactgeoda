import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { parse } from '@loaders.gl/core'; // TODO: use parseinbatches? Perhaps w gpt?
import { CSVLoader } from '@loaders.gl/csv';
import { JSONLoader } from '@loaders.gl/json';
import {GeoJSONLoader} from '@loaders.gl/gis';
import { FormattedMessage } from 'react-intl';
import { setFileData } from '../actions/fileActions';
import { processCsvData, processRowObject, processGeojson } from 'kepler.gl/dist/processors';


const FileUpload = () => {
  const dispatch = useDispatch();

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    // Identify file format based on extension
    const ext = file.name.split('.').pop().toLowerCase();

    let data;
    switch(ext) {
      case 'csv':
        data = await parse(file, CSVLoader);
        data = processRowObject(data)
        break;
      case 'json':
        data = await parse(file, JSONLoader)
        break;
      case 'geojson':
        data = await parse(file, GeoJSONLoader);
        data = processGeojson(data)
        break;
      default:
        alert('Unsupported file format');
        return;
    }
    console.log(data)
    dispatch(setFileData(data));
  }, [dispatch]);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

  return (
    <div {...getRootProps()} style={{ cursor: 'pointer', borderRadius: '5px', padding: '10px', border: '2px dashed #ccc', textAlign: 'center', margin: '20px 0', backgroundColor: isDragActive ? '#eee' : '#fafafa' }}>
      <input {...getInputProps()} />
      {
        isDragActive ?
          <p><FormattedMessage id="fileUpload.dropHere" defaultMessage="Drop the files here ..." /></p> :
          <p><FormattedMessage id="fileUpload.dragDropClick" defaultMessage="Drag and drop csv, geojson, or json files here, or click to select files" /></p>
      }
    </div>
  )
};

export default FileUpload;
