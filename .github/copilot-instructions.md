# Contexto do Projeto: Sistema de Interação para Convenção de Varejo

Você é um Desenvolvedor Frontend Sênior especialista em totens interativos e jogos casuais em JavaScript. Estamos construindo um sistema para um painel touch de uma convenção de varejo e logística.

## 1. Princípios de Design e UX (Touch-First)

- **Alvos de Toque:** Todos os elementos clicáveis devem ter no mínimo 60x60px.
- **Sem Hover:** Ignore estados de `:hover`, pois o usuário usa os dedos. Foque em estados de `:active`.
- **Prevenção de Zoom:** O sistema deve ser fixo. Não permitir pinch-zoom ou seleção de texto.
- **Feedback Visual:** Toda interação deve ter uma resposta visual imediata (animação de clique/toque).

## 2. Estrutura do Sistema

````javascript
var word = ["css", "syntax", "webgl", "react", "grid", "svg"];
var selectedWords = null;
var isCorrect = false;
var target = null;
var result = [];
function selectWordsDown(e) {
    target = this.event.target.textContent;
    isCorrect = word
        .map((item) => item.toUpperCase().startsWith(target))
        .includes(true);

    $("#puzzleGrid button").removeClass("selected_item");
    if (isCorrect) {
        $(this.event.target).addClass("selected_item");
        selectedWords = target;
    }
}
function selectWordsUp(e) {
    if (selectedWords == null) {
        $("#puzzleGrid button").removeClass("selected_item");
    } else {
        if (word.includes(selectedWords.toLowerCase())) {
            switch ($("#puzzleGrid").find(".selected_item").text()) {
                case "CSS":
                    $("#puzzleGrid").find(".selected_item").addClass("css").removeClass("selected_item");
                    result.push(selectedWords);

                    break;
                case "SYNTAX":
                    $("#puzzleGrid").find(".selected_item").addClass("syntax").removeClass("selected_item");
                    result.push(selectedWords);
                    break;
                case "WEBGL":
                    $("#puzzleGrid").find(".selected_item").addClass("webgl").removeClass("selected_item");
                    result.push(selectedWords);
                    break;
                    ```javascript
                    const globals = {
                        audio: true
                    };

                    // Audio
                    buttonClick = new Audio("https://s3-us-west-2.amazonaws.com/s.cdpn.io/217233/Buttonclick.mp3");
                    featured = new Audio("https://s3-us-west-2.amazonaws.com/s.cdpn.io/217233/featured.mp3");
                    slideSlow = new Audio("https://s3-us-west-2.amazonaws.com/s.cdpn.io/217233/slideSlow.mp3");
                    wrong = new Audio("https://s3-us-west-2.amazonaws.com/s.cdpn.io/217233/Wrong.mp3");
                    bg = new Audio("https://s3-us-west-2.amazonaws.com/s.cdpn.io/217233/retrogameloop.mp3");

                    wrong.volume = 0.2;
                    // ## Create a function to play our sounds
                    function playSound(sound) {
                        if (globals.audio) {
                            sound.play(); // Play sound
                        }
                    }

                    function playAudio(sound) {
                        sound.loop = true;
                        sound.volume = 0.7;
                        sound.play(); // Play sound
                    }

                    $(document).ready(function () {
                        setTimeout(function () {
                            $("button").animate({ opacity: 1 });
                        }, 2000);
                    });

                    $(".loader").click(function () {
                        $(".main_inner__loading").addClass("loaded");
                        playAudio(bg);
                    });

                    audioSwitch = 0;
                    sfxSwitch = 0;

                    $(".options_sf").click(function () {
                        if (sfxSwitch == 0) {
                            globals.audio = false;
                            sfxSwitch = 1;
                            $(this).css("opacity", "0.4");
                        } else {
                            globals.audio = true;
                            sfxSwitch = 0;
                            $(this).css("opacity", "1");
                        }
                    });
                    $(".options_bg").click(function () {
                        console.log("test");
                        if (audioSwitch == 0) {
                            $(bg).animate({ volume: 0 }, 600);
                            audioSwitch = 1;
                            $(this).css("opacity", "0.4");
                        } else {
                            $(bg).animate({ volume: 0.7 }, 600);
                            audioSwitch = 0;
                            $(this).css("opacity", "1");
                        }
                    });

                    // Quiz options
                    const sceneDelay = 870; // Scene delay in ms

                    // Elements
                    const answers = $(".main_inner__answers");
                    const answer = answers.find(".answer");
                    const circle = $(".main_inner__circle");

                    // Quiz progress
                    var progress = 1; // Change this to your scene number

                    // Transition check
                    var transitioning = false;

                    // End circle scale
                    const circleScale = 10;

                    // Our main array. You must add your details to this.
                    const scenes = [
                        {
                            name: "akuaku", // Must mirror class name
                            author: "João Santos", // Your name
                            codepenprofile: "jotavejv", // Your Codepen profile link
                            twitterprofile: "_jotavejv", // Your Codepen profile link
                            answer: "Crash Bandicoot", // The correct game, we can obfuscate this later if we want to hide answers
                            backgroundColor: "rgb(67, 34, 56)", // Page background color for your scene
                            hint: "UKA UKA is FREEEEE!"
                        },
                        {
                            name: "kirby", // Must mirror class name
                            author: "Katherine Kato", // Your name
                            codepenprofile: "kathykato", // Your Codepen profile link
                            twitterprofile: "kato_katherine", // Your Codepen profile link
                            answer: "Kirby", // The correct game, we can obfuscate this later if we want to hide answers
                            backgroundColor: "rgb(218, 68, 103)", // Page background color for your scene
                            hint: "A Nintendo classic"
                        },
                        {
                            name: "hexipal", // Must mirror class name
                            author: "Kristopher Van Sant", // Your name
                            codepenprofile: "KristopherVanSant", // Your Codepen profile link
                            twitterprofile: "KristopherVanSant", // Your Codepen profile link
                            answer: "Broken Age", // The correct game, we can obfuscate this later if we want to hide answers
                            backgroundColor: "#ea894f", // Page background color for your scene
                            hint: "An animated puzzle adventure"
                        },
                        {
                            name: "moogle", // Must mirror class name
                            author: "Jasmine Wright", // Your name
                            codepenprofile: "jnwright", // Your Codepen profile link
                            twitterprofile: "salsaverde", // Your Codepen profile link
                            answer: "Final Fantasy", // The correct game, we can obfuscate this later if we want to hide answers
                            backgroundColor: "#3fde9d", // Page background color for your scene
                            hint: "Kupo!"
                        },
                        {
                            name: "mario", // Must mirror class name
                            author: "Klara Miffili", // Your name
                            codepenprofile: "miffili", // Your Codepen profile link
                            twitterprofile: "KlaraMiffili", // Your Codepen profile link
                            answer: "Mario Brothers", // The correct game, we can obfuscate this later if we want to hide answers
                            backgroundColor: "#fb741e", // Page background color for your scene
                            hint: "Letsa gooooooo!"
                        },
                        {
                            name: "buster", // Must mirror class name
                            author: "Jamie Coulter", // Your name
                            codepenprofile: "jcoulterdesign", // Your Codepen profile link
                            twitterprofile: "jamiecoulter89", // Your Codepen profile link
                            answer: "Final Fantsy 7", // The correct game, we can obfuscate this later if we want to hide answers
                            backgroundColor: "#4d352f", // Page background color for your scene
                            hint: "1997 JRPG for PS1!"
                        }
                    ];

                    // List of random video games that our JS can pull from, feel free to add your own
                    const videoGames = [
                        "Pong",
                        "Zork",
                        "Space Invaders",
                        "Asteroids",
                        "Pac-Man",
                        "Defender",
                        "Donkey Kong",
                        "Frogger",
                        "Galaga",
                        "Joust",
                        "Ms. Pac-Man",
                        "Pitfall!",
                        "Tetris",
                        "Gauntlet",
                        "Super Mario Bros.",
                        "The Legend of Zelda",
                        "Contra",
                        "Double Dragon",
                        "Grand Theft Auto",
                        "Half-Life 2",
                        "Katamari Damacy",
                        "Metal Gear Solid 3",
                        "World of Warcraft",
                        "Civilization IV",
                        "Devil May Cry 3",
                        "God of War",
                        "Guitar Hero",
                        "Resident Evil 4",
                        "Shadow of the Colossus",
                        "Tom Clancys Splinter Cell",
                        "The Elder Scrolls IV",
                        "Gears of War",
                        "Ōkami",
                        "Spiderman",
                        "Tomb Raider",
                        "Wii Sports",
                        "BioShock",
                        "Call of Duty 4: Modern Warfare"
                    ];

                    // Start by assigning colors and other props to the scene
                    function setUp() {
                        // Lets start by setting the correct colors for our scene
                        $("body").css("background", scenes[progress - 1].backgroundColor);
                        circle.css("background", scenes[progress].backgroundColor);
                        circle.find(".circles").css("background", scenes[progress].backgroundColor);

                        // Then fade our first scene in
                        $(`.scene:nth-of-type(${progress})`).fadeIn();

                        // Loop through the array and add a breadcrum for each
                        for (let i in scenes) {
                            $(".main_inner__breadcrumbs").append('<div class="breadcrumb"></div>');
                        }

                        // Set first to active
                        $(".breadcrumb:first").addClass("active");

                        // Calculate width of breadcrumbs
                        let width = ($(".breadcrumb").length - 1) * 34;
                        $(".main_inner__breadcrumbs").css("width", width);
                    }

                    // Set up initial scene
                    setUp();

                    // Initialise scene
                    function initScene(scene) {
                        // Get the next scene from our array
                        let nextScene = $(".scene." + scenes[progress - 1].name);

                        // Bring the next scene in
                        setTimeout(function () {
                            nextScene.fadeIn();
                            nextScene.css("bottom", "-400px");
                        }, 500);

                        // Change info
                        $(".main_inner__info span").text(scenes[progress - 1].author);
                        $(".main_inner__info .codepen").attr("href", `https://www.codepen.io/${scenes[progress - 1].codepenprofile}`);
                        $(".main_inner__info .twitter").attr("href", `https://www.twitter.com/${scenes[progress - 1].twitterprofile}`);

                        // Change the hint
                        $(".main_inner__title .hint").slideUp(function () {
                            $(".main_inner__title .hint").text(scenes[progress - 1].hint);
                        });

                        // Bring the info in
                        setTimeout(function () {
                            $(".main_inner__info").css("bottom", "40px");
                            $(".main_inner__info").css("opacity", "1");
                        }, 700);

                        // Clear any data on the answers
                        answer.removeData();

                        // Let assign the correct answer to one of the available answers

                        // Pick a random number between 0 and 2
                        let correctAnswer = Math.floor(Math.random() * 3);
                        let correctAnswerEl = $(answer[correctAnswer]);

                        // Set the text of the answer element
                        correctAnswerEl.text(scenes[scene - 1].answer);
                        correctAnswerEl.data("correct", true);

                        // Select the other answers and if no data set against it, pick a random game
                        answer.each(function () {
                            let el = $(this);
                            if (!el.data("correct")) {
                                // Pick a random number between 0 and VG array length
                                let rand = Math.floor(Math.random() * (videoGames.length - 1));
                                $(this).text(videoGames[rand]);
                            }
                        });
                    }

                    // Check answer
                    function checkAnswer(el) {
                        // If clicked answer has data stored
                        if (el.data("correct")) return "correct";
                    }

                    $(answer).mouseenter(function () {
                        playSound(buttonClick);
                    });

                    // Bind answers to check, this should really be passed to another function but meh...
                    $(answer).click(function () {
                        // Lets first scroll to the top of the page incase its mobile
                        $("html, body").animate({ scrollTop: 0 }, "fast");

                        // Start a transition
                        if (!transitioning) {
                            transitioning = true; // Check if not mid transition
                            if (checkAnswer($(this))) {
                                // Play sound
                                playSound(featured);

                                // Add breadcrumb class
                                $(".breadcrumb.active").addClass("correct");

                                // Add class to button
                                $(this).addClass("correct");

                                // Set up feedback message
                                $(".main_inner__feedback").removeClass("wrong");
                                $(".main_inner__feedback").text("Correct").addClass("correct");
                                $(".main_inner__feedback").css("transform", "translateY(-50%) scale(1) rotate(0deg)");
                            } else {
                                // Add breadcrumb class
                                $(".breadcrumb.active").addClass("wrong");

                                playSound(wrong);

                                // Add class to button
                                $(this).addClass("wrong");

                                // Set up feedback message
                                $(".main_inner__feedback").removeClass("correct");
                                $(".main_inner__feedback").text("Wrong").addClass("wrong");
                                $(".main_inner__feedback").css("transform", "translateY(-50%) scale(1) rotate(0deg)");
                            }

                            // Move breadcrumb
                            $(".breadcrumb.active").removeClass("active").next().addClass("active");

                            let currentScene = $(".scene." + scenes[progress - 1].name);
                            console.log(progress);

                            currentScene.css("opacity", "0");
                            console.log(currentScene);

                            $(".main_inner__info").css("bottom", "-50px");
                            $(".main_inner__info").css("opacity", "0");

                            // Increase our progress in the quiz
                            progress++;

                            // End screen
                            if (progress == $(".scene").length + 1) {
                                $(".main_inner__modalOverlay, .main_inner__modal, .main_inner__modalContent").show();
                                $("p.score").html("You got " + $(".breadcrumb.correct").length + " out of 5 correct!");
                            }

                            // Some crazy animations. I've gone a bit nuts on using set timeouts, should really be using delays in CSS
                            // So we start by setting the scale of our circle and moving the scene out, CSS transitions does the rest
                            setTimeout(function () {
                                circle.css("transform", `translateY(-50%) scale(${circleScale})`);
                                answer.css("left", "100px");
                                answer.css("opacity", "0");
                            }, 230);

                            // Then after the transition is complete we set the background to the next color in our array
                            // Then set the scale of the circle back to 0 (removing any transitions)
                            setTimeout(function () {
                                $("body").css("background", scenes[progress - 1].backgroundColor);
                                circle.css({ transform: `translateY(-50%) scale(0)` });
                                circle.css({ "transition-duration": "0ms" });

                                // Get some colors based on new bg
                                let newHue = LightenDarkenColor(scenes[progress - 1].backgroundColor, 30);
                                let newHueInfo = LightenDarkenColor(scenes[progress - 1].backgroundColor, -20);

                                // Alter the hue of certain texts to match new bg color
                                $(".main_inner__title a").css("color", newHue);
                                $(".main_inner__info p").css("color", newHueInfo);
                                $(".main_inner__info span").css("color", newHueInfo);

                                $(".main_inner__feedback").css("transform", "translateY(-50%) scale(0) rotate(20deg)");
                            }, sceneDelay);

                            // Then bring the circle back in and color it to the next bg in the array
                            setTimeout(function () {
                                answer.removeClass("correct");
                                answer.removeClass("wrong");
                                if (window.innerWidth > 1000) {
                                    circle.css({ transform: `translateY(-50%) scale(1)` });
                                } else {
                                    circle.css({ transform: `translateY(calc(-50% - 110px)) scale(0.6)` });
                                }
                                circle.css({ "transition-duration": "500ms" });
                                circle.css("background", scenes[progress].backgroundColor);
                                circle.find(".circles").css("background", scenes[progress].backgroundColor);
                                answer.css("left", "0");
                                answer.css("opacity", "1");

                                // Set timeout to transition to next scene
                                playSound(slideSlow);

                                initScene(progress);
                                transitioning = false;
                            }, sceneDelay + 100);
                        }
                    });

                    // Show hint
                    $(".main_inner__title a").click(function () {
                        $(this).next().slideToggle();
                        return false;
                    });

                    // Handle key presses
                    $(document).keypress(function (event) {
                        if (event.charCode == 49) {
                            answer[0].click();
                        }
                        if (event.charCode == 50) {
                            answer[1].click();
                        }
                        if (event.charCode == 51) {
                            answer[2].click();
                        }
                    });

                    // Returns a lightened or darkened version of the passed hex
                    // Taken from CSS tricks
                    function LightenDarkenColor(col, amt) {
                        var usePound = false;
                        if (col[0] == "#") {
                            col = col.slice(1);
                            usePound = true;
                        }
                        var num = parseInt(col, 16);
                        var r = (num >> 16) + amt;
                        if (r > 255) r = 255;
                        else if (r < 0) r = 0;
                        var b = ((num >> 8) & 0x00ff) + amt;
                        if (b > 255) b = 255;
                        else if (b < 0) b = 0;
                        var g = (num & 0x0000ff) + amt;
                        if (g > 255) g = 255;
                        else if (g < 0) g = 0;
                        return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
                    }

                    // Initialise the quiz
                    function initQuiz() {
                        initScene(progress);
                    }

                    class Grain {
                        constructor(el) {
                            /**
                             * Options
                             * Increase the pattern size if visible pattern
                             */
                            this.patternSize = 150;
                            this.patternScaleX = 1;
                            this.patternScaleY = 1;
                            this.patternRefreshInterval = 3; // 8
                            this.patternAlpha = 12; // int between 0 and 255,

                            /**
                             * Create canvas
                             */
                            this.canvas = el;
                            this.ctx = this.canvas.getContext("2d");
                            this.ctx.scale(this.patternScaleX, this.patternScaleY);

                            /**
                             * Create a canvas that will be used to generate grain and used as a
                             * pattern on the main canvas.
                             */
                            this.patternCanvas = document.createElement("canvas");
                            this.patternCanvas.width = this.patternSize;
                            this.patternCanvas.height = this.patternSize;
                            this.patternCtx = this.patternCanvas.getContext("2d");
                            this.patternData = this.patternCtx.createImageData(this.patternSize, this.patternSize);
                            this.patternPixelDataLength = this.patternSize * this.patternSize * 4; // rgba = 4

                            /**
                             * Prebind prototype function, so later its easier to user
                             */
                            this.resize = this.resize.bind(this);
                            this.loop = this.loop.bind(this);

                            this.frame = 0;

                            window.addEventListener("resize", this.resize);
                            this.resize();

                            window.requestAnimationFrame(this.loop);
                        }

                        resize() {
                            this.canvas.width = window.innerWidth * devicePixelRatio;
                            this.canvas.height = window.innerHeight * devicePixelRatio;
                        }

                        update() {
                            const { patternPixelDataLength, patternData, patternAlpha, patternCtx } = this;

                            // put a random shade of gray into every pixel of the pattern
                            for (let i = 0; i < patternPixelDataLength; i += 4) {
                                // const value = (Math.random() * 255) | 0;
                                const value = Math.random() * 255;

                                patternData.data[i] = value;
                                patternData.data[i + 1] = value;
                                patternData.data[i + 2] = value;
                                patternData.data[i + 3] = patternAlpha;
                            }

                            patternCtx.putImageData(patternData, 0, 0);
                        }

                        draw() {
                            const { ctx, patternCanvas, canvas, viewHeight } = this;
                            const { width, height } = canvas;

                            // clear canvas
                            ctx.clearRect(0, 0, width, height);

                            // fill the canvas using the pattern
                            ctx.fillStyle = ctx.createPattern(patternCanvas, "repeat");
                            ctx.fillRect(0, 0, width, height);
                        }

                        loop() {
                            // only update grain every n frames
                            const shouldDraw = ++this.frame % this.patternRefreshInterval === 0;
                            if (shouldDraw) {
                                this.update();
                                this.draw();
                            }

                            window.requestAnimationFrame(this.loop);
                        }
                    }

                    function twShare(url, title, winWidth, winHeight) {
                        const winTop = 100;
                        const winLeft = 100;
                        window.open(
                            `https://twitter.com/intent/tweet?text=${title}`,
                            "sharer",
                            `top=${winTop},left=${winLeft},toolbar=0,status=0,width=${winWidth},height=${winHeight}`
                        );
                    }

                    pen_id = $("._pen_id").text();

                    $("body").on("click", ".share", () => {
                        twShare(
                            "https://codepen.io/jcoulterdesign/full/a1b3ea524ead4700015153bb95b881c3",
                            `I got ${$(".breadcrumb.correct").length} out of 5 questions correct in this quiz by @jamiecoulter89 and others. https://bit.ly/2TLaILc %23cssvideogamequiz`,
                            520,
                            350
                        );
                        return false;
                    });

                    /**
                     * Initiate Grain
                     */
                    const el = document.querySelector(".grain");
                    const grain = new Grain(el);

                    // $(".main_inner__loading").fadeOut()

                    initQuiz();

                    // 8 questions
                    // Find the mario
                    // Release screen rec and tweet - 20
                    ```
    checkGameCompletion();
}

function checkGameCompletion() {
    const foundWords = document.querySelectorAll("li.found");
    if (foundWords.length === words.length) {
        alert("Congratulations! You found all the words!");
    }
}

function newGame() {
    generateGrid();
    renderGrid();
    renderWordList();
}

document.getElementById("new-game").addEventListener("click", newGame);

// Initialize the game
newGame();

y: this.gridConfiguration.y + (128 + this.gridConfiguration.paddingY) * Math.floor(index / 4)
})
return newCard;
});
}

createHearts ()
{
return Array.from(new Array(this.lives)).map((el, index) => {
const heart = this.add.image(this.sys.game.scale.width + 1000, 20, "heart")
.setScale(2)

this.add.tween({
targets: heart,
ease: Phaser.Math.Easing.Expo.InOut,
duration: 1000,
delay: 1000 + index * 200,
x: 140 + 30 * index // marginLeft + spaceBetween * index
});
return heart;
});
}


volumeButton ()
{
const volumeIcon = this.add.image(25, 25, "volume-icon").setName("volume-icon");
volumeIcon.setInteractive();

// Mouse enter
volumeIcon.on(Phaser.Input.Events.POINTER_OVER, () => {
this.input.setDefaultCursor("pointer");
});
// Mouse leave
volumeIcon.on(Phaser.Input.Events.POINTER_OUT, () => {
console.log("Mouse leave");
this.input.setDefaultCursor("default");
});


volumeIcon.on(Phaser.Input.Events.POINTER_DOWN, () => {
if (this.sound.volume === 0) {
this.sound.setVolume(1);
volumeIcon.setTexture("volume-icon");
volumeIcon.setAlpha(1);
} else {
this.sound.setVolume(0);
volumeIcon.setTexture("volume-icon_off");
volumeIcon.setAlpha(.5)
}
});
}

startGame ()
{

// WinnerText and GameOverText
const winnerText = this.add.text(this.sys.game.scale.width / 2, -1000, "YOU WIN",
{ align: "center", strokeThickness: 4, fontSize: 40, fontStyle: "bold", color: "#8c7ae6" }
).setOrigin(.5)
.setDepth(3)
.setInteractive();

const gameOverText = this.add.text(this.sys.game.scale.width / 2, -1000,
"GAME OVER\nClick to restart",
{ align: "center", strokeThickness: 4, fontSize: 40, fontStyle: "bold", color: "#ff0000" }
)
.setName("gameOverText")
.setDepth(3)
.setOrigin(.5)
.setInteractive();

// Start lifes images
const hearts = this.createHearts();

// Create a grid of cards
this.cards = this.createGridCards();

// Start canMove
this.time.addEvent({
delay: 200 * this.cards.length,
callback: () => {
this.canMove = true;
}
});

// Game Logic
this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer) => {
if (this.canMove) {
const card = this.cards.find(card => card.gameObject.hasFaceAt(pointer.x, pointer.y));
if (card) {
this.input.setDefaultCursor("pointer");
} else {
if(go[0]) {
    if(go[0].name !== "volume-icon") {
        this.input.setDefaultCursor("pointer");
    }
} else {
    this.input.setDefaultCursor("default");
}
}
}
});
this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer) => {
if (this.canMove && this.cards.length) {
const card = this.cards.find(card => card.gameObject.hasFaceAt(pointer.x, pointer.y));

if (card) {
this.canMove = false;

// Detect if there is a card opened
if (this.cardOpened !== undefined) {
    // If the card is the same that the opened not do anything
    if (this.cardOpened.gameObject.x === card.gameObject.x && this.cardOpened.gameObject.y === card.gameObject.y) {
        this.canMove = true;
        return false;
    }

    card.flip(() => {
        if (this.cardOpened.cardName === card.cardName) {
            // ------- Match -------
            this.sound.play("card-match");
            // Destroy card selected and card opened from history
            this.cardOpened.destroy();
            card.destroy();

            // remove card destroyed from array
            this.cards = this.cards.filter(cardLocal => cardLocal.cardName !== card.cardName);
            // reset history card opened
            this.cardOpened = undefined;
            this.canMove = true;

        } else {
            // ------- No match -------
            this.sound.play("card-mismatch");
            this.cameras.main.shake(600, 0.01);
            // remove life and heart
            const lastHeart = hearts[hearts.length - 1];
            this.add.tween({
                targets: lastHeart,
                ease: Phaser.Math.Easing.Expo.InOut,
                duration: 1000,
                y: - 1000,
                onComplete: () => {
                    lastHeart.destroy();
                    hearts.pop();
                }
            });
            this.lives -= 1;
            // Flip last card selected and flip the card opened from history and reset history
            card.flip();
            this.cardOpened.flip(() => {
                this.cardOpened = undefined;
                this.canMove = true;

            });
        }

        // Check if the game is over
        if (this.lives === 0) {
            // Show Game Over text
            this.sound.play("whoosh", { volume: 1.3 });
            this.add.tween({
                targets: gameOverText,
                ease: Phaser.Math.Easing.Bounce.Out,
                y: this.sys.game.scale.height / 2,
            });

            this.canMove = false;
        }

        // Check if the game is won
        if (this.cards.length === 0) {
            this.sound.play("whoosh", { volume: 1.3 });
            this.sound.play("victory");

            this.add.tween({
                targets: winnerText,
                ease: Phaser.Math.Easing.Bounce.Out,
                y: this.sys.game.scale.height / 2,
            });
            this.canMove = false;
        }
    });

} else if (this.cardOpened === undefined && this.lives > 0 && this.cards.length > 0) {
    // If there is not a card opened save the card selected
    card.flip(() => {
        this.canMove = true;
    });
    this.cardOpened = card;
}
}
}

});


// Text events
winnerText.on(Phaser.Input.Events.POINTER_OVER, () => {
winnerText.setColor("#FF7F50");
this.input.setDefaultCursor("pointer");
});
winnerText.on(Phaser.Input.Events.POINTER_OUT, () => {
winnerText.setColor("#8c7ae6");
this.input.setDefaultCursor("default");
});
winnerText.on(Phaser.Input.Events.POINTER_DOWN, () => {
this.sound.play("whoosh", { volume: 1.3 });
this.add.tween({
targets: winnerText,
ease: Phaser.Math.Easing.Bounce.InOut,
y: -1000,
onComplete: () => {
this.restartGame();
}
})
});

gameOverText.on(Phaser.Input.Events.POINTER_OVER, () => {
gameOverText.setColor("#FF7F50");
this.input.setDefaultCursor("pointer");
});

gameOverText.on(Phaser.Input.Events.POINTER_OUT, () => {
gameOverText.setColor("#8c7ae6");
this.input.setDefaultCursor("default");
});

gameOverText.on(Phaser.Input.Events.POINTER_DOWN, () => {
this.add.tween({
targets: gameOverText,
ease: Phaser.Math.Easing.Bounce.InOut,
y: -1000,
onComplete: () => {
this.restartGame();
}
})
});
}

}

/\*\*

- Create a card game object
\*/
export const createCard = ({
scene,
x,
y,
frontTexture,
cardName
}) => {

let isFlipping = false;
const rotation = { y: 0 };

const backTexture = "card-back";

const card = scene.add.plane(x, y, backTexture)
.setName(cardName)
.setInteractive();

// start with the card face down
card.modelRotationY = 180;

const flipCard = (callbackComplete) => {
if (isFlipping) {
return;
}
scene.add.tween({
targets: [rotation],
y: (rotation.y === 180) ? 0 : 180,
ease: Phaser.Math.Easing.Expo.Out,
duration: 500,
onStart: () => {
isFlipping = true;
scene.sound.play("card-flip");
scene.tweens.chain({
targets: card,
ease: Phaser.Math.Easing.Expo.InOut,
tweens: [
    {
        duration: 200,
        scale: 1.1,
    },
    {
        duration: 300,
        scale: 1
    },
]
})
},
onUpdate: () => {
// card.modelRotation.y = Phaser.Math.DegToRad(180) + Phaser.Math.DegToRad(rotation.y);
card.rotateY = 180 + rotation.y;
const cardRotation = Math.floor(card.rotateY) % 360;
if ((cardRotation >= 0 && cardRotation <= 90) || (cardRotation >= 270 && cardRotation <= 359)) {
card.setTexture(frontTexture);
}
else {
card.setTexture(backTexture);
}
},
onComplete: () => {
isFlipping = false;
if (callbackComplete) {
callbackComplete();
}
}
});
}

const destroy = () => {
scene.add.tween({
targets: [card],
y: card.y - 1000,
easing: Phaser.Math.Easing.Elastic.In,
duration: 500,
onComplete: () => {
card.destroy();
}
})
}

return {
gameObject: card,
flip: flipCard,
destroy,
cardName
}

}

export class Preloader extends Phaser.Scene
{
constructor()
{
super({
key: 'Preloader'
});
}

preload ()
{
this.load.setBaseURL('https://cdn.phaserfiles.com/v385');
this.load.setPath("assets/games/card-memory-game/");

this.load.image("volume-icon", "ui/volume-icon.png");
this.load.image("volume-icon_off", "ui/volume-icon_off.png");

this.load.audio("theme-song", "audio/fat-caps-audionatix.mp3");
this.load.audio("whoosh", "audio/whoosh.mp3");
this.load.audio("card-flip", "audio/card-flip.mp3");
this.load.audio("card-match", "audio/card-match.mp3");
this.load.audio("card-mismatch", "audio/card-mismatch.mp3");
this.load.audio("card-slide", "audio/card-slide.mp3");
this.load.audio("victory", "audio/victory.mp3");
this.load.image("background");
this.load.image("card-back", "cards/card-back.png");
this.load.image("card-0", "cards/card-0.png");
this.load.image("card-1", "cards/card-1.png");
this.load.image("card-2", "cards/card-2.png");
this.load.image("card-3", "cards/card-3.png");
this.load.image("card-4", "cards/card-4.png");
this.load.image("card-5", "cards/card-5.png");

this.load.image("heart", "ui/heart.png");

}

create ()
{
this.scene.start("Play");
}

}

import { Preloader } from './Preloader.js';
import { Play } from './Play.js';

const config = {
title: 'Card Memory Game',
type: Phaser.AUTO,
backgroundColor: "#192a56",
width: 549,
height: 480,
parent: "phaser-example",
render: {
pixelArt: true,
},
scene: [
Preloader,
Play
]
};

new Phaser.Game(config);
```

- **Caça-palavras:**
  - https://codepen.io/Muthukrishnan/pen/GgKBvqj

```js
  const words = ['JAVASCRIPT', 'HTML', 'CSS', 'REACT', 'NODE', 'PYTHON', 'JAVA', 'RUBY'];
  const gridSize = 10;
  let grid = [];
  let selectedCells = [];

  function generateGrid() {
  grid = [];
  for (let i = 0; i < gridSize; i++) {
  grid[i] = [];
  for (let j = 0; j < gridSize; j++) {
  grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() \* 26));
  }
  }

  // Place words in the grid
  words.forEach(word => {
  const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
  let row, col;
  if (direction === 'horizontal') {
  row = Math.floor(Math.random() * gridSize);
  col = Math.floor(Math.random() * (gridSize - word.length + 1));
  for (let i = 0; i < word.length; i++) {
  grid[row][col + i] = word[i];
  }
  } else {
  row = Math.floor(Math.random() * (gridSize - word.length + 1));
  col = Math.floor(Math.random() * gridSize);
  for (let i = 0; i < word.length; i++) {
  grid[row + i][col] = word[i];
  }
  }
  });

  }

  function renderGrid() {
  const gridElement = document.getElementById('grid');
  gridElement.innerHTML = '';
  for (let i = 0; i < gridSize; i++) {
  for (let j = 0; j < gridSize; j++) {
  const cell = document.createElement('div');
  cell.className = 'cell';
  cell.textContent = grid[i][j];
  cell.dataset.row = i;
  cell.dataset.col = j;
  cell.addEventListener('mousedown', startSelection);
  cell.addEventListener('mouseover', updateSelection);
  cell.addEventListener('mouseup', endSelection);
  gridElement.appendChild(cell);
  }
  }
  }

  function renderWordList() {
  const wordListElement = document.getElementById('word-list');
  wordListElement.innerHTML = '';
  words.forEach(word => {
  const li = document.createElement('li');
  li.textContent = word;
  li.dataset.word = word;
  wordListElement.appendChild(li);
  });
  }

  function startSelection(e) {
  selectedCells = [e.target];
  e.target.classList.add('selected');
  }

  function updateSelection(e) {
  if (e.buttons === 1 && !selectedCells.includes(e.target)) {
  selectedCells.push(e.target);
  e.target.classList.add('selected');
  }
  }

  function endSelection() {
  const word = selectedCells.map(cell => cell.textContent).join('');
  const reversedWord = word.split('').reverse().join('');

  if (words.includes(word) || words.includes(reversedWord)) {
  selectedCells.forEach(cell => cell.classList.add('found'));
  document.querySelector(`li[data-word="${word}"]`)?.classList.add('found');
  document.querySelector(`li[data-word="${reversedWord}"]`)?.classList.add('found');
  }

  selectedCells.forEach(cell => cell.classList.remove('selected'));
  selectedCells = [];

  checkGameCompletion();

  }

  function checkGameCompletion() {
  const foundWords = document.querySelectorAll('li.found');
  if (foundWords.length === words.length) {
  alert('Congratulations! You found all the words!');
  }
  }

  function newGame() {
  generateGrid();
  renderGrid();
  renderWordList();
  }

  document.getElementById('new-game').addEventListener('click', newGame);

  // Initialize the game
  newGame();
```

- https://codepen.io/ukdesign/pen/QWXNjjE

```js
var word = ["css", "syntax", "webgl", "react", "grid", "svg"];
var selectedWords = null;
var isCorrect = false;
var target = null;
var result = [];
function selectWordsDown(e) {
  target = this.event.target.textContent;
  isCorrect = word
    .map((item) => item.toUpperCase().startsWith(target))
    .includes(true);

  $("#puzzleGrid button").removeClass("selected_item");
  if (isCorrect) {
    $(this.event.target).addClass("selected_item");
    selectedWords = target;
  }
}
function selectWordsUp(e) {
  if (selectedWords == null) {
    $("#puzzleGrid button").removeClass("selected_item");
  } else {
    if (word.includes(selectedWords.toLowerCase())) {
      switch ($("#puzzleGrid").find(".selected_item").text()) {
        case "CSS":
          $("#puzzleGrid")
            .find(".selected_item")
            .addClass("css")
            .removeClass("selected_item");
          result.push(selectedWords);

          break;
        case "SYNTAX":
          $("#puzzleGrid")
            .find(".selected_item")
            .addClass("syntax")
            .removeClass("selected_item");
          result.push(selectedWords);
          break;
        case "WEBGL":
          $("#puzzleGrid")
            .find(".selected_item")
            .addClass("webgl")
            .removeClass("selected_item");
          result.push(selectedWords);
          break;
        case "REACT":
          $("#puzzleGrid")
            .find(".selected_item")
            .addClass("react")
            .removeClass("selected_item");
          result.push(selectedWords);
          break;
        case "GRID":
          $("#puzzleGrid")
            .find(".selected_item")
            .addClass("grid")
            .removeClass("selected_item");
          result.push(selectedWords);
          break;
        case "SVG":
          $("#puzzleGrid")
            .find(".selected_item")
            .addClass("svg")
            .removeClass("selected_item");
          result.push(selectedWords);
          break;
      }
    }
    console.log(result);

    if (result.length == 6) {
      $("#result").show();
    }
  }
}
function replay() {
  $("#result").hide();
  result.forEach((item) => {
    // Find buttons inside the #puzzleGrid element that have the class corresponding to the item
    $("#puzzleGrid button").each(function () {
      // Remove the class from the current button
      $(this).removeClass(item.toLowerCase());
    });
  });
  result = [];
}
function hoverWordsDown(e) {
  target = this.event.target.textContent;
  if (
    this.event.target.nodeName == "BUTTON" &&
    !$(this.event.target).hasClass("selected_item") &&
    selectedWords != null
  ) {
    selectedWords = selectedWords.concat(target);
    if (
      word.some((item) =>
        item.toLowerCase().startsWith(selectedWords.toLowerCase()),
      )
    ) {
      $(this.event.target).addClass("selected_item");
    } else {
      $("#puzzleGrid button").removeClass("selected_item");
      selectedWords = null;
    }
  }
}
```

- **Pac-man:**
  - https://codepen.io/kudchikarsk/pen/aRaLKR

```js
let width = 800;
let height = 625;
let gridSize = 32;
let offset = parseInt(gridSize / 2);
let config = {
  type: Phaser.CANVAS,
  width: width,
  height: height,
  canvas: document.getElementById("mycanvas"),
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: {
        x: 0,
        y: 0,
      },
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

let game = new Phaser.Game(config);
let cursors;
let player;
let ghosts = [];
let pills;
let pillsCount = 0;
let pillsAte = 0;
let map;
let layer1;
let layer2;
let graphics;
let scoreText;
let livesImage = [];
let tiles = "pacman-tiles";
let spritesheet = "pacman-spritesheet";
let spritesheetPath =
  "https://raw.githubusercontent.com/kudchikarsk/phaser-pacman/master/assets/images/pacmansprites.png";
let tilesPath =
  "https://raw.githubusercontent.com/kudchikarsk/phaser-pacman/master/assets/images/background.png";
let mapPath =
  "https://raw.githubusercontent.com/kudchikarsk/phaser-pacman/master/assets/levels/codepen-level.json";
let Animation = {
  Player: {
    Eat: "player-eat",
    Stay: "player-stay",
    Die: "player-die",
  },
  Ghost: {
    Blue: {
      Move: "ghost-blue-move",
    },

    Orange: {
      Move: "ghost-orange-move",
    },

    White: {
      Move: "ghost-white-move",
    },

    Pink: {
      Move: "ghost-pink-move",
    },

    Red: {
      Move: "ghost-red-move",
    },
  },
};

function preload() {
  this.load.spritesheet(spritesheet, spritesheetPath, {
    frameWidth: gridSize,
    frameHeight: gridSize,
  });
  this.load.tilemapTiledJSON("map", mapPath);
  this.load.image(tiles, tilesPath);
  this.load.image(
    "pill",
    "https://raw.githubusercontent.com/kudchikarsk/phaser-pacman/master/assets/images/pac%20man%20pill/spr_pill_0.png",
  );
  this.load.image(
    "lifecounter",
    "https://raw.githubusercontent.com/kudchikarsk/phaser-pacman/master/assets/images/pac%20man%20life%20counter/spr_lifecounter_0.png",
  );
}

function create() {
  this.anims.create({
    key: Animation.Player.Eat,
    frames: this.anims.generateFrameNumbers(spritesheet, { start: 9, end: 13 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: Animation.Player.Stay,
    frames: [{ key: spritesheet, frame: 9 }],
    frameRate: 20,
  });

  this.anims.create({
    key: Animation.Player.Die,
    frames: this.anims.generateFrameNumbers(spritesheet, { start: 6, end: 8 }),
    frameRate: 1,
  });

  this.anims.create({
    key: Animation.Ghost.Blue.Move,
    frames: this.anims.generateFrameNumbers(spritesheet, { start: 0, end: 1 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: Animation.Ghost.Orange.Move,
    frames: this.anims.generateFrameNumbers(spritesheet, { start: 4, end: 5 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: Animation.Ghost.White.Move,
    frames: this.anims.generateFrameNumbers(spritesheet, { start: 4, end: 5 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: Animation.Ghost.Pink.Move,
    frames: this.anims.generateFrameNumbers(spritesheet, {
      start: 14,
      end: 15,
    }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: Animation.Ghost.Red.Move,
    frames: this.anims.generateFrameNumbers(spritesheet, {
      start: 16,
      end: 17,
    }),
    frameRate: 10,
    repeat: -1,
  });

  map = this.make.tilemap({
    key: "map",
    tileWidth: gridSize,
    tileHeight: gridSize,
  });
  const tileset = map.addTilesetImage(tiles);

  layer1 = map.createStaticLayer("Layer 1", tileset, 0, 0);
  layer1.setCollisionByProperty({ collides: true });

  layer2 = map.createStaticLayer("Layer 2", tileset, 0, 0);
  layer2.setCollisionByProperty({ collides: true });

  let spawnPoint = map.findObject("Objects", (obj) => obj.name === "Player");
  let position = new Phaser.Geom.Point(
    spawnPoint.x + offset,
    spawnPoint.y - offset,
  );
  player = new Player(this, position, Animation.Player, function () {
    if (player.life <= 0) {
      newGame();
    } else {
      respawn();
    }
  });

  let scene = this;

  pills = this.physics.add.group();
  map.filterObjects("Objects", function (value, index, array) {
    if (value.name == "Pill") {
      let pill = scene.physics.add.sprite(
        value.x + offset,
        value.y - offset,
        "pill",
      );
      pills.add(pill);
      pillsCount++;
    }
  });

  let ghostsGroup = this.physics.add.group();
  let i = 0;
  let skins = [
    Animation.Ghost.Blue,
    Animation.Ghost.Red,
    Animation.Ghost.Orange,
    Animation.Ghost.Pink,
  ];
  map.filterObjects("Objects", function (value, index, array) {
    if (value.name == "Ghost") {
      let position = new Phaser.Geom.Point(value.x + offset, value.y - offset);
      let ghost = new Ghost(scene, position, skins[i]);
      ghosts.push(ghost);
      ghostsGroup.add(ghost.sprite);
      i++;
    }
  });

  this.physics.add.collider(player.sprite, layer1);
  this.physics.add.collider(player.sprite, layer2);
  this.physics.add.collider(ghostsGroup, layer1);
  this.physics.add.overlap(
    player.sprite,
    pills,
    function (sprite, pill) {
      pill.disableBody(true, true);
      pillsAte++;
      player.score += 10;
      if (pillsCount == pillsAte) {
        reset();
      }
    },
    null,
    this,
  );

  this.physics.add.overlap(
    player.sprite,
    ghostsGroup,
    function (sprite, ghostSprite) {
      if (player.active) {
        player.die();
        for (let ghost of ghosts) {
          ghost.freeze();
        }
      }
    },
    null,
    this,
  );

  cursors = this.input.keyboard.createCursorKeys();

  graphics = this.add.graphics();

  scoreText = this.add
    .text(25, 595, "Score: " + player.score)
    .setFontFamily("Arial")
    .setFontSize(18)
    .setColor("#ffffff");
  this.add
    .text(630, 595, "Lives:")
    .setFontFamily("Arial")
    .setFontSize(18)
    .setColor("#ffffff");
  for (let i = 0; i < player.life; i++) {
    livesImage.push(this.add.image(700 + i * 25, 605, "lifecounter"));
  }
}

function respawn() {
  player.respawn();
  for (let ghost of ghosts) {
    ghost.respawn();
  }
}

function reset() {
  respawn();
  for (let child of pills.getChildren()) {
    child.enableBody(false, child.x, child.y, true, true);
  }
  pillsAte = 0;
}

function newGame() {
  reset();
  player.life = 3;
  player.score = 0;
  for (let i = 0; i < player.life; i++) {
    let image = livesImage[i];
    if (image) {
      image.alpha = 1;
    }
  }
}

function update() {
  player.setDirections(getDirection(map, layer1, player.sprite));

  if (!player.playing) {
    for (let ghost of ghosts) {
      ghost.freeze();
    }
  }

  for (let ghost of ghosts) {
    ghost.setDirections(getDirection(map, layer1, ghost.sprite));
  }

  player.setTurningPoint(getTurningPoint(map, player.sprite));

  for (let ghost of ghosts) {
    ghost.setTurningPoint(getTurningPoint(map, ghost.sprite));
  }

  if (cursors.left.isDown) {
    player.setTurn(Phaser.LEFT);
  } else if (cursors.right.isDown) {
    player.setTurn(Phaser.RIGHT);
  } else if (cursors.up.isDown) {
    player.setTurn(Phaser.UP);
  } else if (cursors.down.isDown) {
    player.setTurn(Phaser.DOWN);
  } else {
    player.setTurn(Phaser.NONE);
  }

  player.update();

  for (let ghost of ghosts) {
    ghost.update();
  }

  scoreText.setText("Score: " + player.score);

  for (let i = player.life; i < 3; i++) {
    let image = livesImage[i];
    if (image) {
      image.alpha = 0;
    }
  }

  if (player.active) {
    if (player.sprite.x < 0 - offset) {
      player.sprite.setPosition(width + offset, player.sprite.y);
    } else if (player.sprite.x > width + offset) {
      player.sprite.setPosition(0 - offset, player.sprite.y);
    }
  }

  // drawDebug();
}

function drawDebug() {
  graphics.clear();
  player.drawDebug(graphics);
  for (let ghost of ghosts) {
    ghost.drawDebug(graphics);
  }
}

function getDirection(map, layer, sprite) {
  let directions = [];
  let sx = Phaser.Math.FloorTo(sprite.x);
  let sy = Phaser.Math.FloorTo(sprite.y);
  let currentTile = map.getTileAtWorldXY(sx, sy, true);
  if (currentTile) {
    var x = currentTile.x;
    var y = currentTile.y;

    directions[Phaser.LEFT] = map.getTileAt(x - 1, y, true, layer);
    directions[Phaser.RIGHT] = map.getTileAt(x + 1, y, true, layer);
    directions[Phaser.UP] = map.getTileAt(x, y - 1, true, layer);
    directions[Phaser.DOWN] = map.getTileAt(x, y + 1, true, layer);
  }

  return directions;
}

function getTurningPoint(map, sprite) {
  let turningPoint = new Phaser.Geom.Point();
  let sx = Phaser.Math.FloorTo(sprite.x);
  let sy = Phaser.Math.FloorTo(sprite.y);
  let currentTile = map.getTileAtWorldXY(sx, sy, true);
  if (currentTile) {
    turningPoint.x = currentTile.pixelX + offset;
    turningPoint.y = currentTile.pixelY + offset;
  }

  return turningPoint;
}

class Ghost {
  constructor(scene, position, anim) {
    this.sprite = scene.physics.add
      .sprite(position.x, position.y, "ghost")
      .setScale(0.85)
      .setOrigin(0.5);
    this.spawnPoint = position;
    this.anim = anim;
    this.speed = 100;
    this.moveTo = new Phaser.Geom.Point();
    this.safetile = [-1, 19];
    this.directions = [];
    this.opposites = [
      null,
      null,
      null,
      null,
      null,
      Phaser.DOWN,
      Phaser.UP,
      Phaser.RIGHT,
      Phaser.LEFT,
    ];
    this.turning = Phaser.NONE;
    this.current = Phaser.NONE;
    this.turningPoint = new Phaser.Geom.Point();
    this.threshold = 5;
    this.rnd = new Phaser.Math.RandomDataGenerator();
    this.sprite.anims.play(anim.Move, true);
    this.turnCount = 0;
    this.turnAtTime = [4, 8, 16, 32, 64];
    this.turnAt = this.rnd.pick(this.turnAtTime);
  }

  freeze() {
    this.moveTo = new Phaser.Geom.Point();
    this.current = Phaser.NONE;
  }

  move() {
    this.move(this.rnd.pick([Phaser.UP, Phaser.DOWN]));
  }

  respawn() {
    this.sprite.setPosition(this.spawnPoint.x, this.spawnPoint.y);
    this.move(this.rnd.pick([Phaser.UP, Phaser.DOWN]));
    this.sprite.flipX = false;
  }

  moveLeft() {
    this.moveTo.x = -1;
    this.moveTo.y = 0;
    this.sprite.flipX = true;
    this.sprite.angle = 0;
  }

  moveRight() {
    this.moveTo.x = 1;
    this.moveTo.y = 0;
    this.sprite.flipX = false;
    this.sprite.angle = 0;
  }

  moveUp() {
    this.moveTo.x = 0;
    this.moveTo.y = -1;
    this.sprite.angle = 0;
  }

  moveDown() {
    this.moveTo.x = 0;
    this.moveTo.y = 1;
    this.sprite.angle = 0;
  }

  update() {
    this.sprite.setVelocity(
      this.moveTo.x * this.speed,
      this.moveTo.y * this.speed,
    );
    this.turn();
    if (
      this.directions[this.current] &&
      !this.isSafe(this.directions[this.current].index)
    ) {
      this.sprite.anims.play("faceRight", true);
      this.takeRandomTurn();
    }
  }

  setDirections(directions) {
    this.directions = directions;
  }

  setTurningPoint(turningPoint) {
    this.turningPoint = turningPoint;
  }

  setTurn(turnTo) {
    if (
      !this.directions[turnTo] ||
      this.turning === turnTo ||
      this.current === turnTo ||
      !this.isSafe(this.directions[turnTo].index)
    ) {
      return false;
    }

    if (this.opposites[turnTo] && this.opposites[turnTo] === this.current) {
      this.move(turnTo);
      this.turning = Phaser.NONE;
      this.turningPoint = new Phaser.Geom.Point();
    } else {
      this.turning = turnTo;
    }
  }

  takeRandomTurn() {
    let turns = [];
    for (let i = 0; i < this.directions.length; i++) {
      let direction = this.directions[i];
      if (direction) {
        if (this.isSafe(direction.index)) {
          turns.push(i);
        }
      }
    }

    if (turns.length >= 2) {
      let index = turns.indexOf(this.opposites[this.current]);
      if (index > -1) {
        turns.splice(index, 1);
      }
    }

    let turn = this.rnd.pick(turns);
    this.setTurn(turn);

    this.turnCount = 0;
    this.turnAt = this.rnd.pick(this.turnAtTime);
  }

  turn() {
    if (this.turnCount === this.turnAt) {
      this.takeRandomTurn();
    }
    this.turnCount++;

    if (this.turning === Phaser.NONE) {
      return false;
    }

    // This needs a threshold, because at high speeds you can't turn because the coordinates skip past
    if (
      !Phaser.Math.Within(this.sprite.x, this.turningPoint.x, this.threshold) ||
      !Phaser.Math.Within(this.sprite.y, this.turningPoint.y, this.threshold)
    ) {
      return false;
    }

    this.sprite.setPosition(this.turningPoint.x, this.turningPoint.y);
    this.move(this.turning);
    this.turning = Phaser.NONE;
    this.turningPoint = new Phaser.Geom.Point();
    return true;
  }

  move(direction) {
    this.current = direction;

    switch (direction) {
      case Phaser.LEFT:
        this.moveLeft();
        break;

      case Phaser.RIGHT:
        this.moveRight();
        break;

      case Phaser.UP:
        this.moveUp();
        break;

      case Phaser.DOWN:
        this.moveDown();
        break;
    }
  }

  isSafe(index) {
    for (let i of this.safetile) {
      if (i === index) return true;
    }

    return false;
  }

  drawDebug(graphics) {
    let thickness = 4;
    let alpha = 1;
    let color = 0x00ff00;
    for (var t = 0; t < 9; t++) {
      if (this.directions[t] === null || this.directions[t] === undefined) {
        continue;
      }

      if (!this.isSafe(this.directions[t].index)) {
        color = 0xff0000;
      } else {
        color = 0x00ff00;
      }

      graphics.lineStyle(thickness, color, alpha);
      graphics.strokeRect(
        this.directions[t].pixelX,
        this.directions[t].pixelY,
        32,
        32,
      );
    }

    color = 0x00ff00;
    graphics.lineStyle(thickness, color, alpha);
    graphics.strokeRect(this.turningPoint.x, this.turningPoint.y, 1, 1);
  }
}

class Player {
  constructor(scene, position, anim, dieCallback) {
    this.sprite = scene.physics.add
      .sprite(position.x, position.y, "pacman")
      .setScale(0.9)
      .setOrigin(0.5);
    this.spawnPoint = position;
    this.anim = anim;
    this.dieCallback = dieCallback;
    this.speed = 95;
    this.moveTo = new Phaser.Geom.Point();
    this.sprite.angle = 180;
    this.safetile = [-1, 18];
    this.directions = [];
    this.opposites = [
      null,
      null,
      null,
      null,
      null,
      Phaser.DOWN,
      Phaser.UP,
      Phaser.RIGHT,
      Phaser.LEFT,
    ];
    this.turning = Phaser.NONE;
    this.current = Phaser.NONE;
    this.turningPoint = new Phaser.Geom.Point();
    this.threshold = 5;
    this.life = 3;
    this.score = 0;
    this.active = true;
    this.sprite.anims.play(this.anim.Stay, true);
    let ref = this;
    this.sprite.on(
      "animationcomplete",
      function (animation, frame) {
        ref.animComplete(animation, frame);
      },
      scene,
    );
    this.playing = false;
  }

  die() {
    this.active = false;
    this.playing = false;
    this.life--;
    this.moveTo = new Phaser.Geom.Point();
    this.sprite.anims.play(this.anim.Die, true);
  }

  animComplete(animation, frame) {
    if (animation.key == this.anim.Die) {
      this.dieCallback();
    }
  }

  respawn() {
    this.active = true;
    this.playing = false;
    this.sprite.setPosition(this.spawnPoint.x, this.spawnPoint.y);
    this.moveTo = new Phaser.Geom.Point();
    this.sprite.anims.play(this.anim.Stay, true);
    this.sprite.angle = 180;
    this.turning = Phaser.NONE;
    this.current = Phaser.NONE;
  }

  moveLeft() {
    this.moveTo.x = -1;
    this.moveTo.y = 0;
    this.sprite.anims.play(this.anim.Eat, true);
    this.sprite.angle = 180;
  }

  moveRight() {
    this.moveTo.x = 1;
    this.moveTo.y = 0;
    this.sprite.anims.play(this.anim.Eat, true);
    this.sprite.angle = 0;
  }

  moveUp() {
    this.moveTo.x = 0;
    this.moveTo.y = -1;
    this.sprite.anims.play(this.anim.Eat, true);
    this.sprite.angle = 270;
  }

  moveDown() {
    this.moveTo.x = 0;
    this.moveTo.y = 1;
    this.sprite.anims.play(this.anim.Eat, true);
    this.sprite.angle = 90;
  }

  update() {
    this.sprite.setVelocity(
      this.moveTo.x * this.speed,
      this.moveTo.y * this.speed,
    );
    this.turn();
    if (
      this.directions[this.current] &&
      !this.isSafe(this.directions[this.current].index)
    ) {
      this.sprite.anims.play("faceRight", true);
    }
  }

  setDirections(directions) {
    this.directions = directions;
  }

  setTurningPoint(turningPoint) {
    this.turningPoint = turningPoint;
  }

  setTurn(turnTo) {
    if (
      !this.active ||
      !this.directions[turnTo] ||
      this.turning === turnTo ||
      this.current === turnTo ||
      !this.isSafe(this.directions[turnTo].index)
    ) {
      return false;
    }

    if (this.opposites[turnTo] && this.opposites[turnTo] === this.current) {
      this.move(turnTo);
      this.turning = Phaser.NONE;
      this.turningPoint = new Phaser.Geom.Point();
    } else {
      this.turning = turnTo;
    }
  }

  turn() {
    if (this.turning === Phaser.NONE) {
      return false;
    }

    // This needs a threshold, because at high speeds you can't turn because the coordinates skip past
    if (
      !Phaser.Math.Within(this.sprite.x, this.turningPoint.x, this.threshold) ||
      !Phaser.Math.Within(this.sprite.y, this.turningPoint.y, this.threshold)
    ) {
      return false;
    }

    this.sprite.setPosition(this.turningPoint.x, this.turningPoint.y);
    this.move(this.turning);
    this.turning = Phaser.NONE;
    this.turningPoint = new Phaser.Geom.Point();
    return true;
  }

  move(direction) {
    this.playing = true;
    this.current = direction;

    switch (direction) {
      case Phaser.LEFT:
        this.moveLeft();
        break;

      case Phaser.RIGHT:
        this.moveRight();
        break;

      case Phaser.UP:
        this.moveUp();
        break;

      case Phaser.DOWN:
        this.moveDown();
        break;
    }
  }

  isSafe(index) {
    for (let i of this.safetile) {
      if (i === index) return true;
    }

    return false;
  }

  drawDebug(graphics) {
    let thickness = 4;
    let alpha = 1;
    let color = 0x00ff00;

    for (var t = 0; t < 9; t++) {
      if (this.directions[t] === null || this.directions[t] === undefined) {
        continue;
      }

      if (this.directions[t].index !== -1) {
        color = 0xff0000;
      } else {
        color = 0x00ff00;
      }

      graphics.lineStyle(thickness, color, alpha);
      graphics.strokeRect(
        this.directions[t].pixelX,
        this.directions[t].pixelY,
        32,
        32,
      );
    }

    color = 0x00ff00;
    graphics.lineStyle(thickness, color, alpha);
    graphics.strokeRect(this.turningPoint.x, this.turningPoint.y, 1, 1);
  }
}
```

- **forca:**
  - https://codepen.io/marcel-erasmus/pen/abYdgry

```javascript
const DEFAULT_LIVES = 6;

let dictionary = [];
let wordPool = [];

let targetWord = {};
let wordCharacters = [];

let lives = DEFAULT_LIVES;
let winStreak = 0;

let currentWordComponents = [];

let lifeComponents = [];

document.addEventListener("DOMContentLoaded", async () => {
  dictionary = await getDictionary();

  if (dictionary.length == 0) {
    document.querySelector(".container-loader").innerText =
      "Unable to obtain dictionary...";

    return;
  } else {
    document.querySelector(".container-loader").classList.add("hidden");
    document.querySelector(".container-main").classList.remove("hidden");
  }

  document.querySelector(".button-menu").addEventListener("click", presentMenu);

  document.querySelectorAll(".button-menu-dismiss").forEach((button) => {
    button.addEventListener("click", dismissMenu);
  });

  document.querySelector(".overlay").addEventListener("click", () => {
    clickOverlay();
  });

  document.querySelectorAll(".button-reset").forEach((button) => {
    button.addEventListener("click", clickButtonReset);
  });

  document.querySelectorAll(".button-hint").forEach((button) => {
    button.addEventListener("click", clickButtonHint);
  });

  document.querySelectorAll(".button-about").forEach((button) => {
    button.addEventListener("click", clickButtonAbout);
  });

  document.querySelectorAll(".button-letter-input").forEach((button) => {
    button.addEventListener("click", selectLetter);
  });

  resetGame();
});

async function getDictionary() {
  const response = await fetch(
    "https://gist.githubusercontent.com/marcel-erasmus/f3d777ee297d0e26955a2fdfa21a20ce/raw/a46e976c7aa8f5c56ca1fb976529b09455bddfd1/web-game-spewings-dictionary.json",
  );

  if (response.ok) {
    return await response.json();
  } else {
    console.log("HTTP Status: " + response.status);

    return [];
  }
}

// ==================== START: CLICK EVENTS

function clickOverlay() {
  dismissMenu();
  dismissModal();
}

function clickButtonReset() {
  dismissMenu();
  presentModal(getResetConfirmationModalContent());
}

function clickButtonHint() {
  dismissMenu();
  presentModal(getHintModalContent());
}

function clickButtonAbout() {
  dismissMenu();
  presentModal(getAboutModalContent());
}

// ==================== END: CLICK EVENTS

function resetGame() {
  wordPool = [...dictionary];

  lives = DEFAULT_LIVES;
  winStreak = 0;

  resetWord();
  resetLifeComponents();
  updateLifeSummaryValueComponent();
}

function resetWord() {
  let randomWordIndex = Math.floor(Math.random() * wordPool.length);

  targetWord = wordPool[randomWordIndex];

  wordPool.splice(randomWordIndex, 1);

  if (wordPool.length == 0) {
    wordPool = [...dictionary];
  }

  wordCharacters = getFilledCurrentWord(targetWord.word);

  resetCharacterComponents();
  resetLetterInputComponents();
  resetCurrentWordComponent(wordCharacters);

  window.scrollTo(0, 0);
}

function resetCurrentWordComponent(currentWord) {
  const currentWordContainerComponent = document.querySelector(
    ".container-current-word",
  );

  currentWord.forEach((character) => {
    let currentWordComponent = document.createElement("div");
    currentWordComponent.textContent = character;
    currentWordComponent.className =
      "current-word-character current-word-character-unknown interactable";

    currentWordComponents.push(currentWordComponent);

    currentWordContainerComponent.appendChild(currentWordComponent);
  });
}

function resetCharacterComponents() {
  currentWordComponents.forEach((characterElement) => {
    characterElement.remove();
  });

  currentWordComponents = [];
}

function resetLetterInputComponents() {
  document.querySelectorAll(".button-letter-input").forEach((button) => {
    button.removeEventListener("click", selectLetter);
    button.addEventListener("click", selectLetter);
    button.classList.remove("button-letter-input-disabled");
  });
}

function resetLifeComponents() {
  lives = DEFAULT_LIVES;

  const livesContainerComponent = document.querySelector(".container-lives");

  lifeComponents.forEach((lifeComponent) => {
    lifeComponent.remove();
  });

  lifeComponents = [];

  for (let i = 0; i < DEFAULT_LIVES; i++) {
    let lifeComponent = document.createElement("img");
    lifeComponent.className = "life-indicator life";
    lifeComponent.src = "https://images2.imgbox.com/91/a4/4GDp7JQK_o.png";

    lifeComponents.push(lifeComponent);

    livesContainerComponent.appendChild(lifeComponent);
  }
}

function updateCurrentWordCharacterComponent(index) {
  let component = currentWordComponents[index];

  component.textContent = wordCharacters[index];
  component.classList.remove("current-word-character-unknown");
}

function updateLifeSummaryValueComponent() {
  document.querySelector(".life-summary-value").innerText = lives;
}

function getFilledCurrentWord(word) {
  let results = [];
  for (let i = 0; i < word.length; i++) {
    if (word[i] === " " || word[i].word === "-") {
      results.push(word[i]);
    } else {
      results.push("?");
    }
  }

  return results;
}

function selectLetter(e) {
  const button = e.target;
  const pickedLetter = button.value;

  button.removeEventListener("click", selectLetter, false);

  button.classList.add("button-letter-input-disabled");

  matchLetter(pickedLetter);
}

function matchLetter(letter) {
  const transformedTargetWord = targetWord.word.toUpperCase();
  let match = false;

  for (let i = 0; i < targetWord.word.length; i++) {
    if (transformedTargetWord[i] === letter) {
      wordCharacters[i] = targetWord.word[i];

      match = true;

      updateCurrentWordCharacterComponent(i);
    }
  }

  if (!match) {
    decrementLives();
  }

  if (
    !wordCharacters.find((wordChar) => {
      return wordChar === "?";
    })
  ) {
    winStreak += 1;

    incrementLives();

    presentModal(getCorrectWordModalContent());
    resetWord();
  }
}

function incrementLives() {
  if (lives < DEFAULT_LIVES) {
    lives += 1;
  }

  updateLifeSummaryValueComponent();

  for (let i = lifeComponents.length - 1; i >= 0; i--) {
    let lifeComponent = lifeComponents[i];
    if (lifeComponent.classList.contains("death")) {
      lifeComponent.classList.remove("death");
      lifeComponent.classList.add("life");
      lifeComponent.classList.remove("interactable");
      lifeComponent.src = "https://images2.imgbox.com/91/a4/4GDp7JQK_o.png";

      return;
    }
  }
}

function decrementLives() {
  lives -= 1;

  updateLifeSummaryValueComponent();

  if (lives <= 0) {
    presentModal(getGameOverModalContent());

    resetGame();

    return;
  }

  for (let i = 0; i < lifeComponents.length; i++) {
    let lifeComponent = lifeComponents[i];
    if (lifeComponent.classList.contains("life")) {
      lifeComponent.classList.remove("life");
      lifeComponent.classList.add("death");
      lifeComponent.classList.add("interactable");
      lifeComponent.src = "https://images2.imgbox.com/64/be/HflH6VtB_o.png";

      return;
    }
  }
}

// ==================== START: MENU

function presentMenu() {
  const navMenu = document.querySelector(".nav-menu");
  const overlay = document.querySelector(".overlay");

  navMenu.classList.add("nav-menu-active");
  overlay.classList.remove("hidden");
}

function dismissMenu() {
  const navMenu = document.querySelector(".nav-menu");
  const overlay = document.querySelector(".overlay");

  navMenu.classList.remove("nav-menu-active");
  overlay.classList.add("hidden");
}

// ==================== END: MENU

// ==================== START: MODAL

function presentModal(modalContent) {
  const overlay = document.querySelector(".overlay");
  const modal = document.querySelector(".modal");
  const modalTitleComponent = document.querySelector(".modal-title");
  const modalBodyComponent = document.querySelector(".modal-body");
  const modalActionsComponent = document.querySelector(".modal-actions");

  modalTitleComponent.replaceChildren();
  modalBodyComponent.replaceChildren();
  modalActionsComponent.replaceChildren();

  if (modalContent.modalTitle) {
    modalTitleComponent.innerHTML = modalContent.modalTitle;
  }

  if (modalContent.modalBody) {
    modalBodyComponent.innerHTML = modalContent.modalBody;
  }

  if (modalContent.modalActions) {
    modalContent.modalActions.forEach((modalAction) => {
      modalActionsComponent.appendChild(modalAction);
    });
  }

  overlay.classList.remove("hidden");
  modal.classList.remove("hidden");

  modal.scrollTop = 0;
}

function dismissModal() {
  document.querySelector(".modal").classList.add("hidden");
  document.querySelector(".overlay").classList.add("hidden");
}

function getResetConfirmationModalContent() {
  let modalTitle = "CONFIRMATION</br></br>";

  let modalBody =
    "<div>" +
    '<div class="mood-positive-text ri-refresh-line" style="font-size: 4rem;"></div></br>' +
    "<div>Are you sure that you want to restart?</div></br></br>" +
    "</div>";

  let buttonYes = document.createElement("button");
  buttonYes.innerText = "Yurp";
  buttonYes.className = "mood-positive";

  buttonYes.addEventListener("click", () => {
    dismissModal();
    resetGame();
  });

  let buttonNo = document.createElement("button");
  buttonNo.innerText = "Nope";
  buttonNo.className = "mood-negative";

  buttonNo.addEventListener("click", () => {
    dismissModal();
  });

  return {
    modalTitle: modalTitle,
    modalBody: modalBody,
    modalActions: [buttonYes, buttonNo],
  };
}

function getCorrectWordModalContent() {
  let modalTitle = "CORRECT</br></br>";

  let modalBody =
    "<div>" +
    '<div class="mood-positive-text ri-check-line" style="font-size: 4rem;"></div></br>' +
    "<div>Good job, you got it!</div></br>" +
    `<div class="mood-positive-text">${targetWord.word}</div></br>` +
    `<div class="mood-neutral-text">Streak: ${winStreak}</div></br></br>` +
    "</div>";

  let button = document.createElement("button");
  button.innerText = "Continue";
  button.className = "mood-positive";

  button.addEventListener("click", () => {
    dismissModal();
  });

  return {
    modalTitle: modalTitle,
    modalBody: modalBody,
    modalActions: [button],
  };
}

function getGameOverModalContent() {
  let modalTitle = "GAME OVER</br></br>";

  let modalBody =
    "<div>" +
    '<div class="mood-negative-text" style="font-size: 4rem;">:(</div></br>' +
    "<div>How very dead...</div></br>" +
    "<div>The word that did you in was:</div>" +
    `<div class="mood-negative-text">${targetWord.word}</div></br>` +
    `<div class="mood-neutral-text">Streak: ${winStreak}</div></br></br>` +
    "</div>";

  let button = document.createElement("button");
  button.innerText = "Try Again";

  button.addEventListener("click", () => {
    dismissModal();
  });

  return {
    modalTitle: modalTitle,
    modalBody: modalBody,
    modalActions: [button],
  };
}

function getHintModalContent() {
  let modalTitle = "HINT</br></br>";

  let modalBody =
    "<div>" +
    '<div class="ri-question-mark mood-positive-text" style="font-size: 4rem;"></div></br>' +
    `<div>${targetWord.hint}</div></br></br>` +
    "</div>";

  let button = document.createElement("button");
  button.innerText = "Okay";

  button.addEventListener("click", () => {
    dismissModal();
  });

  return {
    modalTitle: modalTitle,
    modalBody: modalBody,
    modalActions: [button],
  };
}

function getAboutModalContent() {
  let modalTitle = "ABOUT</br></br>";

  let modalBody =
    "<div>" +
    '<div><span class="mood-neutral-text">SpEwInGs</span> is a word guessing game loosely based on Hangman.</div></br>' +
    "<div>You suggest letters to fill in the missing letters of the unknown word.</div></br>" +
    '<div class="mood-neutral-text">VOIDWORKS<span class="blink">_</span></div></br></br>' +
    "</div>";

  let button = document.createElement("button");
  button.innerText = "Okay";

  button.addEventListener("click", () => {
    dismissModal();
  });

  return {
    modalTitle: modalTitle,
    modalBody: modalBody,
    modalActions: [button],
  };
}

// ==================== END: MODAL
```

- https://codepen.io/dh_/pen/bGoamKQ

```javascript
const { useState, useEffect } = React;

const WORDS = {
  EASY: ["computer", "test", "code", "website"],
  MEDIUM: ["components", "coding"],
  HARD: ["web developer", "programmer", "portfolio"],
};

const DIFFICULTIES = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
};

const INITIAL_LIVES = 7;

const KEYS = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

const Lives = (props) => {
  const { lives } = props;

  return <div className="Lives">{lives} Lives left</div>;
};

const Word = (props) => {
  const { word, usedLetters, completed } = props;

  const generateLetters = () => {
    if (completed) {
      return word.split("");
    }

    return word
      .split("")
      .map((letter) =>
        letter === " " ? null : usedLetters[letter] ? letter : "_",
      );
  };

  const [generatedLetters, setGeneratedLetters] = useState(generateLetters());

  useEffect(() => {
    setGeneratedLetters(generateLetters());
  }, [word, usedLetters]);

  return (
    <div className="Word">
      {generatedLetters.map((letter) =>
        letter === null ? (
          <div className="Word__gap">{letter}</div>
        ) : (
          <div
            className={`Word__letter ${usedLetters[letter] && word.includes(letter) ? "Word__letter--valid" : ""}`}
          >
            {letter}
          </div>
        ),
      )}
    </div>
  );
};

const Keyboard = (props) => {
  const { word, usedLetters, onLetterSelection, disabled } = props;

  const onKeyClick = (key) => {
    if (usedLetters[key]) {
      return null;
    }

    onLetterSelection(key);
  };

  return (
    <div className="Keyboard">
      {KEYS.map((key) => (
        <button
          className={`Keyboard__key ${usedLetters[key] && word.includes(key) ? "Keyboard__key--valid" : ""}`}
          onClick={() => onKeyClick(key)}
          disabled={usedLetters[key] || disabled}
        >
          {key}
        </button>
      ))}
    </div>
  );
};

const DifficultyDropdown = (props) => {
  const { difficulty, onChange } = props;

  return (
    <div className="DifficultyDropdown">
      <select value={difficulty} onChange={(e) => onChange(e.target.value)}>
        {Object.values(DIFFICULTIES).map((difficulty) => (
          <option value={difficulty}>{difficulty}</option>
        ))}
      </select>
    </div>
  );
};

const Hangman = () => {
  const chooseWord = (previousWord, difficulty) => {
    const words = WORDS[difficulty].filter((word) => word !== previousWord);
    return words[Math.floor(Math.random() * words.length)];
  };

  const [lives, setLives] = useState(INITIAL_LIVES);
  const [completed, setCompleted] = useState(false);
  const [usedLetters, setUsedLetters] = useState({});
  const [difficulty, setDifficulty] = useState(DIFFICULTIES.EASY);
  const [word, setWord] = useState(chooseWord(null, difficulty));
  const [matchedLetters, setMatchedLetters] = useState(0);
  const active = completed || lives === 0;

  const resetGame = () => {
    setLives(INITIAL_LIVES);
    setCompleted(false);
    setUsedLetters({});
    setMatchedLetters(0);
    setWord(chooseWord(word, difficulty));
  };

  const onLetterSelection = (letter) => {
    if (!usedLetters[letter] && !completed) {
      setUsedLetters((state) => ({ ...state, [letter]: true }));
      const numberOfMatchedLetters = word
        .split("")
        .filter((x) => x === letter).length;

      if (numberOfMatchedLetters) {
        const newMatchedLetters = matchedLetters + numberOfMatchedLetters;
        setMatchedLetters(newMatchedLetters);

        if (
          newMatchedLetters === word.split("").filter((x) => x !== " ").length
        ) {
          setCompleted(true);
        }
      } else {
        setLives((state) => lives - 1);
      }
    }
  };

  const onDifficultyChange = (difficulty) => {
    setDifficulty(difficulty);
  };

  useEffect(() => {
    resetGame();
  }, [difficulty]);

  return (
    <div className="Hangman">
      <div className="Hangman__top">
        <div className="Hangman__title">Hangman</div>
        <DifficultyDropdown
          difficulty={difficulty}
          onChange={onDifficultyChange}
        />
      </div>
      <div className="Hangman__status">
        <Lives lives={lives} />
        {completed ? (
          <div className="Hangman__restart">
            <p>Correct</p>
            <button onClick={resetGame}>Play Again</button>
          </div>
        ) : (
          lives === 0 && (
            <div className="Hangman__restart">
              <p>Incorrect</p>
              <button onClick={resetGame}>Play Again</button>
            </div>
          )
        )}
      </div>
      <Word word={word} usedLetters={usedLetters} completed={active} />
      <Keyboard
        word={word}
        usedLetters={usedLetters}
        onLetterSelection={onLetterSelection}
        disabled={active}
      />
      <div className="Hangman__actions">
        <button onClick={resetGame}>Reset</button>
      </div>
    </div>
  );
};

ReactDOM.render(<Hangman />, document.getElementById("root"));
```

- **Quiz:**
  - https://codepen.io/jcoulterdesign/pen/NeOQzX

const globals = {
audio: true
}

// Audio
buttonClick = new Audio('https://s3-us-west-2.amazonaws.com/s.cdpn.io/217233/Buttonclick.mp3');
featured = new Audio('https://s3-us-west-2.amazonaws.com/s.cdpn.io/217233/featured.mp3');
slideSlow = new Audio('https://s3-us-west-2.amazonaws.com/s.cdpn.io/217233/slideSlow.mp3');
wrong = new Audio('https://s3-us-west-2.amazonaws.com/s.cdpn.io/217233/Wrong.mp3');
bg = new Audio('https://s3-us-west-2.amazonaws.com/s.cdpn.io/217233/retrogameloop.mp3');

wrong.volume = 0.2;
// ## Create a function to play our sounds
function playSound(sound) {
if (globals.audio) {

        sound.play(); // Play sound
    }

}

function playAudio(sound) {

    sound.loop = true;
    sound.volume = 0.7;
    sound.play(); // Play sound

}

$(document).ready(function() {
setTimeout(function(){
$('button').animate({'opacity': 1});
}, 2000)

})

$('.loader').click(function() {
$('.main_inner\_\_loading').addClass('loaded');
playAudio(bg);
})

audioSwitch = 0;
sfxSwitch = 0;

$('.options_sf').click(function(){
    if(sfxSwitch == 0) {
        globals.audio = false
        sfxSwitch = 1;
        $(this).css('opacity','0.4')
    } else {
        globals.audio = true
        sfxSwitch = 0;
        $(this).css('opacity','1')
    }
});
$('.options_bg').click(function(){
console.log('test')
if(audioSwitch == 0) {
$(bg).animate({volume: 0}, 600);
audioSwitch = 1;
$(this).css('opacity','0.4')
} else {
$(bg).animate({volume: 0.7}, 600);
audioSwitch = 0;
$(this).css('opacity','1')
}
})

// Quiz options
const sceneDelay = 870; // Scene delay in ms

// Elements
const answers = $('.main_inner**answers');
const answer = answers.find('.answer');
const circle = $('.main_inner**circle');

// Quiz progress
var progress = 1; // Change this to your scene number

// Transition check
var transitioning = false;

// End circle scale
const circleScale = 10;

// Our main array. You must add your details to this.
const scenes = [
{
name: 'akuaku', // Must mirror class name
author: 'João Santos', // Your name
codepenprofile: 'jotavejv', // Your Codepen profile link
twitterprofile: '_jotavejv', // Your Codepen profile link
answer: 'Crash Bandicoot', // The correct game, we can obfuscate this later if we want to hide answers
backgroundColor: 'rgb(67, 34, 56)', // Page background color for your scene
hint: 'UKA UKA is FREEEEE!'
},{
name: 'kirby', // Must mirror class name
author: 'Katherine Kato', // Your name
codepenprofile: 'kathykato', // Your Codepen profile link
twitterprofile: 'kato_katherine', // Your Codepen profile link
answer: 'Kirby', // The correct game, we can obfuscate this later if we want to hide answers
backgroundColor: 'rgb(218, 68, 103)', // Page background color for your scene
hint: 'A Nintendo classic'
}, {
name: 'hexipal', // Must mirror class name
author: 'Kristopher Van Sant', // Your name
codepenprofile: 'KristopherVanSant', // Your Codepen profile link
twitterprofile: 'KristopherVanSant', // Your Codepen profile link
answer: 'Broken Age', // The correct game, we can obfuscate this later if we want to hide answers
backgroundColor: '#ea894f', // Page background color for your scene
hint: 'An animated puzzle adventure'
}, {
name: 'moogle', // Must mirror class name
author: 'Jasmine Wright', // Your name
codepenprofile: 'jnwright', // Your Codepen profile link
twitterprofile: 'salsaverde', // Your Codepen profile link
answer: 'Final Fantasy', // The correct game, we can obfuscate this later if we want to hide answers
backgroundColor: '#3fde9d', // Page background color for your scene
hint: 'Kupo!'
}, {
name: 'mario', // Must mirror class name
author: 'Klara Miffili', // Your name
codepenprofile: 'miffili', // Your Codepen profile link
twitterprofile: 'KlaraMiffili', // Your Codepen profile link
answer: 'Mario Brothers', // The correct game, we can obfuscate this later if we want to hide answers
backgroundColor: '#fb741e', // Page background color for your scene
hint: 'Letsa gooooooo!'
}, {
name: 'buster', // Must mirror class name
author: 'Jamie Coulter', // Your name
codepenprofile: 'jcoulterdesign', // Your Codepen profile link
twitterprofile: 'jamiecoulter89', // Your Codepen profile link
answer: 'Final Fantsy 7', // The correct game, we can obfuscate this later if we want to hide answers
backgroundColor: '#4d352f', // Page background color for your scene
hint: '1997 JRPG for PS1!'
}
]

// List of random video games that our JS can pull from, feel free to add your own
const videoGames = [
'Pong',
'Zork',
'Space Invaders',
'Asteroids',
'Pac-Man',
'Defender',
'Donkey Kong',
'Frogger',
'Galaga',
'Joust',
'Ms. Pac-Man',
'Pitfall!',
'Tetris',
'Gauntlet',
'Super Mario Bros.',
'The Legend of Zelda',
'Contra',
'Double Dragon',
'Grand Theft Auto',
'Half-Life 2',
'Katamari Damacy',
'Metal Gear Solid 3',
'World of Warcraft',
'Civilization IV',
'Devil May Cry 3',
'God of War',
'Guitar Hero',
'Resident Evil 4',
'Shadow of the Colossus',
'Tom Clancys Splinter Cell',
'The Elder Scrolls IV',
'Gears of War',
'Ōkami',
'Spiderman',
'Tomb Raider',
'Wii Sports',
'BioShock',
'Call of Duty 4: Modern Warfare'
]

// Start by assigning colors and other props to the scene
function setUp() {

    // Lets start by setting the correct colors for our scene
    $('body').css('background', scenes[progress - 1].backgroundColor);
    circle.css('background', scenes[progress].backgroundColor);
    circle.find('.circles').css('background', scenes[progress].backgroundColor);

    // Then fade our first scene in
    $(`.scene:nth-of-type(${progress})`).fadeIn();

    // Loop through the array and add a breadcrum for each
    for(let i in scenes) {
        $('.main_inner__breadcrumbs').append('<div class="breadcrumb"></div>');
    }

    // Set first to active
    $('.breadcrumb:first').addClass('active');

    // Calculate width of breadcrumbs
    let width = ($('.breadcrumb').length - 1) * 34;
    $('.main_inner__breadcrumbs').css('width', width);

}

// Set up initial scene
setUp();

// Initialise scene
function initScene(scene) {

    // Get the next scene from our array
    let nextScene = $('.scene.' + scenes[progress - 1].name);

    // Bring the next scene in
    setTimeout(function(){
        nextScene.fadeIn();
        nextScene.css('bottom', '-400px');
    }, 500);

    // Change info
    $('.main_inner__info span').text(scenes[progress - 1].author);
    $('.main_inner__info .codepen').attr('href' , `https://www.codepen.io/${scenes[progress - 1].codepenprofile}`);
    $('.main_inner__info .twitter').attr('href' , `https://www.twitter.com/${scenes[progress - 1].twitterprofile}`);

    // Change the hint
    $('.main_inner__title .hint').slideUp(function() {
        $('.main_inner__title .hint').text(scenes[progress - 1].hint);
    });

    // Bring the info in
    setTimeout(function() {
        $('.main_inner__info').css('bottom' , '40px');
        $('.main_inner__info').css('opacity' , '1');
    }, 700);

    // Clear any data on the answers
    answer.removeData();

    // Let assign the correct answer to one of the available answers

    // Pick a random number between 0 and 2
    let correctAnswer = Math.floor(Math.random() * 3);
    let correctAnswerEl = $(answer[correctAnswer]);

    // Set the text of the answer element
    correctAnswerEl.text(scenes[scene - 1].answer);
    correctAnswerEl.data('correct', true);

    // Select the other answers and if no data set against it, pick a random game
    answer.each(function() {
        let el = $(this);
        if(!el.data('correct')) {

            // Pick a random number between 0 and VG array length
            let rand = Math.floor(Math.random() * (videoGames.length - 1));
            $(this).text(videoGames[rand]);
        }
    });

}

// Check answer
function checkAnswer(el) {
// If clicked answer has data stored
if(el.data('correct'))
return 'correct';
}

$(answer).mouseenter(function() {
playSound(buttonClick);
});

// Bind answers to check, this should really be passed to another function but meh...
$(answer).click(function() {

    // Lets first scroll to the top of the page incase its mobile
    $("html, body").animate({ scrollTop: 0 }, "fast");

    // Start a transition
    if(!transitioning) {
        transitioning = true; // Check if not mid transition
        if(checkAnswer($(this))) {

            // Play sound
            playSound(featured);

            // Add breadcrumb class
            $('.breadcrumb.active').addClass('correct');

            // Add class to button
            $(this).addClass('correct');

            // Set up feedback message
            $('.main_inner__feedback').removeClass('wrong');
            $('.main_inner__feedback').text('Correct').addClass('correct');
            $('.main_inner__feedback').css('transform', 'translateY(-50%) scale(1) rotate(0deg)');
        } else {
            // Add breadcrumb class
            $('.breadcrumb.active').addClass('wrong');

            playSound(wrong);

            // Add class to button
            $(this).addClass('wrong');

            // Set up feedback message
            $('.main_inner__feedback').removeClass('correct');
            $('.main_inner__feedback').text('Wrong').addClass('wrong');
            $('.main_inner__feedback').css('transform', 'translateY(-50%) scale(1) rotate(0deg)');
        }

        // Move breadcrumb
        $('.breadcrumb.active').removeClass('active').next().addClass('active');

        let currentScene = $('.scene.' + scenes[progress - 1].name);
        console.log(progress)

        currentScene.css('opacity', '0');
        console.log(currentScene)

        $('.main_inner__info').css('bottom' , '-50px');
        $('.main_inner__info').css('opacity' , '0');

        // Increase our progress in the quiz
        progress++;

        // End screen
        if(progress == $('.scene').length + 1) {
            $('.main_inner__modalOverlay, .main_inner__modal, .main_inner__modalContent').show();
            $('p.score').html('You got ' + $('.breadcrumb.correct').length + ' out of 5 correct!')
        }

        // Some crazy animations. I've gone a bit nuts on using set timeouts, should really be using delays in CSS
        // So we start by setting the scale of our circle and moving the scene out, CSS transitions does the rest
        setTimeout(function() {
            circle.css('transform' , `translateY(-50%) scale(${circleScale})`);
            answer.css('left' , '100px')
            answer.css('opacity' , '0')
        }, 230);

        // Then after the transition is complete we set the background to the next color in our array
        // Then set the scale of the circle back to 0 (removing any transitions)
        setTimeout(function() {
            $('body').css('background', scenes[progress - 1].backgroundColor);
            circle.css({'transform' : `translateY(-50%) scale(0)`});
            circle.css({'transition-duration' : '0ms'})

            // Get some colors based on new bg
            let newHue = LightenDarkenColor(scenes[progress - 1].backgroundColor, 30);
            let newHueInfo = LightenDarkenColor(scenes[progress - 1].backgroundColor, -20);

            // Alter the hue of certain texts to match new bg color
            $('.main_inner__title a').css('color', newHue);
            $('.main_inner__info p').css('color', newHueInfo);
            $('.main_inner__info span').css('color', newHueInfo);



            $('.main_inner__feedback').css('transform', 'translateY(-50%) scale(0) rotate(20deg)');
        }, sceneDelay);

        // Then bring the circle back in and color it to the next bg in the array
        setTimeout(function() {
            answer.removeClass('correct');
            answer.removeClass('wrong');
            if(window.innerWidth > 1000) {
                circle.css({'transform' : `translateY(-50%) scale(1)`});
            } else {
                circle.css({'transform' : `translateY(calc(-50% - 110px)) scale(0.6)`});
            }
            circle.css({'transition-duration' : '500ms'});
            circle.css('background', scenes[progress].backgroundColor);
            circle.find('.circles').css('background', scenes[progress].backgroundColor);
            answer.css('left' , '0');
            answer.css('opacity' , '1');

            // Set timeout to transition to next scene
            playSound(slideSlow);

            initScene(progress);
            transitioning = false;
        }, sceneDelay + 100);
    }

});

// Show hint
$('.main_inner\_\_title a').click(function() {
$(this).next().slideToggle();
 return false;
});

// Handle key presses
$(document).keypress(function(event) {
if(event.charCode == 49) {
answer[0].click();
}
if(event.charCode == 50) {
answer[1].click();
}
if(event.charCode == 51) {
answer[2].click();
}
});

// Returns a lightened or darkened version of the passed hex
// Taken from CSS tricks
function LightenDarkenColor(col, amt) {
var usePound = false;
if (col[0] == "#") {
col = col.slice(1);
usePound = true;
}
var num = parseInt(col,16);
var r = (num >> 16) + amt;
if (r > 255) r = 255;
else if (r < 0) r = 0;
var b = ((num >> 8) & 0x00FF) + amt;
if (b > 255) b = 255;
else if (b < 0) b = 0;
var g = (num & 0x0000FF) + amt;
if (g > 255) g = 255;
else if (g < 0) g = 0;
return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
}

// Initialise the quiz
function initQuiz() {
initScene(progress);
}

class Grain {
constructor (el) {
/\*\*
_ Options
_ Increase the pattern size if visible pattern
\*/
this.patternSize = 150;
this.patternScaleX = 1;
this.patternScaleY = 1;
this.patternRefreshInterval = 3; // 8
this.patternAlpha = 12; // int between 0 and 255,

        /**
     * Create canvas
     */
        this.canvas = el;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.scale(this.patternScaleX, this.patternScaleY);

        /**
     * Create a canvas that will be used to generate grain and used as a
     * pattern on the main canvas.
     */
        this.patternCanvas = document.createElement('canvas');
        this.patternCanvas.width = this.patternSize;
        this.patternCanvas.height = this.patternSize;
        this.patternCtx = this.patternCanvas.getContext('2d');
        this.patternData = this.patternCtx.createImageData(this.patternSize, this.patternSize);
        this.patternPixelDataLength = this.patternSize * this.patternSize * 4; // rgba = 4

        /**
     * Prebind prototype function, so later its easier to user
     */
        this.resize = this.resize.bind(this);
        this.loop = this.loop.bind(this);

        this.frame = 0;

        window.addEventListener('resize', this.resize);
        this.resize();

        window.requestAnimationFrame(this.loop);
    }

    resize () {
        this.canvas.width = window.innerWidth * devicePixelRatio;
        this.canvas.height = window.innerHeight * devicePixelRatio;
    }

    update () {
        const {patternPixelDataLength, patternData, patternAlpha, patternCtx} = this;

        // put a random shade of gray into every pixel of the pattern
        for (let i = 0; i < patternPixelDataLength; i += 4) {
            // const value = (Math.random() * 255) | 0;
            const value = Math.random() * 255;

            patternData.data[i] = value;
            patternData.data[i + 1] = value;
            patternData.data[i + 2] = value;
            patternData.data[i + 3] = patternAlpha;
        }

        patternCtx.putImageData(patternData, 0, 0);
    }

    draw () {
        const {ctx, patternCanvas, canvas, viewHeight} = this;
        const {width, height} = canvas;

        // clear canvas
        ctx.clearRect(0, 0, width, height);

        // fill the canvas using the pattern
        ctx.fillStyle = ctx.createPattern(patternCanvas, 'repeat');
        ctx.fillRect(0, 0, width, height);
    }

    loop () {
        // only update grain every n frames
        const shouldDraw = ++this.frame % this.patternRefreshInterval === 0;
        if (shouldDraw) {
            this.update();
            this.draw();
        }

        window.requestAnimationFrame(this.loop);
    }

}

function twShare(url, title, winWidth, winHeight) {
const winTop = 100;
const winLeft = 100;
window.open(`https://twitter.com/intent/tweet?text=${title}`, 'sharer', `top=${winTop},left=${winLeft},toolbar=0,status=0,width=${winWidth},height=${winHeight}`);
}

pen_id = $('.\_pen_id').text();

$('body').on('click', '.share', () => {
    twShare(`https://codepen.io/jcoulterdesign/full/a1b3ea524ead4700015153bb95b881c3`, `I got ${$('.breadcrumb.correct').length} out of 5 questions correct in this quiz by @jamiecoulter89 and others. https://bit.ly/2TLaILc %23cssvideogamequiz`, 520, 350);
return false;
});

/\*\*

- Initiate Grain
  \*/
  const el = document.querySelector('.grain');
  const grain = new Grain(el);

//$('.main_inner\_\_loading').fadeOut()

initQuiz();

// 8 questions
// Find the mario
// Release screen rec and tweet - 20
````
