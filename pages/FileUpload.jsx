import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { parse } from '@loaders.gl/core';
import { CSVLoader } from '@loaders.gl/csv';
import { JSONLoader, GeoJSONLoader } from '@loaders.gl/json';
import { FormattedMessage } from 'react-intl';


const FileUpload = ({ onFileUpload }) => {
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    // Identify file format based on extension
    const ext = file.name.split('.').pop().toLowerCase();

    let data;
    switch(ext) {
      case 'csv':
        data = await parse(file, CSVLoader);
        break;
      case 'json':
        data = await parse(file, JSONLoader);
        break;
      case 'geojson':
        data = await parse(file, GeoJSONLoader);
        break;
      default:
        alert('Unsupported file format');
        return;
    }

    onFileUpload(data);
  }, [onFileUpload]);

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
