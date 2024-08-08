import { CanvasTextMetrics, Container, Sprite, Text, TextStyle, TextStyleFontWeight } from "pixi.js";


export type Icon = "boo" | "coin" | "flower" | "fuzzy" | "goomba" | "mushroom"


export class DecoratedText extends Container {

    static readonly PLACEHOLDER = " ‎ ‎ ‎ "

    
    constructor(private readonly string: string, private readonly icons: Icon[], private readonly size: number = 400) {
        super()

        const weights: TextStyleFontWeight[] = ["200", "300", "400", "500", "600", "700"]
        const style = new TextStyle({
            fill: Math.round(Math.random() * 0xffffff),
            fontSize: Math.round(Math.random() * 24) + 12,
            fontWeight: weights[Math.floor(Math.random() * weights.length)]
        })
        const text = new Text({ text: this.string, style: style })
        this.addChild(text)

        const indexes = this.placeholderIndexes(string, DecoratedText.PLACEHOLDER)
        const { coords, metrics } =  this.getCoordinates(text, indexes)
        coords.forEach((coords, index) => {
            const icon = Sprite.from(icons[index] + ".png")
            icon.position.set(coords.x, coords.y)
            icon.anchor.set(0.5)
            icon.height = metrics.lineHeight
            icon.width = icon.height
            text.addChild(icon)
        })

    }



    private getCoordinates(text: Text, indexes: number[]): { coords: { x: number, y: number }[], metrics: CanvasTextMetrics } {
        const coords: { x: number, y: number }[] = []
        const string = text.text
        const style = text.style
        const metrics = CanvasTextMetrics.measureText(string, style)
        const centerOffset = {
            x: CanvasTextMetrics.measureText(DecoratedText.PLACEHOLDER, style).width / 2,
            y: metrics.lineHeight / 2
        }

        let currentCharacter = 0
        let currentIndex = 0
        let charMetrics: CanvasTextMetrics
        const pos = { x: 0, y: 0 }

        for (let line = 0; line < metrics.lines.length; line++) {
            for (let char = 0; char < metrics.lines[line].length; char++) {
                if (indexes[currentIndex] == currentCharacter) {
                    coords.push({ x: pos.x + centerOffset.x, y: pos.y + centerOffset.y })
                    currentIndex++
                }
                if (currentIndex >= indexes.length) {
                    return { coords: coords, metrics: metrics }
                } else {
                    charMetrics = CanvasTextMetrics.measureText(metrics.lines[line][char], style)
                    pos.x += charMetrics.width
                    currentCharacter++
                }
            }
            pos.x = text.x
            pos.y += metrics.lineHeight
        }

        return { coords: coords, metrics: metrics }
    }


    private placeholderIndexes(string: string, key: string): number[] {
        const result: number[] = []
        let keyIndex = string.indexOf(key, 0)
        while (keyIndex > -1) {
            result.push(keyIndex)
            keyIndex = string.indexOf(key, keyIndex + 1)
        }
        return result
    }

}