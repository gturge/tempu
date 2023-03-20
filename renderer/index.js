import { ipcRenderer } from 'electron'
import React, { Fragment, useContext, useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'

import Hotkey from './components/Hotkey'
import GlobalStyle from './components/GlobalStyle'
import timesheetParse from './timesheet-parser'
import StoreContext, { StoreProvider } from './components/store'
import SectionView from './components/SectionView'
import TaskView from './components/TaskView'
import FilterView from './components/FilterView'
import useFileWatch from './hooks/file-watch'

const actions = {
  setData: data  => ({type: 'SET_DATA', data})
}

const WindowContainer = styled.div`
  display: grid;
  grid-template: auto 1fr / 1fr;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`

const MainNavigation = styled.nav`
  padding-inline: 8px;
  display: flex;
  gap: 8px;
`

MainNavigation.Button = styled.button`
  padding: 8px 6px;
  font-weight: bold;

  ${props => props['aria-selected'] && `
    box-shadow: inset 0 -2px 0 0 var(--normal-blue);
  `}
`

const Main = ({ filename }) => {
  const [ state, dispatch ] = useContext(StoreContext)
  const [ sections, setSections ] = useState({})
  const [ tasks, setTasks ] = useState([])
  const [ view, setView ] = useState('tasks')

  const content = useFileWatch(filename)

  useEffect(() => {
    if (!content) {
      return
    }
    const data = timesheetParse(content)
    dispatch(actions.setData(data))
  }, [content])

  return (
    <WindowContainer>
      <MainNavigation>
        <MainNavigation.Button aria-selected={view === 'tasks'} onClick={() => setView('tasks')}>Tasks</MainNavigation.Button>
        <MainNavigation.Button aria-selected={view === 'sections'} onClick={() => setView('sections')}>Sections</MainNavigation.Button>
        <MainNavigation.Button aria-selected={view === 'filter'} onClick={() => setView('filter')}>Filter</MainNavigation.Button>
      </MainNavigation>
      {view === 'sections' && <SectionView />}
      {view === 'tasks' && <TaskView />}
      {view === 'filter' && <FilterView />}
    </WindowContainer>
  )
}

const Layout = ({ filename }) => {
  return (
    <Fragment>
      <GlobalStyle />
      <StoreProvider children={<Main filename={filename} />} />
    </Fragment>
  )
}

const container = document.createElement('div')
container.style.overflow = 'hidden'
document.body.appendChild(container)

ipcRenderer.once('file-load', (event, filename) => {
  document.head.title = filename
  ReactDOM.render(<Layout filename={filename} />, container)
})
