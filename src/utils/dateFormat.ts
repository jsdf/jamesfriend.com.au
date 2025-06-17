export function formatPostDate(isoDateString: string): string {
  if (!isoDateString) {
    return '';
  }
  try {
    const date = new Date(isoDateString);
    // Example format: "September 3, 2021"
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch (e) {
    console.error('Error formatting date:', isoDateString, e);
    return 'Invalid Date';
  }
}
