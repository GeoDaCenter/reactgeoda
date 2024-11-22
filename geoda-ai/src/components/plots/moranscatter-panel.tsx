import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import {useEffect, useState} from 'react';
import {Card, CardBody, Chip, Tab, Tabs} from '@nextui-org/react';

import {GeoDaState} from '@/store';
import {RightPanelContainer} from '../common/right-panel-template';
import {WarningBox, WarningType} from '../common/warning-box';
import {VariableSelector} from '../common/variable-selector';
import {PlotActionProps, addPlot, updatePlot} from '@/actions/plot-actions';
import {PlotManagementPanel} from './plot-management';
import {CreateButton} from '../common/create-button';
import {DatasetSelector} from '../common/dataset-selector';
import {WeightsSelector} from '../weights/weights-selector';
import {selectWeightsByDataId} from '@/store/selectors';
import {useDatasetFields} from '@/hooks/use-dataset-fields';

const NO_MAP_LOADED_MESSAGE = 'Please load a map first before creating and managing your plots.';

export function MoranScatterPanel() {
  const intl = useIntl();
  const dispatch = useDispatch();

  // State for variable and weights
  const [variable, setVariable] = useState<string | null>(null);
  const {datasetId, numericFieldNames, keplerDataset} = useDatasetFields();
  const weights = useSelector(selectWeightsByDataId(datasetId));
  const [weightsId, setWeightsId] = useState<string>(
    weights.length > 0 ? weights[weights.length - 1].weightsMeta.id || '' : ''
  );

  const plots = useSelector((state: GeoDaState) => state.root.plots);
  const [selectedDatasetId, setSelectedDatasetId] = useState(datasetId);

  const onCreateMoranScatter = () => {
    if (keplerDataset && variable && weightsId) {
      dispatch(
        addPlot({
          type: 'moranscatter',
          variable,
          weightsId,
          datasetId
        })
      );
      setShowPlotsManagement(true);
    }
  };

  const onSelectWeights = (value: any) => {
    const id = value.currentKey;
    if (id) {
      setWeightsId(id);
    }
  };

  const newPlotsCount = plots.filter((plot: PlotActionProps) => plot.isNew).length;
  const [showPlotsManagement, setShowPlotsManagement] = useState(newPlotsCount > 0);

  useEffect(() => {
    if (newPlotsCount > 0) {
      plots.forEach((plot: PlotActionProps) => {
        if (plot.isNew) {
          dispatch(updatePlot({...plot, isNew: false}));
        }
      });
    }
  }, [dispatch, newPlotsCount, plots]);

  return (
    <RightPanelContainer
      title={intl.formatMessage({
        id: 'plot.moranscatter.title',
        defaultMessage: 'Moran Scatter Plot'
      })}
      description={intl.formatMessage({
        id: 'plot.moranscatter.description',
        defaultMessage: 'Create and manage your Moran scatter plots'
      })}
      icon={null}
    >
      {!keplerDataset ? (
        <WarningBox message={NO_MAP_LOADED_MESSAGE} type={WarningType.WARNING} />
      ) : (
        <div className="h-full overflow-y-auto p-4">
          <Tabs
            aria-label="Options"
            variant="solid"
            color="danger"
            selectedKey={showPlotsManagement ? 'plot-management' : 'moranscatter-creation'}
            onSelectionChange={key => setShowPlotsManagement(key === 'plot-management')}
          >
            <Tab key="moranscatter-creation" title="Create Moran Scatter Plot">
              <Card>
                <CardBody>
                  <div className="flex flex-col gap-4">
                    <DatasetSelector
                      datasetId={selectedDatasetId}
                      setDatasetId={setSelectedDatasetId}
                    />
                    <VariableSelector
                      variables={numericFieldNames}
                      setVariable={setVariable}
                      label="Select Variable"
                    />
                    <WeightsSelector
                      weights={weights}
                      weightsId={weightsId}
                      onSelectWeights={onSelectWeights}
                    />
                    <CreateButton
                      onClick={onCreateMoranScatter}
                      isDisabled={!variable || !weightsId || !keplerDataset}
                    >
                      Create Moran Scatter Plot
                    </CreateButton>
                  </div>
                </CardBody>
              </Card>
            </Tab>
            <Tab
              key="plot-management"
              title={
                <div className="flex items-center space-x-2">
                  <span>Plots Management</span>
                  {plots?.length > 0 && (
                    <Chip size="sm" variant="faded">
                      {plots.length}
                    </Chip>
                  )}
                </div>
              }
            >
              <PlotManagementPanel />
            </Tab>
          </Tabs>
        </div>
      )}
    </RightPanelContainer>
  );
}
