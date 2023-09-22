@group(0) @binding(0) var<uniform> res:   vec2f;
@group(0) @binding(1) var<storage> state: array<f32>;
@group(0) @binding(2) var<storage> stateA1: array<f32>;
@group(0) @binding(3) var<storage> stateB: array<f32>;
//@group(0) @binding(4) var<storage> stateB1: array<f32>


@fragment 
fn fs( @builtin(position) pos : vec4f ) -> @location(0) vec4f {
  let idx : u32 = u32( pos.y * res.x + (res.x * .5) + pos.x );
  let b = state[ idx ];
  
  
  return vec4f( stateB[idx] , stateB[idx] , stateB[idx] , 1.);
}
