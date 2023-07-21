import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedVariables, setPlotType } from "../actions";
import { useIntl } from "react-intl";

const Toolbar = () => {
  const intl = useIntl();
  const data = useSelector((state) => state.root.file.fileData);
  const selectedVariables = useSelector((state) => state.root.selectedVariable);
  const plotType = useSelector((state) => state.root.plotType);
  const dispatch = useDispatch();

  const columns = data.fields ? data.fields.map(field => field.name) : [];

  const handleVariableChange = (e, index) => {
    const newSelectedVariables = [...selectedVariables];
    newSelectedVariables[index] = e.target.value;
    dispatch(setSelectedVariables(newSelectedVariables));
  };

  const handlePlotTypeChange = (e) => {
    dispatch(setPlotType(e.target.value));
  };

  return (
    <div style={styles.container}>
      <h4 style={styles.title}>{intl.formatMessage({ id: "toolbar.title" })}</h4>
      <div style={styles.row}>
        <label>{intl.formatMessage({ id: "toolbar.plotType" })}: </label>
        <select style={styles.select} value={plotType} onChange={handlePlotTypeChange}>
          <option value="">
            {intl.formatMessage({ id: "toolbar.selectPlotType" })}
          </option>
          <option value="bar">
            {intl.formatMessage({ id: "toolbar.barPlot" })}
          </option>
          <option value="scatter">
            {intl.formatMessage({ id: "toolbar.scatterPlot" })}
          </option>
        </select>
      </div>
      {plotType && (
        <>
          <div style={styles.row}>
            <label>{intl.formatMessage({ id: "toolbar.variable1" })}: </label>
            <select style={styles.select} onChange={(e) => handleVariableChange(e, 0)}>
              <option value="">
                {intl.formatMessage({ id: "toolbar.selectVariable" })}
              </option>
              {columns.map((col, index) => (
                <option key={index} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.row}>
            <label>{intl.formatMessage({ id: "toolbar.variable2" })}: </label>
            <select style={styles.select} onChange={(e) => handleVariableChange(e, 1)}>
              <option value="">
                {intl.formatMessage({ id: "toolbar.selectVariable" })}
              </option>
              {columns.map((col, index) => (
                <option key={index} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    border: '1px solid #ddd',
    borderRadius: '5px',
    padding: '20px',
    backgroundColor: '#f7f7f7',
  },
  title: {
    marginBottom: '20px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
  },
  select: {
    marginLeft: '10px',
  },
};

export default Toolbar;
