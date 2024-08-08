import { gsap, Linear } from "gsap"
import { Sprite, Texture } from "pixi.js"

export type Suite = "diamonds" | "hearts" | "clubs" | "spades"
export type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "j" | "q" | "k" | "a"


export class Card extends Sprite {

    private showsFace: boolean = false


    constructor(readonly suite: Suite, readonly rank: Rank) {
        super(Texture.from("cards/card_back.png"))
        this.anchor.set(0.5, 0.5)
    }


    showFront() {
        this.texture = this.getTexture(true)
    }


    showBack() {
        this.texture = this.getTexture(false)
    }

    
    flip() {
        const timeline = gsap.timeline()
        timeline.to(this.scale, { x: 0, duration: 0.2, ease: Linear.easeIn })
        timeline.to(this.scale, {
            x: 1,
            duration: 0.2,
            onStart: () => {
                this.showsFace = !this.showsFace
                if (this.showsFace) {
                    this.showFront()
                } else {
                    this.showBack()
                }
            },
            ease: Linear.easeOut
        })
        timeline.play()
    }


    private getTexture(front: boolean) {
        return Texture.from(front ? ("cards/card_" + this.suite + "_" + this.rank + ".png") : ("cards/card_back.png"))
    }

}