/**
 * MmlContainer.js
 *
 * @author @MIRROR_
 * @license MIT
 */

/**
 * MMLデータを格納するクラス
 */
class MmlContainer
{
    /**
     * コンストラクタ
     * @param object args 設定情報
     *
     * {
     *   Title:    "曲名",   //（省略可）
     *   Composer: "作曲者", //（省略可）
     *   Arranger: "編曲者", //（省略可）
     *   Tracks: {
     *       トラック番号  // 0:global, 1:pulse1, 2:pulse2, 3:triangle, 4:noise
     *        : "MML", ...
     *    }
     * }
     */
    constructor(args = null) {
        this.title = '';
        this.composer = '';
        this.arranger = '';
        this.trackNumbers = [];
        this.tracks = {};

        if (args === null) return;

        for (const key in args) {
            let value = args[key];

            switch (key) {
            case 'Title':
                // 曲名
                this.title = value;
                break;

            case 'Composer':
                // 作曲者名
                this.composer = value;
                break;

            case 'Arranger':
                // 編曲名
                this.arranger = value;
                break;

            case 'Tracks':
                // トラック
                for (const tr in value) {
                    let mml = value[tr];
                    this.trackNumbers.push(tr);
                    mml = mml.replace(/\r*\n|\r|\t| +/, "") + "\n";
                    this.tracks[tr] = [...mml];
                }
                break;
            }
        }
    }

    /**
     * MMLテキストの解析
     * @param テキスト
     * @return コンテナ情報
     */
    static parse(text) {
        let container = new MmlContainer();
        let lines = text.replace(/\/\*[\s\S]*\*\//, "").split(/\r*\n|\r/);
        let trackNo = 0;
        let tracks = {0:'', 1:'', 2:'', 3:'', 4:''};

        for (const index in lines) {
            let line =  lines[index];
            let l = line.replace(/\/\/[\s\S]*$/, "").trimStart().replace(/[ \t]+/, " ");
            let s = l.indexOf('#');
            let c = l.indexOf(' ');

            if (c < 0) {
                tracks[trackNo] += l;

            } else {
                let key = l.substr(0, c);
                let value = l.substr(c + 1);

                if (s === 0) {
                    switch (key) {
                    case '#Title':
                        // 曲名
                        container.title = value;
                        break;

                    case '#Composer':
                        // 作曲名
                        container.composer = value;
                        break;

                    case '#Arranger':
                        // 編曲名
                        container.arranger = value;
                        break;
                    }

                } else {
                    switch (key.toUpperCase()) {
                    case 'TR0':
                        trackNo = 0;
                        break;
                    case 'TR1':
                        trackNo = 1;
                        break;
                    case 'TR2':
                        trackNo = 2;
                        break;
                    case 'TR3':
                        trackNo = 3;
                        break;
                    case 'TR4':
                        trackNo = 4;
                        break;
                    default:
                        value = l;
                        break;
                    }

                    tracks[trackNo] += value;
                }
            }
        }

        for (trackNo = 0; trackNo <= 4; ++trackNo) {
            let mml = tracks[trackNo];
            if (mml !== '') {
                mml = mml.replace(/\r*\n|\r|\t| +/, "") + "\n";
                container.tracks[trackNo] = [...mml];
                if (trackNo > 0) {
                    container.trackNumbers.push(trackNo);
                }
            }
        }

        return container;
    }
}
