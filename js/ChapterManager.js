import ChapterSink from "./chapter/ChapterSink.js"

//Chapter管理类
export default class ChapterManager {
    constructor(stage) {
        this.stage = stage;
        this.chapters = [];
        this.idx = 0;
    }
    init(stage) {
        this.chapters = [
            new ChapterSink(stage, 'sink'),
        ];
        this.chapters.forEach(chapter => {
            chapter.addEventListener('done', this._onDone.bind(this));
        });
    }
    //开始
    start(key) {
        this.idx = this._getChapterIdx(key);
        this.chapters[this.idx].start();
    }
    //下一个
    next() {
        const currChapter = this._getCurrChapter();
        currChapter.stop();
    }
    //更新
    update(time) {
        this.chapters[this.idx] && this.chapters[this.idx].update(time);
    }
    _onDone(event) {
        this.stage.bindClick(() => {
            this.next();
        });
    }
    //当前章index
    _getChapterIdx(key) {
        for (let i = 0; i < this.chapters.length; i++) {
            if (this.chapters[i].key === key)
                return i;
        }
        return 0;
    }
    //当前章
    _getCurrChapter() {
        return this.chapters[this.idx];
    }
}