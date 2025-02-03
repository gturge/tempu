import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import styled from 'styled-components';
import bridgeApi from '../bridge-api';

import useStore, { actions, StoreProvider } from '../store';
import SectionView from './SectionView';
import TaskView from './TaskView';
// import FilterView from './FilterView';
import { Timesheet } from '../timesheet-parser';
import HotKey from './Hotkey';

const WindowContainer = styled.div`
  display: grid;
  grid-template: auto 1fr / 1fr;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

const MainNavigation = styled.nav`
  padding-inline: 4px;
  display: flex;
  gap: 4px;
`;

const NavButton = styled.button`
  padding: 8px 12px;
  font-weight: bold;
  color: var(--normal-white);

  ${(props) =>
    props['aria-selected'] &&
    `
    background: var(--background);
    color: var(--light-white);
    box-shadow: inset 0 -2px 0 0 var(--accent);
  `}
`;

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  function getStorage(): T {
    const value =
      (localStorage.getItem(key) && JSON.parse(localStorage.getItem(key)!)) ??
      initialValue;
    return value;
  }

  const [value, setValue] = useState(getStorage);

  function setStorage(value: T) {
    setValue(value);
    localStorage.setItem(key, JSON.stringify(value));
  }

  return [value, setStorage];
}

function Main() {
  const [, dispatch] = useStore();
  const [view, setView] = useLocalStorage<string>('view', 'tasks');

  useEffect(() => {
    bridgeApi.handleUpdate((timesheet) => {
      dispatch(actions.setData(timesheet as Timesheet));
    });
  }, []);

  return (
    <WindowContainer>
      <MainNavigation>
        <NavButton
          children={'Tasks'}
          aria-selected={view === 'tasks'}
          onClick={() => setView('tasks')}
        />
        <NavButton
          children={'Sections'}
          aria-selected={view === 'sections'}
          onClick={() => setView('sections')}
        />
      </MainNavigation>
      {view === 'sections' && <SectionView />}
      {view === 'tasks' && <TaskView />}

      <HotKey keys={'t'} onKeyDown={() => setView('tasks')} />
      <HotKey keys={'s'} onKeyDown={() => setView('sections')} />
    </WindowContainer>
  );
}

export default () => {
  const container = document.querySelector('#container')!;
  const root = createRoot(container);

  root.render(
    <StoreProvider>
      <Main />
    </StoreProvider>
  );
};
