import '@webcomponents/custom-elements';
import { TouchKnob } from './touch-knob.js';

window.customElements.define('touch-knob', TouchKnob);

// Disable the context menu to have a more native feel
if (process.env.NODE_ENV === 'production') {
  document.addEventListener("contextmenu", function(e) {
    e.preventDefault();
  });
}

document.getElementById('up').addEventListener('click', function () {
  window.postMessage('moveCursor', {direction: 'up', value: 10})
})

document.getElementById('down').addEventListener('click', function () {
  window.postMessage('moveCursor', {direction: 'down', value: 10})
})

document.getElementById('left').addEventListener('click', function () {
  window.postMessage('moveCursor', {direction: 'left', value: 10})
})

document.getElementById('right').addEventListener('click', function () {
  window.postMessage('moveCursor', {direction: 'right', value: 10})
})
