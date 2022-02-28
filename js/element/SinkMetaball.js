import * as THREE from "../../../../build/three.module.js";
import WaveTypo from "./WaveTypo.js";

const vs = `
  varying vec2 v_uv;
  void main() {
    v_uv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const fs = `
  precision mediump float;
  varying vec2 v_uv;
  uniform vec3 u_metaballs[50];

  void main() {
    vec2 uv = v_uv;
    vec2 st = 2.0 * uv - 1.0;
    float v = 0.0;
    for ( int i = 0; i < 50; i++ ) {        //计算metaball势能
      vec3 mb = u_metaballs[i];
      float dx = st.x + mb.x;
      float dy = st.y + mb.y;
      float r = mb.z;                       //z是半径
      v += r * r / (dx * dx + dy * dy);
    }
    //vec4 color = vec4(17.0/255.0, 17.0/255.0, 17.0/255.0, 1.0);
    vec4 color = vec4(0., 0., 0., 1.0);
    if (v > 2.7) {              // 势能>2.7透明度为0 否则颜色为黑色
      color.a = 0.0;
      color.rgb = vec3(1.0);
    } else {
      //color = vec4(0.0, 0.0, 0.0, 1.0);
    }
    gl_FragColor = color;
  }
`;
export default class SinkMetaball extends THREE.Object3D {
    constructor(width = 1, height = 1, texture) {
        super();
        this.NUM_METABALLS = 50;
        this.metaballs = [];
        this.uniforms = {
            u_progress: { value: 0.0 },
            u_time: { value: 0.0 },
            u_metaballs: { type: 'v3', value: this.metaballs },
        };
        this.width = width;
        this.height = height;
        this.shape = null;
        this.wireframe = null;
        this.typo = null;
        this.draw(texture);
    }
    draw(texture) {
        this._createMetaballs();            //创建metaballs
        this._createShape();                //创建几何图形
        this._createTypo(texture);
        this._animate();
    }
    //每帧更新,u_time累加 typo更新 metaballs更新
    update() {
        this.uniforms.u_time.value += 0.01;
        this.typo.update();
        this.metaballs.forEach(ball => {
            if (!ball.ready)
                return;
            ball.update();
        });
    }
    //离场
    hide(cb) {
        this.metaballs.forEach(mb => {
            TweenLite.delayedCall(Math.random() * 1.5, () => {
                mb.setTarget(0, -2.5);                              //mb往下位移
            });
        });
        TweenLite.delayedCall(3.5, () => {                          //3.5S之后移除
            cb();
        });
    }
    //进场metaballs动画
    _animate() {
        this.metaballs.forEach(mb => {
            TweenLite.delayedCall(Math.random() * 4, () => {
                mb._ready = true;
            });
        });
    }
    _createShape() {
        this.uniforms = {
            u_progress: { value: 0.0 },
            u_time: { value: 0.0 },
            u_metaballs: { type: 'v3', value: this.metaballs },
        };
        const geo = new THREE.PlaneBufferGeometry(this.width, this.height, 1, 1);           //平面图形    
        const mat = new THREE.ShaderMaterial({                                              //自定义shader材质
            vertexShader: vs,
            fragmentShader: fs,
            uniforms: this.uniforms,
            transparent: true,
            side: THREE.DoubleSide,
        });
        this.shape = new THREE.Mesh(geo, mat);          //根据几何图形和材质创建mesh
        this.add(this.shape);

        let layers = new THREE.Layers();
        layers.set(0);
        this.shape.layers = layers;
    }
    _createWireframe() {
        this.wireframe = new THREE.Mesh(new THREE.PlaneBufferGeometry(this.width, this.height, 1, 1), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }));
        this.add(this.wireframe);
    }
    _createMetaballs() {
        for (let i = 0; i < this.NUM_METABALLS; i++) {              //创建50个metaballs 开始和结束时的运动用到
            const v = new Metaball(Math.random() * 0.8 - 0.4, Math.random() * 0.8 + 1.2, Math.random() * 0.2 + 0.02);
            this.metaballs.push(v);
        }
    }
    _createTypo(texture) {
        this.typo = new WaveTypo(this.width, this.height, texture);
        this.typo.draw();
        this.typo.position.z = -0.2;
        this.add(this.typo);

        let layers = new THREE.Layers();
        layers.set(1);
        this.typo.layers = layers;
    }
}
class Metaball extends THREE.Vector3 {                          //一个metaball只是一个三维坐标, 这里x,y作为Metaball的坐标, z为Metaball的半径
    constructor(x, y, z) {
        super(x, y, z);
        this.target = new THREE.Vector2(Math.random() * 0.4 - 0.2, 0);  //target决定metaball位置
        this.velocity = new THREE.Vector2();                    //速度
        this.acceleration = new THREE.Vector2();                //加速度
        this._ready = false;                                    //是否准备好
        this.velocityMax = 0.03;                                //最大速度
        this.acceLength = 0.002;
    }
    get ready() {
        return this._ready;
    }
    set ready(value) {
        this._ready = value;
    }
    //设定metaball的位置
    setTarget(x, y) {
        this.target.set(x, y);
    }
    update() {
        const _sub = new THREE.Vector2(this.x, this.y);
        const acce = this.target.clone().sub(_sub);
        acce.normalize().multiplyScalar(this.acceLength);       //单位化后*acceLength得到向量加速度
        this.acceleration = acce;                               
        this.velocity.add(this.acceleration);
        this.velocity.clampLength(0, this.velocityMax);         //速度在0-0.03范围内
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}