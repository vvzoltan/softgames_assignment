### Game Developer Assignment

This is my take on Softgame's coding assginment. The hosted web version can be found here: https://softgames-demo.web.app/


### Notes

I belong to the group of developers who think code should be self documenting. I believe the code in this assignment is quite easy to read and understand and any extra documentation would not add any value, therefore I opted to not add any.


### Known issues

 - I noticed the decorated text is not working properly if the text is word wrapped. As far as I can tell this is an issue with how Pixi measures the text with `CanvasTextMetrics`. This issue might be related:  https://github.com/pixijs/pixijs/issues/9466
 - Pixi v8 has some compatibility issues with the particle container and emitter. One of the developers has fixed it but, for now it is only available in his personal repo (until it gets pushed to the official Pixi update), hence the dependency: `@barvynkoa/particle-emitter`


 Thank you for your time!

