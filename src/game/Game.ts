import { Container, Ticker, Text, TextStyle, Texture, Sprite } from "pixi.js";
import { TextContent } from "./features/text/TextContent";
import { Fire } from "./features/particles/Fire";
import { Menu, MenuItem } from "./ui/Menu";
import { Table } from "./features/cards/Table";
import { FullScreenButton } from "./ui/FullScreenButton";
import { Config } from "./config/Config";
import { GameContent } from "./features/GameContent";
import { gameAssets } from "./config/GameAssets";


export class Game {

    private readonly _content = new Container()
    private readonly _ui = new Container()
    private readonly _background: Sprite
    private readonly _fullScreenButton: FullScreenButton
    private readonly _menu: Menu

    private _currentContent?: GameContent

    private static readonly PADDING = 10


    constructor(private readonly stage: Container, private readonly ticker: Ticker) {
        this._background = this.stage.addChild(new Sprite({ texture: Texture.from(gameAssets.background), width: Config.width, height: Config.height }))
        this._background.alpha = 0.5
        this._fullScreenButton = this._ui.addChild(this.getFullScreenButton())
        this._menu = this._ui.addChild(new Menu(Config.width - (Game.PADDING * 2), item => this.switchContent(item)))
        this.stage.addChild(this._content)
        this.stage.addChild(this._ui)
        this.addFrameRateDisplay()
        this.setupResizeListener()
    }


    private setupResizeListener() {
        window.addEventListener('resize', () => {
            this.resizeElements()
        });
        this.resizeElements()
    }


    private resizeElements() {
        let size: { width: number, height: number }
        if (document.fullscreenElement) {
            size = { width: window.innerWidth, height: window.innerHeight }
        } else {
            size = { width: Config.width, height: Config.height }
        }
        this._background.setSize(size.width, size.height)
        this._fullScreenButton.position.set(size.width - this._fullScreenButton.width - Game.PADDING, Game.PADDING)
        this._menu.position.set((size.width - this._menu.width) / 2, size.height - this._menu.height - Game.PADDING)
        this._currentContent?.resize(size.width, size.height)
    }


    private switchContent(item: MenuItem) {
        this._currentContent?.remove()
        switch (item) {
            case "Cards":
                this._currentContent = this._content.addChild(new Table())
                break
            case "Text":
                this._currentContent = this._content.addChild(new TextContent())
                break
            case "Particles":
                this._currentContent = this._content.addChild(new Fire(this.ticker))
                break
        }
        this.resizeElements()
    }


    private getFullScreenButton(): FullScreenButton {
        const div = document.querySelector('div')
        const fullScreenButton = new FullScreenButton(isFullScreen => {
            if (isFullScreen) {
                div?.requestFullscreen()
            } else {
                window.document.exitFullscreen()
            }
        })
        return fullScreenButton
    }


    private addFrameRateDisplay() {
        const text = new Text({ style: new TextStyle({ fill: 0xFFFFFF, fontWeight: "400", fontSize: 12 }) })
        text.position.set(Game.PADDING)
        this._ui.addChild(text)
        this.ticker.add(ticker => { text.text = "FPS: " + ticker.FPS.toFixed(2) })
    }

}