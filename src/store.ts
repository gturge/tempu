import dayjs, { Dayjs } from 'dayjs';
import { Timesheet } from './timesheet-parser';
import { useReducer, createContext, createElement, useContext } from 'react';

export type StoreData = {
  date: Dayjs;
  data: Timesheet;
};

export type Action = {
  type: string;
  payload: any;
};

const initialState: StoreData = {
  date: dayjs(),
  data: {
    sections: {},
    tasks: [],
    errors: [],
    warnings: [],
  },
};

export const actions = {
  setData: (data: Timesheet) => ({ type: 'SET_DATA', payload: { data } }),
  setDate: (date: Dayjs) => ({ type: 'SET_DATE', payload: { date } }),
};

const reducer = (state: StoreData, action: Action) => {
  switch (action.type) {
    case 'SET_DATA': {
      const { data } = action.payload;
      return { ...state, data };
    }

    case 'SET_DATE': {
      const { date } = action.payload;
      return { ...state, date };
    }
  }

  return state;
};

const Context = createContext<[StoreData, (action: Action) => void]>([
  initialState,
  (_action: Action) => {},
]);

export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return createElement(Context.Provider, { value: [state, dispatch] }, children);
};

export default () => useContext(Context);
