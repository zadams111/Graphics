import { default as seagulls } from '../../seagulls.js'
import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.1/dist/tweakpane.min.js';


const sg      = await seagulls.init(),
      frag    = await seagulls.import( './frag.wgsl' ),
      compute = await seagulls.import( './compute.wgsl' ),
      render  = seagulls.constants.vertex + frag,
      size    = window.innerWidth * window.innerHeight,
      state   = new Float32Array( size ),
      stateB   = new Float32Array( size )



//populate state
for( let i = 0; i < size; i++ ) {
  state[i] = 1.;
}

//populate screen with a 100x100 square of B;
for (let x = 0; x < window.innerWidth; x++) {
  for (let y = 0; y < window.innerHeight; y++) {
    if (((x - window.innerWidth / 2) < 10) && ((y - window.innerHeight / 2) < 10)) {
      const i = y * window.innerWidth + x;
      
      stateB[i] = 1.0;
    }
  }
}








//Tweak Pane
const pane = new Pane();

const PARAMS = {
    kill: 0.062,
    Da: 1.0,    
    feed: 0.055,
    Db: 0.5,
  };

pane.addBinding( PARAMS, 'feed', {
    min: 0.0,
    max: 1.0,
})
pane.addBinding( PARAMS, 'kill', {
    min: 0.0,
    max: 1.0,
})
pane.addBinding( PARAMS, 'Da', {
    min: 0.0,
    max: 1.0,
})
pane.addBinding( PARAMS, 'Db', {
    min: 0.0,
    max: 1.0,
})



//window.addEventListener( 'load', function() {
sg.buffers({ stateA1:state, stateA2:state, stateB1:stateB, stateB2:stateB })
  .uniforms({ resolution:[ window.innerWidth, window.innerHeight ]})
  .backbuffer( false )
  .pingpong( 10 )
  .compute( 
    compute, [Math.round(window.innerWidth / 8), Math.round(window.innerHeight/8), 1], 
    { pingpong:['stateA1', 'stateB1'] } 
  )
  .render( render )
  .run()

