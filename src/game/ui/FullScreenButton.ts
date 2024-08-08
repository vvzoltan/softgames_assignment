import { Sprite, Texture } from "pixi.js";


export class FullScreenButton extends Sprite {

    private _isInFullScreen = false

    private readonly _enterIcon = Texture.from("full_enter.png")
    private readonly _exitIcon = Texture.from("full_exit.png")


    constructor(onToggle: (isFullScreen: boolean) => void) {
        super()

        this.texture = this._enterIcon
        this.interactive = true
        this.cursor = "pointer"
        this.on("click", () => {
            this._isInFullScreen = !this._isInFullScreen
            this.texture = this._isInFullScreen ? this._exitIcon : this._enterIcon
            onToggle(this._isInFullScreen)
        })
    }
}