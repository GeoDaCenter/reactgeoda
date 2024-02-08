import {setGridView} from '@/actions';
import {Tooltip} from '@nextui-org/react';
import {useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';

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
export function DashboardSwitcher() {
  const dispatch = useDispatch();
  const [useDashboard, setUseDashboard] = useState(false);

  const onToggleGridCallback = useCallback(() => {
    setUseDashboard(!useDashboard);
    dispatch(setGridView(!useDashboard));
  }, [dispatch, useDashboard]);

  return (
    <Tooltip content={useDashboard ? 'Switch to Map' : 'Switch to Dashboard'} placement="right">
      <div className="cursor-pointer" onClick={onToggleGridCallback}>
        {useDashboard ? <MapIcon /> : <DashboardIcon />}
      </div>
    </Tooltip>
  );
}
