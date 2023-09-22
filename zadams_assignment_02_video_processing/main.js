import { default as seagulls } from './seagulls.js'
import { default as Video    } from './video.js'
import { default as Audio    } from './audio.js'
import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.1/dist/tweakpane.min.js';

const shader = `
@group(0) @binding(0) var<uniform> frame: f32;
@group(0) @binding(1) var<uniform> res:   vec2f;
@group(0) @binding(2) var<uniform> audio: vec3f;
@group(0) @binding(3) var<uniform> mouse: vec3f;
@group(0) @binding(4) var<uniform> opacity: f32;
@group(0) @binding(5) var<uniform> scale: f32;
@group(0) @binding(6) var<uniform> color1: vec3f;
@group(0) @binding(7) var<uniform> color2: vec3f;
@group(0) @binding(8) var<uniform> color3: vec3f;



@group(0) @binding(9) var backSampler:    sampler;
@group(0) @binding(10) var backBuffer:     texture_2d<f32>;
@group(0) @binding(11) var videoSampler:   sampler;
@group(1) @binding(0) var videoBuffer:    texture_external;


@vertex 
fn vs( @location(0) input : vec2f ) ->  @builtin(position) vec4f {
  return vec4f( input, 0., 1.); 
}

fn random(uv : vec2<f32>) -> f32{
  return fract(sin(dot(uv.xy, vec2f(12.9898,78.233)))*43758.5453123);
}

fn noise(uv : vec2<f32>) -> f32{
  var i : vec2f = floor(uv);
  var f : vec2f = fract(uv);

  var a = random(i);
  var b = random(i + vec2f(1.0, 0.0));
  var c = random(i + vec2f(0.0, 1.0));
  var d = random(i + vec2f(1.0, 1.0));

  var u = f*f*(3.0-2.0*f);

 return mix(a, b, u.x)+ (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;


}

fn fbn(uv : vec2<f32>) -> f32{


  var val = 0.;
  var amp = uv.x * .5;

  //var dir : vec2f = vec2f(0.01, 0.1); //param for direction
  //dir *= frame; //param for speed

  //var rot : mat2x2<f32> = mat2x2<f32>(cos(0.468), sin(0.5),-sin(0.5), cos(0.50));

  var OCTAVES : u32 = 2; //param

  for (var i : u32 = 0; i < OCTAVES; i++){
    val += amp * noise(uv );
    //uv = rot * uv * 2. + dir;
    //uv * = 2.;
    amp *= .5;
  }

  return val;
}

@fragment 
fn fs( @builtin(position) pos : vec4f ) -> @location(0) vec4f {
  
  
  
  
  //params
  
  var uv = pos.xy / res;
  var uv0 = (uv - .5) * 2.;
  uv0.x *= res.x/res.y;
  var uv1 = uv0 * scale; //multiplier
  var flow = 1.; //secondary flow

  
  //var pp = ( noise(uv1 + frame/60. * 5.) -0.1); //texture
  
  //apply noise function to UV coordinates
  //uv += pp / 5.;
  
  //component1
  var q : vec2f = vec2f(-0.580,0.240);
  q.x = fbn(uv1 + 0.1 * flow);
  q.y = fbn(uv1 + vec2f(1.0));
  
  //component 2
  var r = vec2(0.);
  r.x = fbn( uv1 + 1.0*q + vec2f(1.7,9.2)+ 0.15*frame/ 60. );
  r.y = fbn( uv1 + 1.0*q + vec2f(8.3,2.8)+ 0.126*frame / 30.);

  var f = fbn(uv + r );
  uv += f/5.;
  
  //var base_color = vec3f(0., 0., 1.);
  //var color1 = vec3f(0., 1., 0.);
  //var color2 = vec3f(1., 0., 0.);
  
  var base_color = color1;
  
  base_color = mix(base_color, color2, clamp(length(q.x), 0., 1.));

  base_color = mix(base_color, color3, clamp(length(uv.x), 0., 1.));
  
  
  
  
  let vid = textureSampleBaseClampToEdge( videoBuffer, videoSampler, uv);
  let fb  = textureSample( backBuffer, backSampler, uv1);
  //let out = vid * 0.01 + fb * .955;
  
  var noise = vec4f((log(f*f*f+.6*f*f+.5*f) )* base_color,1.);
  
  
  




  
  
  
  
  
  
  
  
  
  
  
  
  
  let out = vid;// * 0.01 + fb * .955;
  //return vec4f(mix(out.r, pp, opacity), mix(out.g, pp, opacity), mix(out.b, pp, opacity), opacity);
  return vec4f(mix(out, noise, opacity));
  
  //return vec4f((log(f*f*f+.6*f*f+.5*f) )* base_color,1.);

}`

async function main() {
  let frame = 0
  
  document.body.onclick = Audio.start

  await Video.init()

  const sg = await seagulls.init()
  
  
  //Tweak Pane Params
  const PARAMS = { 
    
    opacity: .5,
    scale: 3, 
    color1: {r: 0, g: 0, b:255},
    color2: {r: 0, g: 255, b:0},
    color3: {r: 255, g: 0, b:0}

  }
  

  const pane = new Pane()
  pane.addBinding( PARAMS, 'opacity', {
    min: 0.01,
    max: 1.0,
  })
  
  pane.addBinding(PARAMS, 'scale');
  pane.addBinding(PARAMS, 'color1');
  pane.addBinding(PARAMS, 'color2');
  pane.addBinding(PARAMS, 'color3');


  
  
  
  
  
  
  sg.uniforms({ 
    frame:0, 
    res:[window.innerWidth, window.innerHeight],
    audio:[0,0,0],
    mouse:[0,0,0],
    opacity:0,
    scale:0,
    color1:[0,0,0],
    color2:[0,0,0],
    color3:[0,0,0],

    
  })
  .onframe( ()=> {
    sg.uniforms.frame = frame++;
    sg.uniforms.audio = [ Audio.low, Audio.mid, Audio.high ];
    sg.uniforms.opacity = PARAMS.opacity;
    sg.uniforms.scale = PARAMS.scale;
    sg.uniforms.color1 = [PARAMS.color1.r / 255, PARAMS.color1.g / 255, PARAMS.color1.b / 255] // Convert to a vec3f with values between 0 and 1
    sg.uniforms.color2 = [PARAMS.color2.r / 255, PARAMS.color2.g / 255, PARAMS.color2.b / 255] // Convert to a vec3f with values between 0 and 1
    sg.uniforms.color3 = [PARAMS.color3.r / 255, PARAMS.color3.g / 255, PARAMS.color3.b / 255] // Convert to a vec3f with values between 0 and 1







    console.log( PARAMS.slider )
    console.log( PARAMS.scale )
  })
  .textures([ Video.element ]) 
  .render( shader, { uniforms: ['frame','res', 'audio', 'mouse', 'opacity', 'scale', 'color1', 'color2', 'color3'] })
  .run();
  

  
}

main()
