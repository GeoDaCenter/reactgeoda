import {setGridView, setPropertyPanel, setShowPropertyPanel} from '@/actions';
import {Button, Tooltip} from '@nextui-org/react';
import {useCallback, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {PanelName} from '../panel/panel-container';
import {GeoDaState} from '@/store';

// An svg icon of dashboard composed by 4 squares
export function DashboardIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      height="24"
      role="presentation"
      viewBox="-2 -2 24 24"
      width="24"
      fill="#fff"
    >
      <g fill="#fff">
        <rect x="2" y="2" width="8" height="8" />
        <rect x="2" y="12" width="8" height="8" />
        <rect x="12" y="2" width="8" height="8" />
        <rect x="12" y="12" width="8" height="8" />
      </g>
    </svg>
  );
}

// An svg icon of camera
export function CameraIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      height="24"
      role="presentation"
      viewBox="0 0 24 24"
      width="24"
    >
      <g fill="#fff">
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 1.99 2H20c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 14l-4-4 4-4v3h4v2h-4v3z" />
      </g>
    </svg>
  );
} 


// An svg icon of map
export function MapIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      height="24"
      role="presentation"
      viewBox="0 0 20 30"
      width="24"
    >
      <g fill="#fff">
        <rect x="0" y="2" width="14" height="22" rx="2" ry="2" />
        <rect x="16" y="2" width="7" height="22" />
      </g>
    </svg>
  );
}

// A dashboard Switcher component that allows the user to switch between dashboard and map
export function DashboardSwitcher({isDisabled}: {isDisabled?: boolean}) {
  const dispatch = useDispatch();
  const [useDashboard, setUseDashboard] = useState(false);

  // get property panel from redux store
  const showPropertyPanel = useSelector(
    (state: GeoDaState) => state.root.uiState.showPropertyPanel
  );
  const propertyPanel = useSelector((state: GeoDaState) => state.root.uiState.propertyPanelName);

  const onToggleGridCallback = useCallback(() => {
    if (!useDashboard) {
      // switch to dashboard
      setUseDashboard(!useDashboard);
      dispatch(setGridView(!useDashboard));
      // show dashboard panel
      dispatch(setPropertyPanel(PanelName.DASHBOARD));
    } else {
      // when dashboard panel is not shown, show dashboard panel
      if (propertyPanel !== PanelName.DASHBOARD || !showPropertyPanel) {
        dispatch(setPropertyPanel(PanelName.DASHBOARD));
      } else {
        // switch to map
        setUseDashboard(!useDashboard);
        dispatch(setGridView(!useDashboard));
        dispatch(setShowPropertyPanel(false));
      }
    }
  }, [dispatch, propertyPanel, showPropertyPanel, useDashboard]);

  return (
    <Tooltip content={useDashboard ? 'Switch to Map' : 'Switch to Dashboard'} placement="right">
      <Button
        isIconOnly
        size="sm"
        className="bg-transparent"
        id="icon-dashboard"
        onClick={onToggleGridCallback}
        isDisabled={isDisabled}
      >
        {useDashboard ? <MapIcon /> : <DashboardIcon />}
      </Button>
    </Tooltip>
  );
}
