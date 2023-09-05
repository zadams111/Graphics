// PRESS CTRL+ENTER TO RELOAD SHADER
// reference at https://github.com/charlieroberts/wgsl_live


fn random(uv : vec2<f32>) -> f32{
  return fract(sin(dot(uv.xy, vec2f(12.9898,78.233)))*43758.5453123);
}

fn static_texture(uv : vec2<f32>) -> f32{
  return fract(sin(dot(uv.xy, vec2f(22.2, 222.666)))* 40000. * frame );
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

@fragment
fn fs( @builtin(position) pos : vec4f ) -> @location(0) vec4f {
  // get normalized texture coordinates (aka uv) in range 0-1
  var uv = pos.xy / res;
  var uv0 = (uv - .5) * 2.;
  uv0.x *= res.x/res.y;

  var uv1 = uv0 * 3.; //multiplier

  //create circle
  //var d = length(uv0);
  //d -=.5;
  //d = smoothstep(0.0, .1, d);
  //d = 1. - d;

  //var d = length(uv1) * noise(uv1 + frame / 60000.);
  var d = length(uv1);
  d = sin(d*8 + frame / 60.) / 8.;
  d = abs(d);

  d = 0.02 / d;





  //var color = ( random(uv0) -0.1 + sin(frame/60.)) + sin(frame/60.)
  var color = ( random(uv0 + frame/60.) -0.1); //texture
  //color += random(uv0);
  color *= d;


  return vec4f(color, color, color, 1. );
}