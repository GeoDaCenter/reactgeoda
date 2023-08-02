import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {
  setSelectedGraphVariables,
  setSelectedChoroplethVariable,
  setPlotType,
  setChoroplethMethod,
  setNumberOfBreaks,
  setSelectedLocalMoranVariable,
  setLocalMoranWeights,
  setLocalMoranSignificance
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
  const selectedLocalMoranVariable = useSelector(state => state.root.selectedLocalMoranVariable);
  const localMoranWeights = useSelector(state => state.root.localMoranWeights);
  const localMoranSignificance = useSelector(state => state.root.localMoranSignificance);
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

  const handleLocalMoranVariableChange = e => {
    dispatch(setSelectedLocalMoranVariable(e.target.value));
  };

  const handleLocalMoranWeightsChange = e => {
    dispatch(setLocalMoranWeights(e.target.value));
  };

  const handleLocalMoranSignificanceChange = e => {
    const parsedValue = parseFloat(e.target.value);
    if (!isNaN(parsedValue)) {
      dispatch(setLocalMoranSignificance(parsedValue));
    }
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
              <option value="naturalBreaks">
                {intl.formatMessage({id: 'toolbar.naturalBreaks'})}
              </option>
              <option value="quantileBreaks">
                {intl.formatMessage({id: 'toolbar.quantileBreaks'})}
              </option>
              <option value="percentileBreaks">
                {intl.formatMessage({id: 'toolbar.percentileBreaks'})}
              </option>
              <option value="hinge15Breaks">
                {intl.formatMessage({id: 'toolbar.hinge15Breaks'})}
              </option>
              <option value="hinge30Breaks">
                {intl.formatMessage({id: 'toolbar.hinge30Breaks'})}
              </option>
              <option value="standardDeviationBreaks">
                {intl.formatMessage({id: 'toolbar.standardDeviationBreaks'})}
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
        <div style={styles.subRow}>
          <div style={styles.row}>
            <label>{intl.formatMessage({id: 'toolbar.localMoranVariable'})}: </label>
            <select
              style={styles.select}
              value={selectedLocalMoranVariable}
              onChange={handleLocalMoranVariableChange}
            >
              <option value="">
                {intl.formatMessage({id: 'toolbar.selectLocalMoranVariable'})}
              </option>
              {columns.map((col, index) => (
                <option key={index} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.row}>
            <label>{intl.formatMessage({id: 'toolbar.localMoranWeights'})}: </label>
            <select
              style={styles.select}
              value={localMoranWeights}
              onChange={handleLocalMoranWeightsChange}
            >
              <option value="">
                {intl.formatMessage({id: 'toolbar.selectLocalMoranWeights'})}
              </option>
              <option value="queen">{intl.formatMessage({id: 'toolbar.queenWeights'})}</option>
              <option value="rook">{intl.formatMessage({id: 'toolbar.rookWeights'})}</option>
            </select>
          </div>
          <div style={styles.row}>
            <label>{intl.formatMessage({id: 'toolbar.localMoranSignificance'})}: </label>
            <input
              type="number"
              style={styles.select}
              value={localMoranSignificance}
              onChange={handleLocalMoranSignificanceChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
