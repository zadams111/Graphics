struct Particle {
  pos: vec2f,
  speed: f32
};

@group(0) @binding(0) var<uniform> frame: f32;
@group(0) @binding(1) var<uniform> res:   vec2f;
@group(0) @binding(2) var<uniform> time_scale:   f32;
@group(0) @binding(3) var<uniform> particle_size:   f32;
@group(0) @binding(4) var<storage, read_write> state: array<Particle>;

fn cellindex( cell:vec3u ) -> u32 {
  let size = 8u;
  return cell.x + (cell.y * size) + (cell.z * size * size);
}

@compute
@workgroup_size(8,8)

fn cs(@builtin(global_invocation_id) cell:vec3u)  {
  let i = cellindex( cell );
  let p = state[ i ];
  var next = p.pos.y + (2. / res.y) * p.speed;
  if( next >= 1. ) { next -= 2.; }
  state[i].pos.y = next;
}
