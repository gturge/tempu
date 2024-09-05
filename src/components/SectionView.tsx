import { last } from 'lodash';
import React from 'react';
import styled from 'styled-components';

import useStore from '../store';
import AccumulationGraph from './AccumulationGraph';
import MainLayout from './MainLayout';
import Panel from './Panel';
import { Block, Duration, Time } from './generic';
import { Task } from '../timesheet-parser';

function tasksTotalTime(tasks: Task[]): number {
  return tasks.reduce((total, task) => total + task.total, 0);
}

const Main = styled(Block)`
  display: grid;
  grid: auto 1fr / 1fr;
  grid-gap: 4px;
  overflow: hidden;
  width: 100%;
  height: 100%;
`;

const SectionName = styled.div`
  font-weight: 600;
`;

const Table = styled(Block)`
  display: table;
`;

const Cell = styled(Block)`
  padding: 8px;
  vertical-align: middle;
`;

const NumberCell = styled(Cell)`
  display: table-cell;
  text-align: right;
`;

const SectionListPanel = styled(Panel)`
  display: grid;
  overflow: hidden;
`;

const SectionListContainer = styled(Block)`
  overflow-y: scroll;
`;

const TimeDifference = styled(({ value, ...props }) => {
  const sign = value < 0 ? '-' : '+';
  const color = value < 0 ? 'var(--light-red)' : 'var(--light-green)';

  if (value === 0) return null;

  return (
    <Block {...props} style={{ color }}>
      {sign}
      <Duration value={Math.abs(value)} />
    </Block>
  );
})`
  font-weight: 600;
`;

const SectionElement = styled(({ name, expectedTime, tasks, total, ...props }) => {
  const sectionTotal = tasksTotalTime(tasks);

  return (
    <Block {...props}>
      <Cell>
        <SectionName>{name}</SectionName>
      </Cell>
      <NumberCell>
        <Duration value={sectionTotal} />{' '}
        <span style={{ color: 'var(--normal-white)' }}>
          / <Duration value={expectedTime} />
        </span>
      </NumberCell>
      <NumberCell>
        {expectedTime && (
          <TimeDifference value={expectedTime && sectionTotal - expectedTime} />
        )}
      </NumberCell>
      <NumberCell>
        <Time value={total} />
      </NumberCell>
    </Block>
  );
})`
  display: table-row;
  font-size: 12px;
`;

const GraphPanel = () => {
  const [state] = useStore();
  const {
    data: { sections },
  } = state;

  const sectionList = Object.values(sections);

  const accumulation = sectionList.reduce((acc, current) => {
    const total = last(acc) || 0;

    const diff = current.expectedTime
      ? tasksTotalTime(current.tasks) - current.expectedTime
      : 0;

    return [...acc, total + diff];
  }, []);

  return (
    <Panel>
      <AccumulationGraph data={accumulation.map((value) => value / 60)} />
    </Panel>
  );
};

export default () => {
  const [state] = useStore();
  const {
    data: { sections },
  } = state;

  const sectionList = Array.from(Object.values(sections));

  const accumulation = sectionList.reduce((acc, current) => {
    const total = acc.at(-1) ?? 0;

    const diff = current.expectedTime
      ? tasksTotalTime(current.tasks) - current.expectedTime
      : 0;

    return [...acc, total + diff];
  }, []);

  const sectionItems = sectionList.map((section, index) => (
    <SectionElement key={section.name} {...section} total={accumulation[index]} />
  ));

  return (
    <MainLayout>
      <Main>
        <GraphPanel />

        <SectionListPanel>
          <SectionListContainer>
            <Table>{Array.from(sectionItems).toReversed()}</Table>
          </SectionListContainer>
        </SectionListPanel>
      </Main>
    </MainLayout>
  );
};
