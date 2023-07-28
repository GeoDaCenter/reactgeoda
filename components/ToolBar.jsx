import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {
  setSelectedGraphVariables,
  setSelectedChoroplethVariable,
  setPlotType,
  setChoroplethMethod,
  setNumberOfBreaks
} from '../actions';
import {useIntl} from 'react-intl';

const Toolbar = () => {
  const intl = useIntl();
  const data = useSelector(state => state.root.file.fileData);
  const selectedGraphVariables = useSelector(state => state.root.selectedGraphVariables);
  const selectedChoroplethVariable = useSelector(state => state.root.selectedChoroplethVariable);
  const plotType = useSelector(state => state.root.plotType);
  const choroplethMethod = useSelector(state => state.root.choroplethMethod);
  const numberOfBreaks = useSelector(state => state.root.numberOfBreaks);
  const dispatch = useDispatch();

  const handleChoroplethMethodChange = e => {
    dispatch(setChoroplethMethod(e.target.value));
  };

  const handleNumberOfBreaksChange = e => {
    const parsedNumber = parseInt(e.target.value, 10);
    if (!isNaN(parsedNumber)) {
      dispatch(setNumberOfBreaks(parsedNumber));
    }
  };

  const columns = data.fields ? data.fields.map(field => field.name) : [];

  const handleGraphVariableChange = (e, index) => {
    const newSelectedVariables = [...selectedGraphVariables];
    newSelectedVariables[index] = e.target.value;
    dispatch(setSelectedGraphVariables(newSelectedVariables));
  };

  const handleChoroplethVariableChange = e => {
    dispatch(setSelectedChoroplethVariable(e.target.value));
  };

  const handlePlotTypeChange = e => {
    dispatch(setPlotType(e.target.value));
  };

  const showGraphVariableSelectors = plotType === 'bar' || plotType === 'scatter';

  const styles = {
    container: {
      border: '1px solid #ddd',
      borderRadius: '5px',
      padding: '20px',
      backgroundColor: '#f7f7f7'
    },
    title: {
      marginBottom: '20px'
    },
    mainRow: {
      display: 'flex',
      justifyContent: 'space-between'
    },
    subRow: {
      display: 'flex',
      flexDirection: 'column'
    },
    row: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '10px'
    },
    select: {
      marginLeft: '10px'
    }
  };

  return (
    <div style={styles.container}>
      <h4 style={styles.title}>{intl.formatMessage({id: 'toolbar.title'})}</h4>
      <div style={styles.mainRow}>
        <div style={styles.subRow}>
          <div style={styles.row}>
            <label>{intl.formatMessage({id: 'toolbar.plotType'})}: </label>
            <select style={styles.select} value={plotType} onChange={handlePlotTypeChange}>
              <option value="">{intl.formatMessage({id: 'toolbar.selectPlotType'})}</option>
              <option value="bar">{intl.formatMessage({id: 'toolbar.barPlot'})}</option>
              <option value="scatter">{intl.formatMessage({id: 'toolbar.scatterPlot'})}</option>
            </select>
          </div>
          {showGraphVariableSelectors && (
            <>
              <div style={styles.row}>
                <label>{intl.formatMessage({id: 'toolbar.variable1'})}: </label>
                <select
                  style={styles.select}
                  value={selectedGraphVariables[0]}
                  onChange={e => handleGraphVariableChange(e, 0)}
                >
                  <option value="">{intl.formatMessage({id: 'toolbar.selectVariable'})}</option>
                  {columns.map((col, index) => (
                    <option key={index} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.row}>
                <label>{intl.formatMessage({id: 'toolbar.variable2'})}: </label>
                <select
                  style={styles.select}
                  value={selectedGraphVariables[1]}
                  onChange={e => handleGraphVariableChange(e, 1)}
                >
                  <option value="">{intl.formatMessage({id: 'toolbar.selectVariable'})}</option>
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
        <div style={styles.subRow}>
          <div style={styles.row}>
            <label>{intl.formatMessage({id: 'toolbar.choroplethVariable'})}: </label>
            <select
              style={styles.select}
              value={selectedChoroplethVariable}
              onChange={handleChoroplethVariableChange}
            >
              <option value="">
                {intl.formatMessage({id: 'toolbar.selectChoroplethVariable'})}
              </option>
              {columns.map((col, index) => (
                <option key={index} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.row}>
            <label>{intl.formatMessage({id: 'toolbar.choroplethMethod'})}: </label>
            <select
              style={styles.select}
              value={choroplethMethod}
              onChange={handleChoroplethMethodChange}
            >
              <option value="">{intl.formatMessage({id: 'toolbar.selectChoroplethMethod'})}</option>
              <option value="natural_breaks">
                {intl.formatMessage({id: 'toolbar.naturalBreaks'})}
              </option>
              <option value="quantile_breaks">
                {intl.formatMessage({id: 'toolbar.quantileBreaks'})}
              </option>
            </select>
          </div>
          <div style={styles.row}>
            <label>{intl.formatMessage({id: 'toolbar.numberOfBreaks'})}: </label>
            <input
              type="number"
              style={styles.select}
              value={numberOfBreaks}
              onChange={handleNumberOfBreaksChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
