const scriptExample: string = `const hr_hyst = [ 170, 195 ];
let pwr_limit = false;
let interval;
self.addEventListener('message', function(e) {
  const { data: msg } = e;
  let power;
  let endRide = false;

  if (msg.hr >= hr_hyst[1]) {
    pwr_limit = true;
  } else if (msg.hr < hr_hyst[0]) {
    pwr_limit = false;
  }
  if (pwr_limit) {
    power = 100;
  } else {
    if (msg.time < 1800 * 1000) {
      power = 200;
    } else if (msg.time < 3600 * 1000) {
      power = 150;
    } else {
	  power = 100;
      endRide = true;
    }
  }

  self.postMessage({
    time: msg.time,
    power,
    endRide,
  });
}, false);
`;
export default scriptExample;
