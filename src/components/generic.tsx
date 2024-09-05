export const Block = 'div';
export const Inline = 'span';

export const Time = ({ value }) => {
  const hours = Math.floor(Math.abs(value / 3600));
  const minutes = Math.abs((value / 60) % 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const Duration = ({ value }) => {
  const hours = Math.floor(value / 3600);
  const minutes = (value / 60) % 60;
  return `${(hours && `${hours}h\u00a0`) || ''}${(minutes && `${minutes}m`) || ''}`;
};
