import { Sprite, Texture } from "pixi.js";
import { gameAssets } from "../config/GameAssets";


export class FullScreenButton extends Sprite {

    private _isInFullScreen = false

    private readonly _enterIcon = Texture.from(gameAssets.fullScreenEnter)
    private readonly _exitIcon = Texture.from(gameAssets.fullScreenExit)


    constructor(onToggle: (isFullScreen: boolean) => void) {
        super()

        this.texture = this._enterIcon
        this.interactive = true
        this.cursor = "pointer"
        this.on("pointerup", () => {
            this._isInFullScreen = !this._isInFullScreen
            this.texture = this._isInFullScreen ? this._exitIcon : this._enterIcon
            onToggle(this._isInFullScreen)
        })
    }
}