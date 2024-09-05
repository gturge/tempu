import React from 'react';
import styled from 'styled-components';

import { groupByDate, selectByWeek, tasksTotal } from '../selectors';
import { Block, Duration } from './generic';
import { Dayjs } from 'dayjs';
import { Task } from '../timesheet-parser';

const DATE_FORMAT = 'YYYY-MM-DD';

const Container = styled(Block)`
  display: flex;
`;

const BoardBlock = styled(({ start, duration, ...props }) => {
  const top = Math.round(start / 60 / 15);
  const height = Math.round(duration / 60 / 15);
  return <Block {...props} style={{ top, height }} />;
})`
  position: absolute;
  background: var(--light-black);
  width: 100%;
`;

const Board = styled(Block)<{ $active: boolean }>`
  position: relative;
  // height: 72px;
  height: 96px;
  width: 48px;
  background: var(--normal-black);

  ${({ $active }) =>
    $active &&
    `
    ${BoardBlock} {
      background: var(--accent);
    }
  `}
`;

const WeekDay = styled(Block)`
  color: var(--normal-white);
`;

const DateOfMonth = styled(Block)`
  font-weight: bold;
`;

const DayLabelWrapper = styled(Block)<{ $active: boolean }>`
  width: 48px;
  height: 48px;
  padding: 10px 0;
  margin: 0 auto;
  text-align: center;
  line-height: 1.2;
  color: var(--light-white);

  ${({ $active }) =>
    $active &&
    `
    background: var(--accent);

    ${DateOfMonth}, ${WeekDay} {
      color: var(--normal-black);
    }
  `}
`;

const DayTotal = styled(Block)<{ $active: boolean }>`
  color: var(--light-white);
  margin-top: 4px;
  font-size: 10px;
  text-align: center;

  ${({ $active }) =>
    $active &&
    `
    color: var(--accent);
  `}
`;

type DayScheduleProps = {
  date: Dayjs;
  tasks: Task[];
  active: boolean;
};

const DaySchedule = styled(
  ({ date, tasks = [], active = false, ...props }: DayScheduleProps) => {
    const timeBlocks = tasks.map((task, id) => (
      <BoardBlock key={id} start={task.start} duration={task.total} />
    ));
    const totalOfDay = tasksTotal(tasks);

    return (
      <Block {...props}>
        <DayLabelWrapper $active={active}>
          <WeekDay children={date.format('ddd')} />
          <DateOfMonth children={date.format('D')} />
        </DayLabelWrapper>

        <Board $active={active}>{timeBlocks}</Board>

        <DayTotal $active={active}>
          <Duration value={totalOfDay} />
        </DayTotal>
      </Block>
    );
  }
)`
  margin: 0 2px;
`;

export default ({ date, tasks = [] }: { date: Dayjs; tasks: Task[] }) => {
  const tasksOfWeek = selectByWeek(tasks, date.format(DATE_FORMAT));
  const groupedTasksOfWeek = groupByDate(tasksOfWeek);
  const startOfWeek = date.startOf('week');

  const detailedDays = [...Array(7)].map((_, i) => {
    const current = startOfWeek.add(i, 'day');
    return (
      <DaySchedule
        key={i}
        date={current}
        active={current.format(DATE_FORMAT) === date.format(DATE_FORMAT)}
        tasks={groupedTasksOfWeek[current.format(DATE_FORMAT)]}
      />
    );
  });

  return (
    <Block>
      <Container>{detailedDays}</Container>

      <Block>
        <Duration value={tasksTotal(tasksOfWeek)} />
      </Block>
    </Block>
  );
};
