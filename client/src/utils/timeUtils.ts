export const convertTo24Hour = (timeStr: string): string => {
  // Handle "Closed" or empty cases
  if (!timeStr || timeStr.toLowerCase() === 'closed') {
    return 'Closed';
  }

  // Split the time range into start and end times
  const [startTime, endTime] = timeStr.split('-').map(t => t.trim());

  const convertSingleTime = (time: string): string => {
    // Check if it's already in 24-hour format
    if (time.includes(':')) {
      const [hours, minutes] = time.split(':');
      const hourNum = parseInt(hours);
      if (hourNum >= 0 && hourNum <= 23) {
        return time;
      }
    }

    // Handle 12-hour format
    const timeLower = time.toLowerCase();
    const isPM = timeLower.includes('pm');
    const timeWithoutPeriod = timeLower.replace(/[ap]m/, '').trim();
    
    let [hours, minutes = '00'] = timeWithoutPeriod.split(':').map(t => t.trim());
    let hourNum = parseInt(hours);

    if (isPM && hourNum !== 12) {
      hourNum += 12;
    } else if (!isPM && hourNum === 12) {
      hourNum = 0;
    }

    return `${hourNum.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  const start24 = convertSingleTime(startTime);
  const end24 = convertSingleTime(endTime);

  return `${start24}-${end24}`;
};

export const convertTo12Hour = (timeStr: string): string => {
  // Handle "Closed" or empty cases
  if (!timeStr || timeStr.toLowerCase() === 'closed') {
    return 'Closed';
  }

  // Split the time range into start and end times
  const [startTime, endTime] = timeStr.split('-').map(t => t.trim());

  const convertSingleTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hourNum = parseInt(hours);
    
    if (hourNum === 0) {
      return `12:${minutes} AM`;
    } else if (hourNum < 12) {
      return `${hourNum}:${minutes} AM`;
    } else if (hourNum === 12) {
      return `12:${minutes} PM`;
    } else {
      return `${hourNum - 12}:${minutes} PM`;
    }
  };

  const start12 = convertSingleTime(startTime);
  const end12 = convertSingleTime(endTime);

  return `${start12}-${end12}`;
}; 