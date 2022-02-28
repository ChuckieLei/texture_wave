import SinkMetaball from "../element/SinkMetaball.js";
import Chapter from "./Chapter.js";

export default class ChapterSink extends Chapter {
    constructor(stage, text, key) {
        super();
        this.text = text;
        this.key = key;
        this.stage = stage;
        this.mask = null;
    }
    start() {
        this.stage.renderer.setClearColor(0x000000, 1);     //设置舞台背景色为黑色
        this.stage.camera.position.set(0, 0, 2);
        this.stage.controls.target.set(0, 0, 0);
        this.stage.controls.update();
        this.stage.fixCameraBasePos();
        this.mask = new SinkMetaball(2, 2, this.stage.cache.get('textSink'));   //textSink图片
        this.stage.add(this.mask);
        this.done(5);
    }
    update() {
        this.mask && this.mask.update();
    }
    stop(cb) {
        this.mask.hide(() => {
            this.mask && this.stage.remove(this.mask);
            this.mask = null;
            cb && cb();
        });
    }
}