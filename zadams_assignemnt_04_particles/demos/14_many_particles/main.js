import { default as seagulls } from "../../seagulls.js";
import { Pane } from "https://cdn.jsdelivr.net/npm/tweakpane@4.0.1/dist/tweakpane.min.js";

const WORKGROUP_SIZE = 8;

let frame = 0;

const sg = await seagulls.init(),
  render_shader = await seagulls.import("./render.glsl"),
  compute_shader = await seagulls.import("./compute.glsl");

const NUM_PARTICLES = 50000,
  // must be evenly divisble by 4 to use wgsl structs
  NUM_PROPERTIES = 4,
  state = new Float32Array(NUM_PARTICLES * NUM_PROPERTIES);

//initialize particles with random attributes
for (let i = 0; i < NUM_PARTICLES * NUM_PROPERTIES; i += NUM_PROPERTIES) {
  state[i] = -1 + Math.random() * 2;
  state[i + 1] = -1 + Math.random() * 100000; //pos
  state[i + 2] = Math.random() * 0.1; //speed
}

const PARAMS = {
  time_scale: 0.5,
  particle_size: .0015,
  color: { r: 0, g: 0, b: 1 }
};

const pane = new Pane();
pane.addBinding(PARAMS, "time_scale", {
  min: 0.01,
  max: 1.0,
});

pane.addBinding(PARAMS, "particle_size");
pane.addBinding(PARAMS, "color");

sg.buffers({ state })
  .backbuffer(false)
  .blend(false)
  .uniforms({ frame, res: [sg.width, sg.height], time_scale: PARAMS.time_scale, particle_size: PARAMS.particle_size })
  .compute(compute_shader, NUM_PARTICLES / (WORKGROUP_SIZE * WORKGROUP_SIZE))
  .render(render_shader, { uniforms: ['frame','res', 'time_scale', 'particle_size']})
  .onframe(() => (
  
  sg.uniforms.frame = frame++,
  sg.uniforms.time_scale = PARAMS.time_scale,
  sg.uniforms.particle_size = PARAMS.particle_size 
  


))
  .run(NUM_PARTICLES);
