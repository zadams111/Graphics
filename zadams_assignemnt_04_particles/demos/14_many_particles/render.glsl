struct VertexInput {
  @location(0) pos: vec2f,
  @builtin(instance_index) instance: u32,
};

struct Particle {
  pos: vec2f,
  speed: f32
};




@group(0) @binding(0) var<uniform> frame: f32;
@group(0) @binding(1) var<uniform> res:   vec2f;
@group(0) @binding(2) var<uniform> time_scale:   f32;
@group(0) @binding(3) var<uniform> particle_size:   f32;
@group(0) @binding(4) var<storage> state: array<Particle>;

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

  var OCTAVES : u32 = 8; //param

  for (var i : u32 = 0; i < OCTAVES; i++){
    val += amp * noise(uv + frame/3000.);
    //uv = rot * uv * 2. + dir;
    //uv * = 2.;
    amp *= .5;
  }

  return val;
}

@vertex 
fn vs( input: VertexInput ) ->  @builtin(position) vec4f {
  //let size = input.pos * .025; //.003;
  let size = input.pos * particle_size;
  let aspect = res.y / res.x;
  var p = state[ input.instance ];
  
  var noise = fbn(vec2f(p.pos.x, p.pos.y));
  //p.pos += noise * 10. ;
  //p.pos += noise * 10. ;
  p.pos *= noise * p.pos * (frame/600) + sin(time_scale * frame/80.) ;
  
  return vec4f( p.pos.x - size.x * aspect, p.pos.y + size.y, 0., 1.); 
}

@fragment 
fn fs( @builtin(position) pos : vec4f ) -> @location(0) vec4f {;
  let blue = .5 + sin( frame / 60. ) * 1.;
                                                               
                                                               
  var brightness  = (pos[1] / res.y) * 2.;                                                          
                                                               
                                                               
  return vec4f( brightness, brightness, brightness , .1 );
}
