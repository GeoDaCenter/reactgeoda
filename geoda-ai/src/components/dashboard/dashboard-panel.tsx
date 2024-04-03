import {Key, useState, ReactNode} from 'react';
import {Accordion, AccordionItem, Button, Tab, Tabs, Radio, RadioGroup} from '@nextui-org/react';
import dynamic from 'next/dynamic';

import {RightPanelContainer} from '../common/right-panel-template';
import {WarningBox} from '../common/warning-box';
import {getLayer} from '@/utils/data-utils';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {NO_MAP_LOADED_MESSAGE} from '../chatgpt/chatgpt-component';
import {accordionItemClasses} from '../lisa/local-moran-panel';
import {generateRandomId} from '@/utils/ui-utils';
import {addTextGridItem, updateMode} from '@/actions/dashboard-actions';
import {MAP_ID} from '@/constants';
import {Layer} from '@kepler.gl/layers';
import {PlotProps} from '@/actions';
import {PlotWrapper} from '../plots/plot-management';
import {KeplerMapContainer} from '../common/kepler-map-container';
import {RegressionReport} from '../spreg/spreg-report';
import {TextCell} from './text-cell';

const DuckDBTable = dynamic(() => import('../table/duckdb-table'), {ssr: false});

type DraggableElementProps = {
  id: string;
  children: ReactNode;
};

const DraggableElement = ({id, children}: DraggableElementProps) => {
  return (
    <div
      className="h-[200px] w-5/6 overflow-clip rounded-md border-1 border-dashed border-gray-300"
      draggable={true}
      unselectable="on"
      // this is a hack for firefox
      // Firefox requires some kind of initialization
      // which we can do by adding this attribute
      // @see https://bugzilla.mozilla.org/show_bug.cgi?id=568313
      onDragStart={e => e.dataTransfer.setData('text/plain', JSON.stringify({id}))}
    >
      <div className="pointer-events-none h-full w-full ">{children}</div>
    </div>
  );
};

// React function component DashboardPanel, returns a JSX element, which includes the following:
//   - RightPanelContainer
//    - a div element
//     - a select element "Mode" with options "Edit", "Display"
//     - a button element "Add Text"
export function DashboardPanel() {
  const dispatch = useDispatch();

  // get grid items from redux store
  const gridItems = useSelector((state: GeoDaState) => state.root.dashboard.gridItems); // get all layers from kepler.gl visstate
  const layers = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID]?.visState?.layers);
  const layerIds = layers?.map((layer: Layer) => layer.id);
  // get all plots from redux state
  const plots = useSelector((state: GeoDaState) => state.root.plots);
  const plotIds = plots?.map((plot: any) => plot.id);
  // get all regressions from redux store
  const regressions = useSelector((state: GeoDaState) => state.root.regressions);
  // get text items from redux store
  const textItems = useSelector((state: GeoDaState) => state.root.dashboard.textItems);
  // get dashboard mode from redux store
  // const mode = useSelector((state: GeoDaState) => state.root.dashboard.mode);

  const [showSettings, setShowSettings] = useState(false);

  const layer = useSelector((state: GeoDaState) => getLayer(state));

  const onModeChange = (key: string) => {
    const mode = key === 'edit' ? 'edit' : 'display';
    dispatch(updateMode(mode));
  };

  const onAddTextClick = () => {
    const id = generateRandomId();
    dispatch(addTextGridItem({id, content: null}));
  };

  const onTabChange = (key: Key) => {
    if (key === 'dashboard-settings') {
      setShowSettings(true);
    } else {
      setShowSettings(false);
    }
  };

  return (
    <RightPanelContainer
      title="Dashboard"
      description="Create and manage your dashboard"
      icon={null}
    >
      {!layer ? (
        <WarningBox message={NO_MAP_LOADED_MESSAGE} type="warning" />
      ) : (
        <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
          <div className="flex flex-row gap-4 text-sm">
            <p className="text-small text-default-600 ">Select mode</p>
            <RadioGroup
              label=""
              defaultValue="edit"
              defaultChecked={true}
              size="sm"
              orientation="horizontal"
              onValueChange={onModeChange}
            >
              <Radio value="edit">Edit</Radio>
              <Radio value="display">Display</Radio>
            </RadioGroup>
          </div>
          <Tabs
            aria-label="Options"
            variant="solid"
            color="warning"
            classNames={{}}
            size="md"
            selectedKey={showSettings ? 'dashboard-settings' : 'dashboard-widgets'}
            onSelectionChange={onTabChange}
          >
            <Tab
              key="dashboard-settings"
              title={
                <div className="flex items-center space-x-2">
                  <span>Widget Setting</span>
                </div>
              }
            ></Tab>
            <Tab
              key="dashboard-widgets"
              title={
                <div className="flex items-center space-x-2">
                  <span>Widgets Management</span>
                </div>
              }
            >
              <div className="flex flex-col gap-4 text-sm">
                <Accordion
                  defaultExpandedKeys={['1', '2']}
                  itemClasses={accordionItemClasses}
                  selectionMode="multiple"
                  variant="splitted"
                >
                  <AccordionItem
                    key="1"
                    aria-label="new-widgets"
                    subtitle="Add a new widget to dashboard"
                    title="New Widgets"
                  >
                    <Button
                      onClick={onAddTextClick}
                      radius="sm"
                      color="primary"
                      className="bg-blue-900"
                      size="sm"
                    >
                      Add Text Widget
                    </Button>
                  </AccordionItem>
                  <AccordionItem
                    key="2"
                    aria-label="available-widgets"
                    subtitle="Drag and drop a widget to dashboard"
                    title="Available Widgets"
                  >
                    <div className="flex flex-col items-center space-y-4 align-middle">
                      {layerIds &&
                        layerIds.map(
                          (layerId: string) =>
                            gridItems?.find(l => l.id === layerId && l.show === false) && (
                              <DraggableElement key={layerId} id={layerId}>
                                <KeplerMapContainer layerId={layerId} mapIndex={1} />
                              </DraggableElement>
                            )
                        )}
                      {plotIds &&
                        plots.map(
                          (plot: PlotProps) =>
                            gridItems?.find(l => l.id === plot.id && l.show === false) && (
                              <DraggableElement key={plot.id} id={plot.id}>
                                {PlotWrapper(plot, false)}
                              </DraggableElement>
                            )
                        )}
                      {regressions &&
                        regressions.map(
                          (regression: any) =>
                            gridItems?.find(l => l.id === regression.id && l.show === false) && (
                              <DraggableElement key={regression.id} id={regression.id}>
                                <RegressionReport key={regression.id} regression={regression} />
                              </DraggableElement>
                            )
                        )}
                      {textItems &&
                        textItems.map(
                          (textItem: {id: string; content: any}) =>
                            gridItems?.find(l => l.id === textItem.id && l.show === false) && (
                              <DraggableElement key={textItem.id} id={textItem.id}>
                                <TextCell
                                  id={textItem.id}
                                  mode={'display'}
                                  initialState={textItem.content}
                                />
                              </DraggableElement>
                            )
                        )}
                      {gridItems?.find(l => l.id === 'table' && l.show === false) && (
                        <DraggableElement key="table" id="table">
                          <DuckDBTable />
                        </DraggableElement>
                      )}
                    </div>
                  </AccordionItem>
                </Accordion>
              </div>
            </Tab>
          </Tabs>
        </div>
      )}
    </RightPanelContainer>
  );
}
