import React, {useCallback} from 'react';
import {useDropzone} from 'react-dropzone';
import {FormattedMessage} from 'react-intl';
import {useDispatch} from 'react-redux';
import {_BrowserFileSystem as BrowserFileSystem, loadInBatches, parse} from '@loaders.gl/core';
import {ShapefileLoader} from '@loaders.gl/shapefile';
import {CSVLoader} from '@loaders.gl/csv';
import {ArrowLoader} from '@loaders.gl/arrow';
import {JSONLoader, _GeoJSONLoader as GeoJSONLoader} from '@loaders.gl/json';
import {processRowObject, processGeojson} from '@kepler.gl/processors';
import {setFileData, setRawFileData} from '../actions/file-actions';

const FileHandler = () => {
  const dispatch = useDispatch();

  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toLowerCase();
  };

  const processShapeFiles = async (shpFiles: Map<string, File>) => {
    const shpFileName = shpFiles.get('shp')?.name;
    const dbfFileName = shpFiles.get('dbf')?.name;
    if (shpFileName === undefined || dbfFileName === undefined) {
      // TODO: @justin-kleid replace it with a React message box
      console.error('Missing required Shapefile files (shp, dbf)');
      return;
    }
    const fileSystem = new BrowserFileSystem(Array.from(shpFiles.values()));
    const {fetch} = fileSystem;
    const batches = await loadInBatches(shpFileName, ShapefileLoader, {
      fetch,
      gis: {reproject: false},
      shp: {_maxDimensions: Number.MAX_SAFE_INTEGER},
      metadata: false
    });
    const data = [];
    for await (const batch of batches) {
      // @ts-ignore FIXME
      data.push(...batch.data);
    }
    return processGeojson({type: 'FeatureCollection', features: data});
  };

  const processCSVFile = async (file: File) => {
    const data = await parse(file, CSVLoader);
    // @ts-expect-error FIXME
    return processRowObject(data);
  };

  const processJSONFile = async (file: File) => {
    const data = await parse(file, JSONLoader);
    return data; // Delete?
  };

  const processGeoJSONFile = async (file: File) => {
    const data = await parse(file, GeoJSONLoader);
    return processGeojson(data);
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const shpFiles = acceptedFiles.reduce((acc, file) => {
        const ext = (getFileExtension(file.name) || '').toLowerCase();
        if (['shp', 'shx', 'dbf', 'prj'].includes(ext)) {
          acc.set(ext, file);
        }
        return acc;
      }, new Map());

      let data;
      let rawData;
      if (shpFiles.size > 0) {
        data = await processShapeFiles(shpFiles);
      } else {
        const file = acceptedFiles[0];
        const ext = getFileExtension(file.name);
        switch (ext) {
          case 'csv':
            data = await processCSVFile(file);
            rawData = await parse(file, CSVLoader);
            break;
          case 'json':
            data = await processJSONFile(file);
            rawData = await parse(file, JSONLoader);
            break;
          case 'geojson':
            data = await processGeoJSONFile(file);
            rawData = await parse(file, GeoJSONLoader);
            break;
          case 'arrow':
            rawData = await parse(file, ArrowLoader);
            break;
          default:
            // TODO: @justin-kleid replace it with a React message box
            console.log('Unsupported file format');
            return;
        }
      }
      if (data && rawData) {
        // @ts-expect-error FIXME
        dispatch(setFileData(data));
        dispatch(setRawFileData(rawData));
      }
    },
    [dispatch]
  );

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

  const dropzoneStyle = {
    cursor: 'pointer',
    borderRadius: '5px',
    padding: '10px',
    border: '2px dashed #ccc',
    textAlign: 'center' as const,
    margin: '20px 0',
    backgroundColor: isDragActive ? '#eee' : '#fafafa'
  };

  return (
    <div {...getRootProps()} style={dropzoneStyle}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>
          <FormattedMessage id="fileUpload.dropHere" defaultMessage="Drop the files here ..." />
        </p>
      ) : (
        <p>
          <FormattedMessage
            id="fileUpload.dragDropClick"
            defaultMessage="Drag and drop csv, geojson, or json files here, or click to select files"
          />
        </p>
      )}
    </div>
  );
};

export default FileHandler;
