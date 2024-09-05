import React, { Fragment, createContext, useContext, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { Block, Time } from './generic'
import StoreContext from './store'
import MainLayout from './MainLayout'
import Panel from './Panel'
import { selectByDate, tasksTotal, groupByProject, groupByDate } from '../selectors'
import { timeFormat } from '../utils'

const Main = styled(Block)`
  display: grid;
  grid: auto 1fr auto auto / 1fr;
  grid-gap: 8px;
  overflow: hidden;
  width: 100%;
  height: 100%;
`

const Input = styled.input`
  flex: 1;
  display: block;
  color: var(--foreground);
  background: var(--normal-black);
  padding: 6px 8px;
  border: 2px solid var(--foreground);

  :focus {
    border-color: var(--normal-blue);
  }
`

const Row = styled(Block)`
  display: flex;
  gap: 0.5em;
  margin-block: 0.5em;
`

const Path = styled(Block)`
  font-weight: bold;
  white-space: nowrap;
`

const TimeValue = styled(Block)`
  font-weight: bold;
  white-space: nowrap;
`

export default ({ data }) => {
  const [ state, dispatch ] = useContext(StoreContext)
  const [ search, setSearch ] = useState('')
  const { tasks } = state.data

  const regexp = new RegExp(search, 'i')
  const filteredTasks = search ? tasks.filter(task => regexp.test(task.path)) : []
  const updateValue = (event) => {
    const value = setSearch(event.target.value)
  }

  const grouped = groupByDate(filteredTasks)

  return (
    <MainLayout>
      <Main>
        <Panel>
          <div style={{display: 'flex'}}><Input autoFocus type={'text'} value={search} onChange={updateValue} /></div>
        </Panel>
        <Panel style={{overflow: 'auto'}}>
          {!filteredTasks.length && <p>No result</p>}
          {filteredTasks.map((task, index) => (
            <Row key={index}>
              <Path>{task.date}</Path>
              <TimeValue><Time value={task.total} /></TimeValue>
              <Path>{task.path}</Path>
              <Block>{task.description}</Block>
            </Row>
          ))}
        </Panel>
        <Panel style={{display: 'flex', justifyContent: 'space-between'}}>
          <p><strong><Time value={tasksTotal(filteredTasks)} /></strong> total</p>
          <p><strong>{filteredTasks.length}</strong> results</p>
        </Panel>
      </Main>
    </MainLayout>
  )
}
