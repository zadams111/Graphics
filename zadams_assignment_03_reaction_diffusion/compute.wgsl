@group(0) @binding(0) var<uniform> res: vec2f;
@group(0) @binding(1) var<storage, read_write> stateAin: array<f32>;
@group(0) @binding(2) var<storage, read_write> stateAout: array<f32>;

@group(0) @binding(3) var<storage, read_write> stateBin: array<f32>;
@group(0) @binding(4) var<storage, read_write> stateBout: array<f32>;
//@group(0) @binding(5) var<uniform> feed: f32;

fn index( x:i32, y:i32 ) -> u32 {
  let _res = vec2i(res);
  return u32( abs(y % _res.y) * _res.x + abs(x % _res.x ) );
}


//Convolution for 3x3 matrix
fn convolutionA(cell:vec3i) -> f32{
   var con = 0.;
  
   //calculate convolusion
   let i = index(cell.x, cell.y);
    
    
    var center = -1.;
    var adjacent = .2;
    var diagonals = 0.05;
    
    con = stateAin[i] * center +
          
          stateAin[index(cell.x - 1, cell.y)] * adjacent + //left adj
          stateAin[index(cell.x + 1, cell.y)] * adjacent + //right adj
          stateAin[index(cell.x, cell.y + 1)] * adjacent + //top adj
          stateAin[index(cell.x, cell.y - 1)] * adjacent + //bottom adj
          
          stateAin[index(cell.x - 1, cell.y + 1)] * diagonals + //diag left top
          stateAin[index(cell.x + 1, cell.y + 1)] * diagonals + //diag right top
          stateAin[index(cell.x - 1, cell.y - 1)] * diagonals + //diag left bottom
          stateAin[index(cell.x + 1, cell.y - 1)] * diagonals; //diag right bottom
  
  return con;
}

//Convolution for 3x3 matrix
fn convolutionB(cell:vec3i) -> f32{
   var con = 0.;
  
   //calculate convolusion
   let i = index(cell.x, cell.y);
    
    
    var center = -1.;
    var adjacent = .2;
    var diagonals = 0.05;
    
    con = stateBin[i] * center +
          
          stateBin[index(cell.x - 1, cell.y)] * adjacent + //left adj
          stateBin[index(cell.x + 1, cell.y)] * adjacent + //right adj
          stateBin[index(cell.x, cell.y + 1)] * adjacent + //top adj
          stateBin[index(cell.x, cell.y - 1)] * adjacent + //bottom adj
          
          stateBin[index(cell.x - 1, cell.y + 1)] * diagonals + //diag left top
          stateBin[index(cell.x + 1, cell.y + 1)] * diagonals + //diag right top
          stateBin[index(cell.x - 1, cell.y - 1)] * diagonals + //diag left bottom
          stateBin[index(cell.x + 1, cell.y - 1)] * diagonals; //diag right bottom
  
  return con;
}

//Reaction Diffusion Equation A
fn diffusionB(A: f32, B: f32, feed: f32, kill : f32, dA : f32, dB : f32, cell:vec3i) -> f32 {
    var B1: f32 = 0.0;
    var con = convolutionB(cell);
   
    // Calculate diffusion
    B1 = B + (dB * con + (A * B * B) - (kill + feed) * B);

    return B1;
}

//Reaction Diffusion Equation A
fn diffusionA(A: f32, B: f32, feed: f32, kill : f32, dA : f32, dB : f32, cell:vec3i) -> f32 {
    var A1: f32 = 0.0;
    var con = convolutionA(cell);
   
    // Calculate diffusion
    A1 = A + (dA * con - (A * B * B) + feed * (1 - A));

    return A1;
}



@compute
@workgroup_size(8,8)
fn cs( @builtin(global_invocation_id) _cell:vec3u ) {
  let cell = vec3i(_cell);
  let i = index(cell.x, cell.y);
  

  //where to set A & B
  
  //var A = 1.; //based off of last call
  //var B = 1.; //based off of last call
  
  //var A = stateAin[i]; //based off of last call
  //var B = stateBin[i]; //based off of last call
  
  
  
  
  var feed = 0.055;
  var kill = 0.062;
  var dA = 1.;
  var dB = .5;
  
  
  var A1 = diffusionA(stateAin[i], stateBin[i], feed, kill, dA, dB, cell);
  var B1 = diffusionB(stateAin[i], stateBin[i], feed, kill, dA, dB, cell);

  
  
  stateAout[i] = A1;
  stateBout[i] = B1;
  

  
  
}
