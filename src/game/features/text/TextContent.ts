import { Container } from "pixi.js";
import { DecoratedText, Icon } from "./DecoratedText";
import { GameContent } from "../GameContent";


export class TextContent extends Container implements GameContent {

    private _interval?: NodeJS.Timeout
    private _decoratedText?: DecoratedText
    private _size: {width: number, height: number} = {width: 0, height: 0}

    static readonly LOREM_IPSUM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    static readonly ICONS: Icon[] = ["boo", "coin", "flower", "fuzzy", "goomba", "mushroom"]


    constructor() {
        super()
        this._interval = setInterval(() => { this.generateNewText() }, 2_000)
        this.generateNewText()
    }

    remove(): void {
        this.removeFromParent()
        if (this._interval) clearInterval(this._interval)
    }


    resize(width: number, height: number): void {
        this._size = { width: width, height: height }
        this.centerText()
    }


    private generateNewText() {
        const [text, icons] = this.getDecoratedString()
        this._decoratedText?.removeFromParent()
        this._decoratedText = this.addChild(new DecoratedText(text, icons))
        this.centerText()
    }


    private centerText() {
        if (this._decoratedText) {
            this._decoratedText.position.set(
                (this._size.width - this._decoratedText.width) / 2,
                (this._size.height - this._decoratedText.height) / 2
            )
        }
    }


    private getDecoratedString(): [string, Icon[]] {
        const words = TextContent.LOREM_IPSUM.split(" ")
        const numberOfWords = Math.floor((words.length - 3) * Math.random()) + 3
        const numberOfIcons = Math.round(Math.random() * (numberOfWords / 3))
        const icons = Array.from({length: numberOfIcons}, () => TextContent.ICONS[Math.floor(Math.random() * TextContent.ICONS.length)])
        const availableIconPositions = Array.from({length: numberOfWords}, (_, index) => index)
        const iconPositions = Array.from({ length: numberOfIcons }, () => {
            const positionIndex = Math.floor(Math.random() * availableIconPositions.length)
            const position = availableIconPositions[positionIndex]
            availableIconPositions.splice(positionIndex, 1)
            return position
        }).sort((a, b) => a - b)
        const decoratedText = Array.from({length: numberOfWords + numberOfIcons}, (_, index) => {
            const offsetIndex = index - (numberOfIcons - iconPositions.length)
            if (offsetIndex == iconPositions[0]) {
                iconPositions.shift()
                return DecoratedText.PLACEHOLDER
            } else {
                return words[offsetIndex]
            }
        }).join(" ")
        return [decoratedText, icons]
    }

}