export function notifyDataRefreshed() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('app:data-refreshed'));
}
