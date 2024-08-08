import { Container, Graphics, Text, TextStyle } from "pixi.js";

export type MenuItem = "Cards" | "Text" | "Particles"


export class Menu extends Container {

    private readonly _items: MenuItem[] = ["Cards", "Text", "Particles"]
    private _selected?: MenuButton

    private static readonly COLOR_BACKGROUND = 0x666666


    constructor(width: number, listener: (item: MenuItem) => void) {
        super()
        this.addChild(this.getBackground(width))
        this.buildItems(width, listener)
    }


    private buildItems(width: number, listener: (item: MenuItem) => void) {
        this._items.forEach((value, index) => {
            const button = new MenuButton(width / 3, 50, value)
            button.x = (width / 3) * index
            button.on("pointerup", () => {
                if (this._selected) {
                    this._selected.onDeselected()
                }
                this._selected = button
                button.onSelected()
                listener(value)
            })
            button.on("mouseover", () => button.onOver())
            button.on("mouseleave", () => button.onOut())
            button.on("mousedown", () => button.onDown())
            button.on("mouseup", () => button.onUp())
            this.addChild(button)
        })
    }


    private getBackground(width: number): Graphics {
        const shape = new Graphics()
        shape.rect(0, 0, width, 50)
        shape.fill({ color: Menu.COLOR_BACKGROUND })
        return shape
    }

}



class MenuButton extends Graphics {

    private static readonly COLOR_REGULAR = 0x593e67
    private static readonly TINT_OVER = 0x84495f
    private static readonly ALPHA_REGULER = 1
    private static readonly ALPHA_DOWN = 0.5


    constructor(width: number, height: number, title: string) {
        super()

        this.rect(0, 0, width, height)
        this.fill({ color: MenuButton.COLOR_REGULAR })

        const label = new Text({ text: title, style: new TextStyle({ fill: 0xffffff, fontSize: 24 }) })
        label.anchor.set(0.5)
        label.position.set(width / 2, height / 2)
        this.addChild(label)

        this.cursor = "pointer"
        this.enabled = true
    }


    set enabled(value: boolean) {
        this.interactive = value
    }


    onOver() {
        this.tint = MenuButton.TINT_OVER
    }


    onOut() {
        this.tint = 0xFFFFFF
    }


    onDown() {
        this.alpha = MenuButton.ALPHA_DOWN
    }


    onUp() {
        this.alpha = MenuButton.ALPHA_REGULER
    }


    onSelected() {
        this.onOver()
        this.enabled = false
    }


    onDeselected() {
        this.onOut()
        this.enabled = true
    }
}