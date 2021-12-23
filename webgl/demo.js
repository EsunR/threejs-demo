var canvas = document.getElementById('myCanvas')
var gl = canvas.getContext('webgl')

var program = gl.createProgram()

var VSHADER_SOURCE, FSHADER_SOURCE

VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main(){
    gl_Position = a_Position * u_ViewMatrix * u_ModelMatrix * u_ProjectionMatrix;
  }
`


FSHADER_SOURCE = `
  void main(){
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
`

var vertexShader, fragmentShader

// shader 应该包含两部分，一部分是 context WebGL api 定义出来 shader ，第二部分是 shader 本身的代码
function createShader(gl, sourceCode, type) {
  // 创建 shader
  var shader = gl.createShader(type)
  gl.shaderSource(shader, sourceCode)
  gl.compileShader(shader)
  return shader
}

// 定义 vertex shader
vertexShader = createShader(gl, VSHADER_SOURCE, gl.VERTEX_SHADER)

// 定义 frament shader
fragmentShader = createShader(gl, FSHADER_SOURCE, gl.FRAGMENT_SHADER)

//  添加 shader 到 program
gl.attachShader(program, vertexShader)
gl.attachShader(program, fragmentShader)

// 连接 program 到 context
gl.linkProgram(program)
gl.useProgram(program)
gl.program = program

// 初始化旋转角度和间隔时间
var currentAngle = 0
var g_last = Date.now()

var tick = function () {
  animate()
  draw()
  requestAnimationFrame(tick)
}

function initVertexBuffers(gl) {
  // 传入三角形的三个顶点到 vertices
  var vertices = new Float32Array([
    0, 0.5, -0.5, -0.5, 0.5, -0.5
  ])
  // 顶点个数
  var n = 3
  // 创建一个 buffer
  var vertexBuffer = gl.createBuffer()
  // 将 vertexBuffer 与 webgl 绑定
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  // 将数据写入到 vertexBuffer 中
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
  // 获取变量 a_Position 在 vertex shader 中的地址
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position')
  // 将 bufferData 传入到 a_Position 的地址，同时需要规定一个顶点对应数组中的几个数据
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)
  // 启用 a_Position variable
  gl.enableVertexAttribArray(a_Position)
  return n
}


// js 通过 buffer 向 shader 中传递相关数据
// 将顶点位置传递到 vertex shader 中
var n = initVertexBuffers(gl)
gl.clearColor(0, 0, 0, 1)

// 获取旋转矩阵
var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix')
var modelMatrix = new Matrix4()

// 获取视图矩阵
var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix')
var viewMatrix = new Matrix4()
viewMatrix.lookAt(0.1, 0.1, 0.1, 0, 0, 0, 0, 1, 0)

var u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix')
var projectionMatrix = new Matrix4()
// projectionMatrix.perspective(120, 1, 0.1, 1000)
projectionMatrix.ortho(-1, 1, -1, 1, 0.1, 1000)


// 绘制
function draw() {
  // 计算旋转角度后的点坐标
  modelMatrix.setRotate(currentAngle, 0, 1, 0)
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements)
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projectionMatrix.elements)
  // 调用clear方法将当前绘制结果清空
  gl.clear(gl.COLOR_BUFFER_BIT)
  // 按照三角形的图源去绘制，从 buffer 的起始位获取数据，绘制 n 个顶点
  gl.drawArrays(gl.TRIANGLES, 0, n)
}

function animate() {
  var now = Date.now()
  var duration = now - g_last
  g_last = now
  // 计算当前时间下的图形旋转角度(图形会每秒旋转180°)
  currentAngle = currentAngle + duration / 1000 * 180
}

tick()