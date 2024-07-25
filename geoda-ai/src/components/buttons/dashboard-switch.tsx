import {setGridView, setPropertyPanel, setShowPropertyPanel} from '@/actions';
import {Button, Tooltip} from '@nextui-org/react';
import {useCallback} from 'react';
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

// An svg icon of dashboard composed by 4 squares and a config gear on the top right corner
export function DashboardConfigIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4H4V12H12V4Z" fill="white" />
      <path d="M12 14H4V22H12V14Z" fill="white" />
      <path d="M22 14H14V22H22V14Z" fill="white" />
      <path d="M19.5 4.5L23.5 8.5Z" fill="white" />
      <path d="M21.5 8.5L19.5 6.5Z" fill="white" />
      <path d="M21.5 8.5L19.5 10.5Z" fill="white" />
      <path d="M21.5 8.5L23.5 6.5Z" fill="white" />
      <path d="M21.5 8.5L23.5 10.5Z" fill="white" />
      <g clip-path="url(#clip0_557_5949)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M21.6798 6.57188L22.8363 6.76087C22.8821 6.76836 22.9237 6.79188 22.9537 6.82723C22.9836 6.86258 23.0001 6.90745 23 6.95381V8.02987C22.9999 8.07586 22.9836 8.12034 22.954 8.15552C22.9244 8.1907 22.8833 8.21432 22.838 8.22225L21.6804 8.42587C21.6133 8.65754 21.5209 8.88108 21.4047 9.09244L22.0893 10.0431C22.1164 10.0809 22.1292 10.127 22.1255 10.1733C22.1217 10.2197 22.1018 10.2632 22.0691 10.2962L21.308 11.0567C21.2756 11.0893 21.2327 11.1095 21.1869 11.1136C21.1412 11.1177 21.0954 11.1055 21.0577 11.0792L20.0975 10.4053C19.886 10.5234 19.661 10.6174 19.4264 10.6866L19.2223 11.8386C19.2143 11.8839 19.1906 11.925 19.1553 11.9545C19.12 11.984 19.0753 12.0002 19.0293 12H17.9532C17.907 12.0001 17.8622 11.9837 17.8268 11.9539C17.7915 11.924 17.7679 11.8825 17.7603 11.8369L17.5691 10.6899C17.335 10.6222 17.1092 10.5289 16.8957 10.4115L15.9429 11.0786C15.9052 11.1051 15.8594 11.1175 15.8135 11.1136C15.7677 11.1097 15.7246 11.0898 15.692 11.0572L14.9309 10.2956C14.8984 10.2627 14.8786 10.2194 14.8748 10.1733C14.8711 10.1272 14.8838 10.0813 14.9107 10.0436L15.584 9.102C15.4654 8.8874 15.371 8.66025 15.3027 8.42475L14.1614 8.22225C14.1162 8.2142 14.0753 8.19053 14.0458 8.15536C14.0163 8.1202 14.0001 8.07578 14 8.02987V6.95381C14 6.85819 14.0692 6.77662 14.1631 6.76087L15.305 6.57075C15.3731 6.3345 15.4676 6.10838 15.5863 5.89406L14.9203 4.94231C14.8938 4.90469 14.8816 4.85895 14.8856 4.81316C14.8896 4.76737 14.9096 4.72446 14.9422 4.692L15.7027 3.9315C15.7702 3.864 15.8771 3.855 15.9547 3.91069L16.8997 4.58569C17.1131 4.46909 17.3387 4.37647 17.5724 4.3095L17.7598 3.16425C17.7672 3.11835 17.7908 3.07661 17.8263 3.04651C17.8617 3.01642 17.9067 2.99993 17.9532 3H19.0293C19.1249 3 19.2059 3.06863 19.2223 3.162L19.4242 4.31344C19.6576 4.3815 19.8826 4.47487 20.0953 4.593L21.0431 3.91181C21.0808 3.88455 21.127 3.87161 21.1734 3.87532C21.2197 3.87904 21.2633 3.89915 21.2962 3.93206L22.0567 4.69256C22.1242 4.76006 22.1332 4.86581 22.0786 4.94344L21.4036 5.90531C21.5195 6.11681 21.6123 6.33956 21.6798 6.57188ZM17.1303 7.5C17.1303 7.67987 17.1657 7.85798 17.2346 8.02416C17.3034 8.19033 17.4043 8.34133 17.5315 8.46851C17.6587 8.5957 17.8097 8.69659 17.9758 8.76543C18.142 8.83426 18.3201 8.86969 18.5 8.86969C18.6799 8.86969 18.858 8.83426 19.0242 8.76543C19.1903 8.69659 19.3413 8.5957 19.4685 8.46851C19.5957 8.34133 19.6966 8.19033 19.7654 8.02416C19.8343 7.85798 19.8697 7.67987 19.8697 7.5C19.8697 7.13674 19.7254 6.78835 19.4685 6.53148C19.2116 6.27462 18.8633 6.13031 18.5 6.13031C18.1367 6.13031 17.7884 6.27462 17.5315 6.53148C17.2746 6.78835 17.1303 7.13674 17.1303 7.5Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_557_5949">
          <rect width="9" height="9" fill="white" transform="translate(14 3)" />
        </clipPath>
      </defs>
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

  // get property panel from redux store
  const showPropertyPanel = useSelector(
    (state: GeoDaState) => state.root.uiState.showPropertyPanel
  );
  const propertyPanel = useSelector((state: GeoDaState) => state.root.uiState.propertyPanelName);
  const showGridView = useSelector((state: GeoDaState) => state.root.uiState.showGridView);

  const dashboardState = showGridView
    ? showPropertyPanel && propertyPanel !== PanelName.DASHBOARD
      ? 'dashboard-config'
      : 'dashboard'
    : 'map';

  const onToggleGridCallback = useCallback(() => {
    if (dashboardState === 'map') {
      // switch to dashboard
      dispatch(setGridView(true));
      // show dashboard panel
      dispatch(setPropertyPanel(PanelName.DASHBOARD));
    } else {
      // when dashboard panel is not shown, show dashboard panel
      if (dashboardState === 'dashboard-config') {
        dispatch(setPropertyPanel(PanelName.DASHBOARD));
      } else {
        // switch to map
        dispatch(setGridView(false));
        dispatch(setShowPropertyPanel(false));
      }
    }
  }, [dispatch, dashboardState]);

  return (
    <Tooltip
      content={
        dashboardState === 'map'
          ? 'Switch to Dashboard'
          : dashboardState === 'dashboard-config'
            ? 'Switch to Dashboard'
            : 'Switch to Map'
      }
      placement="right"
    >
      <Button
        isIconOnly
        size="sm"
        className="bg-transparent"
        id="icon-dashboard"
        onClick={onToggleGridCallback}
        isDisabled={isDisabled}
      >
        {dashboardState === 'map' ? (
          <DashboardIcon />
        ) : dashboardState === 'dashboard-config' ? (
          <DashboardConfigIcon />
        ) : (
          <MapIcon />
        )}
      </Button>
    </Tooltip>
  );
}
