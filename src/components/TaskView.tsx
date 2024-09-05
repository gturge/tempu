import React from 'react';
import styled from 'styled-components';

import useStore, { actions } from '../store';
import Hotkey from './Hotkey';
import { Block, Time, Duration } from './generic';
import MainLayout from './MainLayout';
import Panel from './Panel';
import Calendar from './Calendar';
import CalendarDate from './CalendarDate';
import WeekSummary from './WeekSummary';
import { selectByDate, tasksTotal } from '../selectors';

const DATE_FORMAT = 'YYYY-MM-DD';

const Main = styled(Block)`
  display: grid;
  grid: auto 1fr / auto;
  grid-gap: 4px;
  overflow: hidden;
  width: 100%;
  height: 100%;
`;

const TaskListWrapper = styled(Block)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: scroll;
`;

const Big = styled(Block)`
  padding-block: 4px;
`;

const TaskDescription = styled(Big)`
  cursor: default;
  line-height: 1.25;
`;

const Small = styled(Block)`
  padding-block: 4px;
  font-size: 10px;
`;

const TimeBlock = styled(Block)`
  text-align: right;
`;

const TaskTimeInterval = styled(Small)`
  color: var(--normal-white);
  white-space: nowrap;
`;

const TaskTags = styled(Small)`
  font-weight: bold;
  width: max-content;
  background: var(--accent);
  color: var(--normal-black);
  padding-inline: 4px;
  border-radius: 4px;
`;

const TaskItem = styled(Block)`
  display: flex;
  gap: 12px;
`;

const HeaderContainer = styled(Panel)`
  display: flex;
  gap: 32px;
`;

const TaskViewContainer = styled(Panel)`
  display: grid;
  gap: 32px;
  grid-template-columns: auto 1fr;
`;

const Total = styled(Block)`
  text-align: center;
  font-weight: bold;
  padding: 8px;
  font-size: 14px;
`;

const ConsoleMessageContainer = styled(Block)<{ type: 'error' | 'warning' }>`
  font-family:
    IBM Plex Mono,
    Iosevka,
    Monospace;
  display: table-row;
  line-height: 1.5;
  color: ${(props) =>
    props.type === 'error' ? `var(--light-red)` : `var(--light-yellow)`};
`;

const ConsoleMessageLineNumber = styled(Block)`
  display: table-cell;
  padding-inline: 8px;
  text-align: right;
  background: var(--light-black);
  color: var(--foreground);
  font-weight: bold;
`;
const ConsoleMessageText = styled(Block)`
  display: table-cell;
  padding-inline: 8px;
`;

type ConsoleMessageProps = {
  type: 'error' | 'warning';
  lineNumber: number;
  message: string;
};

function ConsoleMessage(props: ConsoleMessageProps) {
  return (
    <ConsoleMessageContainer type={props.type}>
      <ConsoleMessageLineNumber>{props.lineNumber}</ConsoleMessageLineNumber>
      <ConsoleMessageText>{props.message}</ConsoleMessageText>
    </ConsoleMessageContainer>
  );
}

function Task({ task }) {
  return (
    <TaskItem>
      <TimeBlock>
        <Big>
          <strong>
            <Duration value={task.total} />
          </strong>
        </Big>
        <TaskTimeInterval>
          <Time value={task.start} /> - <Time value={task.end} />
        </TaskTimeInterval>
      </TimeBlock>
      <Block>
        <TaskTags children={task.keys.join(' ')} />
        <TaskDescription
          onClick={() => navigator.clipboard.writeText(task.description)}
          children={task.description}
        />
      </Block>
    </TaskItem>
  );
}

const ConsoleMessageList = styled(Block)`
  display: table;
  display: none;
  border-radius: 4px;
  overflow: hidden;
  max-width: 400px;
  box-shadow: 2px 2px 10px 0 #000000;
`;

const CountIcon = styled(Block)<{ $anchor: string; $color: string }>`
  --size: 8px;
  anchor-name: --${(props) => props.$anchor};
  color: ${(props) => props.$color};
  display: flex;
  font-weight: bold;
  padding: 4px 8px;
  gap: 4px;

  &::before {
    content: '';
    display: block;
    width: var(--size);
    height: var(--size);
    margin-top: 2px;
    border-radius: var(--size);
    background-color: ${(props) => props.$color};
  }

  & + ${ConsoleMessageList} {
    display: none;
    position: absolute;
    position-anchor: --${(props) => props.$anchor};
    left: calc(anchor(left));
    bottom: calc(anchor(top) + 8px);
    background: var(--normal-black);
  }

  &:hover {
    background: var(--normal-black);
  }

  &:hover + ${ConsoleMessageList} {
    display: block;
  }
`;

const FooterPanel = styled(Panel)`
  display: flex;
  gap: 2px;
  padding-block: 0;
`;

function Console() {
  const [state] = useStore();

  const errorItems = state.data.errors.map(({ type, lineNumber, message }, index) => (
    <ConsoleMessage key={index} type={type} lineNumber={lineNumber} message={message} />
  ));

  const warningItems = state.data.warnings.map(({ type, lineNumber, message }, index) => (
    <ConsoleMessage key={index} type={type} lineNumber={lineNumber} message={message} />
  ));

  return (
    <FooterPanel>
      {errorItems.length > 0 && (
        <Block>
          <CountIcon
            $anchor={'error-icon'}
            $color={'var(--light-red)'}
            children={errorItems.length}
          />
          <ConsoleMessageList>{errorItems}</ConsoleMessageList>
        </Block>
      )}

      {warningItems.length > 0 && (
        <Block>
          <CountIcon
            $anchor={'warning-icon'}
            $color={'var(--light-yellow)'}
            children={warningItems.length}
          />
          <ConsoleMessageList>{warningItems}</ConsoleMessageList>
        </Block>
      )}
    </FooterPanel>
  );
}

export default () => {
  const [state, dispatch] = useStore();

  const tasksOfDay = selectByDate(state.data.tasks, state.date.format(DATE_FORMAT));
  const moveDate = (amount: number) =>
    dispatch(actions.setDate(state.date.add(amount, 'day')));

  const taskElements = tasksOfDay.map((task, i) => <Task key={i} task={task} />);

  return (
    <MainLayout>
      <Main>
        <HeaderContainer>
          <Calendar date={state.date} />
          <WeekSummary date={state.date} tasks={state.data.tasks} />
        </HeaderContainer>

        <TaskViewContainer>
          <Block>
            <CalendarDate date={state.date} tasks={tasksOfDay} />
            <Total>
              <Block>
                <Duration value={tasksTotal(tasksOfDay)} />
              </Block>
            </Total>
          </Block>
          <TaskListWrapper children={taskElements} />
        </TaskViewContainer>

        <Console />
      </Main>

      <Hotkey keys={['h', 'ArrowLeft']} onKeyDown={() => moveDate(-1)} />
      <Hotkey keys={['j', 'ArrowDown']} onKeyDown={() => moveDate(7)} />
      <Hotkey keys={['k', 'ArrowUp']} onKeyDown={() => moveDate(-7)} />
      <Hotkey keys={['l', 'ArrowRight']} onKeyDown={() => moveDate(1)} />
    </MainLayout>
  );
};
