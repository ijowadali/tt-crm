import { ref, onMounted, onUnmounted } from 'vue';

/**
 * @description get the local time
 */
export function useTime() {
  let timer; // timer
  const year = ref(0); // year
  const month = ref(0); // month
  const week = ref(''); // day of the week
  const day = ref(0); // number of days
  const hour = ref<number | string>(0); // hour
  const minute = ref<number | string>(0); // minute
  const second = ref(0); // second

  // update time
  const updateTime = () => {
    const date = new Date();
    year.value = date.getFullYear();
    month.value = date.getMonth() + 1;
    week.value = 'day one two three four five six'.charAt(date.getDay());
    day.value = date.getDate();
    hour.value =
      (date.getHours() + '')?.padStart(2, '0') ||
      new Intl.NumberFormat(undefined, { minimumIntegerDigits: 2 }).format(date.getHours());
    minute.value =
      (date.getMinutes() + '')?.padStart(2, '0') ||
      new Intl.NumberFormat(undefined, { minimumIntegerDigits: 2 }).format(date.getMinutes());
    second.value = date.getSeconds();
  };

  // native time formatting
  // new Intl.DateTimeFormat('zh', {
  //     year: 'numeric',
  //     month: '2-digit',
  //     day: '2-digit',
  //     hour: '2-digit',
  //     minute: '2-digit',
  //     second: '2-digit',
  //     hour12: false
  // }).format(new Date())

  updateTime();

  onMounted(() => {
    clearInterval(timer);
    timer = setInterval(() => updateTime(), 1000);
  });

  onUnmounted(() => {
    clearInterval(timer);
  });

  return { month, day, hour, minute, second, week };
}
