{
  "particles": {
    "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
    "color": { "value": "#d4af37" },
    "shape": { "type": "circle" },
    "opacity": { "value": 0.7, "random": false },
    "size": { "value": 3, "random": true },
    "line_linked": {
      "enable": true,
      "distance": 140,
      "color": "#d4af37",
      "opacity": 0.4,
      "width": 1
    },
    "move": { "enable": true, "speed": 1, "direction": "none", "random": false, "straight": false, "out_mode": "out" }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": { "enable": true, "mode": "grab" },
      "onclick": { "enable": true, "mode": "push" },
      "resize": true
    },
    "modes": {
      "grab": { "distance": 140, "line_linked": { "opacity": 0.6 } },
      "push": { "particles_nb": 4 }
    }
  },
  "retina_detect": true
}
