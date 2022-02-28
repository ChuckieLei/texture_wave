import * as THREE from "../../../../build/three.module.js";

const typoVs = `
  varying vec2 v_uv;
  void main() {
    v_uv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const typoFs = `
  precision mediump float;
  varying vec2 v_uv;
  uniform sampler2D u_texture;
  uniform float u_time;
  const float speed = 0.2;
  const float frequency = 8.0;

  vec2 shift( vec2 p ) {
    float x = frequency * (p.x + 3.*u_time*speed);            // x与p.x,u_time成正比
    float y = frequency * (p.y + 3.*u_time*speed);            // y与p.y,u_time成正比
    vec2 q = cos(vec2(cos(x-y)*cos(y), sin(x+y)*sin(y)));     //q属于cos周期函数的值,随x,y变化 变化没有那么单一
    return q;
 }

  vec2 wave(vec2 uv) {
    float amplitude = 0.015;
    float frequency = 1.;
    float x = sin(30. * uv.x + 8.* u_time) * amplitude;   //x随sin函数波动作为偏移量 受uv.x影响 即y相同情况下 x偏移一样
    float y = sin(10. * uv.y + 8.* u_time) * amplitude;   //y随sin函数波动作为偏移量 受uv.y影响 即x相同情况下 y偏移一样
  
    return vec2(uv.x + x, uv.y + y);
  }

  void main() {
    vec2 uv = wave(v_uv);       //改变x,y得到一个x,y附近的随机值
    vec4 color = texture2D(u_texture, uv);
    if (color.a == 0.0) {       //透明区域改成黑色
      color = vec4(10.0/255.0, 10.0/255.0, 10.0/255.0, 1.0);
    }
    // vec2 r = v_uv;
    // vec2 p = shift( r );      //[-1,1]
    // r += 1.0;
    // vec2 q = shift(r);        //[-1,1]
    // //改600.0改小可以增大效果
    // float amplitude = 2.0 / 300.0;
    // vec2 s = v_uv + amplitude * (p - q);

    // vec4 color = texture2D(u_texture, s);
    // if (color.a == 0.0) {       //透明区域改成黑色
    //   color = vec4(10.0/255.0, 10.0/255.0, 10.0/255.0, 1.0);
    // }
    gl_FragColor = color;
  }
`;
export default class WaveTypo extends THREE.Object3D {      //texture wave
    constructor(width = 1, height = 1, texture) {
        super();
        this.width = width;
        this.height = height;
        this.shape = null;
        this.wireframe = null;
        this.uniforms = {
            u_time: { value: 0.0 },             //u_time时间轴的值
            u_progress: { value: 0.0 },         //u_progress控制进度
            u_texture: { value: texture },      //纹理
        };
    }
    draw() {
        this._createShape();
    }
    update() {
        this.uniforms.u_time.value += 0.01;
    }
    _createShape() {
        const geo = new THREE.PlaneBufferGeometry(this.width, this.height, 1, 1);     //创建平面图形
        const mat = new THREE.ShaderMaterial({                                        //自定义shader材质
            vertexShader: typoVs,
            fragmentShader: typoFs,
            uniforms: this.uniforms,
            transparent: true,
            side: THREE.DoubleSide,
        });
        this.shape = new THREE.Mesh(geo, mat);      //通过几何图形和材质创建mesh
        this.add(this.shape);
    }
    _createWireframe() {
        this.wireframe = new THREE.Mesh(new THREE.PlaneBufferGeometry(this.width, this.height, 1, 1), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }));
        this.add(this.wireframe);
    }
}