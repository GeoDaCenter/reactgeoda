import React, {useCallback, CSSProperties} from 'react';
import {useDispatch} from 'react-redux';
import {useDropzone} from 'react-dropzone';
import {_BrowserFileSystem as BrowserFileSystem, loadInBatches, parse} from '@loaders.gl/core';
import {ShapefileLoader} from '@loaders.gl/shapefile';
import {CSVLoader} from '@loaders.gl/csv';
import {JSONLoader, _GeoJSONLoader as GeoJSONLoader} from '@loaders.gl/json';
import {FormattedMessage} from 'react-intl';
import {setFileData, setRawFileData} from '../actions/fileActions';
import {processRowObject, processGeojson} from 'kepler.gl/dist/processors';

const FileHandler: React.FC = () => {
  const dispatch = useDispatch();

  const getFileExtension = (fileName: string): string =>
    (fileName.split('.').pop() || '').toLowerCase();

  const processShapeFiles = async (shpFiles: Map<string, File>) => {
    if (!shpFiles.has('shp') || !shpFiles.has('dbf')) {
      console.error('Missing required Shapefile files (shp, dbf)');
      return;
    }
    const fileSystem = new BrowserFileSystem(Array.from(shpFiles.values()));
    const {fetch} = fileSystem;
    const batches = await loadInBatches(shpFiles.get('shp')!.name, ShapefileLoader, {
      fetch,
      gis: {reproject: false},
      shp: {_maxDimensions: Number.MAX_SAFE_INTEGER},
      metadata: false
    });
    const data: any[] = [];
    for await (const batch of batches) {
      data.push(...batch.data);
    }
    return processGeojson({type: 'FeatureCollection', features: data});
  };

  const processCSVFile = async (file: File) => {
    const data = await parse(file, CSVLoader);
    return processRowObject(data);
  };

  const processJSONFile = async (file: File) => {
    const data = await parse(file, JSONLoader);
    return data;
  };

  const processGeoJSONFile = async (file: File) => {
    const data = await parse(file, GeoJSONLoader);
    return processGeojson(data);
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const shpFiles = acceptedFiles.reduce((acc: Map<string, File>, file) => {
        const ext = getFileExtension(file.name);
        if (['shp', 'shx', 'dbf', 'prj'].includes(ext)) acc.set(ext, file);
        return acc;
      }, new Map<string, File>());

      let data: any;
      let rawData: any;
      if (shpFiles.size > 0) data = await processShapeFiles(shpFiles);
      else {
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
          default:
            console.log('Unsupported file format');
            return;
        }
      }
      dispatch(setFileData(data));
      dispatch(setRawFileData(rawData));
    },
    [dispatch]
  );

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

  const dropzoneStyle: CSSProperties = {
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
      <input {...(getInputProps() as any)} />
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
