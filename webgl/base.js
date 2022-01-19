const canvas = document.getElementById("myCanvas");

/**
 * @type {WebGL2RenderingContext}
 */
const gl = canvas.getContext("webgl");

// 创建和初始化一个 WebGLProgram 对象
const program = gl.createProgram();

// 定义变量用于存放 GLSL 代码
// 【注意，我们在这里先只定义了变量，并未对他们进行赋值，这两个变量在接下来将用于存放顶点着色器以及片元着色器的 GLSL 的代码片段】
// 定义顶点着色器代码：
const VSHADER_SOURCE = `
  // vec4 代表的是一个四维向量，我们在此定义一个名为 a_Position 的变量
  attribute vec4 a_Position;
  void main(){
    // gl_Position 是 GLSL 内置的 api
    gl_Position = a_Position;
  }
`;

// 定义片元着色器代码：
const FSHADER_SOURCE = `
  void main(){
    // 添加一个 rgba 值为 (1.0, 0.0, 0.0, 1.0) 的颜色【红色】
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); 
  }
`;

// shader 应该包含两部分:
// 一部分是 context WebGL api 定义出来 shader
// 第二部分是 shader 本身的代码
function createShader(gl, sourceCode, type) {
  // 创建 shader（着色器）
  const shader = gl.createShader(type);
  gl.shaderSource(shader, sourceCode);
  gl.compileShader(shader);
  return shader;
}

// 定义 vertex shader（顶点着色器）
const vertexShader = createShader(gl, VSHADER_SOURCE, gl.VERTEX_SHADER);
// 定义 frament shader（片元着色器）
const fragmentShader = createShader(gl, FSHADER_SOURCE, gl.FRAGMENT_SHADER);

//  将着色器附加到 program 上
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

// link program to context
gl.linkProgram(program);
gl.useProgram(program);
gl.program = program;

function initVertexBuffers(gl) {
  // 传入三角形的三个顶点到 vertices
  const vertices = new Float32Array([
    0, 0.5, -0.5, -0.5, 0.5, -0.5,
    0, 0.8, -0.8, -0.8, 0.8, -0.8,
  ]);
  // 顶点个数
  const n = 6;
  // 创建一个 buffer
  const vertexBuffer = gl.createBuffer();
  // 将 vertexBuffer 与 webgl 绑定，第一个参数为开辟缓冲区的类型，其有两种：
  // 1. Array Buffer
  // 2. Element Buffer 定点索引缓冲区
  // 在同一个空间内，经过光栅化渲染到屏幕上的顶点可能是重复的，因此使用定点索引缓冲区可以减少缓存空间
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // 将数据写入到 vertexBuffer 中
  // 第三个参数是控制缓冲区如何使用，用于优化性能，static draw 的意思是第一次对缓冲区 render 后就再也不会对数据进行修改
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  // 获取变量 a_Position 在 vertex shader 中的地址
  const a_Position = gl.getAttribLocation(gl.program, "a_Position");
  // 将 bufferData 传入到 a_Position 的地址，同时需要规定一个顶点对应数组中的几个数据
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  // 启用 a_Position constiable
  gl.enableVertexAttribArray(a_Position);
  return n;
}
const n = initVertexBuffers(gl);

gl.clearColor(0, 0, 0, 1);
// 调用clear方法将当前绘制结果清空
gl.clear(gl.COLOR_BUFFER_BIT);
// 按照三角形的图源去绘制，从 buffer 的起始位获取数据，绘制 n 个顶点
gl.drawArrays(gl.TRIANGLES, 0, n);
