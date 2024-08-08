import { Application, Assets } from "pixi.js"
import { Game } from "./game/Game"


window.addEventListener('load', async () => {

    const canvas = document.querySelector('div')
    if (!canvas) {
        console.error("Invalid HTML layout: missing Pixi container")
        return
    }

    const app = new Application()
    await app.init({
                       background: 0x000000,
                       hello: true,
                       resizeTo: canvas,
                       antialias: true,
                       resolution: window.devicePixelRatio,
                       autoDensity: true
                   });
    canvas.appendChild(app.canvas)

    window.addEventListener('resize', () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
    });

    await Assets.load(['/assets/sheet.json'])
    new Game(app.stage, app.ticker)

});