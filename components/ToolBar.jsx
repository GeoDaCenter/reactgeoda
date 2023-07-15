import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedVariables, setPlotType } from '../actions/selectedVariablesActions';

const Toolbar = () => {
  const data = useSelector(state => state.root.file.fileData);
  const selectedVariables = useSelector(state => state.root.selectedVariable);
  const plotType = useSelector(state => state.root.plotType);
  const dispatch = useDispatch();

  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  
  const handleVariableChange = (e, index) => {
    const newSelectedVariables = [...selectedVariables];
    newSelectedVariables[index] = e.target.value;
    dispatch(setSelectedVariables(newSelectedVariables));
  };

  const handlePlotTypeChange = e => {
    dispatch(setPlotType(e.target.value));
  };

  return (
    <div>
      <h4>Toolbar</h4>
      <div>
        <label>Plot Type: </label>
        <select value={plotType} onChange={handlePlotTypeChange}>
            <option value="">Select Plot Type</option>
            <option value="bar">Bar Plot</option>
            <option value="scatter">Scatter Plot</option>
        </select>
        </div>
        {plotType && (
        <>
            <div>
            <label>Variable 1: </label>
            <select onChange={(e) => handleVariableChange(e, 0)}>
                <option value="">Select Variable</option>
                {columns.map((col, index) => <option key={index} value={col}>{col}</option>)}
            </select>
            </div>
            <div>
            <label>Variable 2: </label>
            <select onChange={(e) => handleVariableChange(e, 1)}>
                <option value="">Select Variable</option>
                {columns.map((col, index) => <option key={index} value={col}>{col}</option>)}
            </select>
            </div>
        </>
        )}
    </div>
  );
};

export default Toolbar;
