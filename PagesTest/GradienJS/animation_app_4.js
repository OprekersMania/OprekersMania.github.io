var CTX;

var CONFIG = {
    "animation_timing_ms": 100,
    "none_color": "#333333",
    "grid_height": 16,
    "grid_length": 32,
    "led_size": 15,
    "led_spacing": 10,
    "set_color": "#ff0000",
    "Frame": 32,
    "repeat": 1,
    "C_anim": 32,
    "Move_val": 1,
    "xpos": 0,
    "ypos": 0,
    "gridwidth": 32,
    "gridheight": 16
}

var animation; 
var playing = false;
var insertAtTheEnd = false;
var colorPicking = false;

/* pencil, eraser */
var mode = "pencil"

var pixelMode = false;
var Trailcolor = false;
var draw_mode = false;
var paste_Mode = false;
var OpenFile = false;
var move_mode = false;
var shift_Mode = false;
var dir_move = ""

var ledDataCopy = []
var mouseDown = false;
var selectingArea = false;
var moveArea = false;
var startX;
var startY;
var selectedArea = { startX: 0, startY: 0, endX: 0, endY: 0, w:0, h:0 };
	
/* This funciton is stolen from: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
Written by Tim Down */
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function writeUint8(value, array) {
        let steps = new Uint8Array(1);
        steps[0] = value;
        array.push(steps);
}

function writeUint16(value, array) {
        let steps = new Uint16Array(1);
        steps[0] = value;
        array.push(steps);
		
}

function rgbToHex(rgb) {
    return `#${((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1)}`;
}

function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    };
}

function interpolateColor(color1, color2, ratio) {
    return {
        r: Math.round(color1.r + ratio * (color2.r - color1.r)),
        g: Math.round(color1.g + ratio * (color2.g - color1.g)),
        b: Math.round(color1.b + ratio * (color2.b - color1.b))
    };
}

function generateColorGradient(startColor, endColor, steps) {
    const startRGB = hexToRgb(startColor);
    const endRGB = hexToRgb(endColor);

    const colorSteps = [];
    for (let i = 0; i < steps; i++) {
        const ratio = i / (steps - 1);
        const currentColor = interpolateColor(startRGB, endRGB, ratio);
        const hexColor = rgbToHex(currentColor);
        colorSteps.push(hexColor);
    }

    return colorSteps;
}

function generateFullSpectrumColors(steps) {
    const colors = [];
    const hueStep = 360 / steps;

    for (let i = 0; i < steps; i++) {
        const hue = i * hueStep;
        const rgb = hslToRgb(hue, 100, 50);
        const hexColor = rgbToHex(rgb);
        colors.push(hexColor);
    }

    return colors;
}

function updateInteger(fieldName){
			CONFIG[fieldName] = document.getElementById(fieldName).value;
			// console.log(CONFIG[fieldName]);
}

function updateCanvas(){
	
$("#xpos").attr({
"max" : CONFIG["grid_length"],
"min" : 0
});
$("#ypos").attr({
"max" : CONFIG["grid_height"],
"min" : 0
});
$("#gridwidth").attr({
"max" : CONFIG["grid_length"],
"min" : 0
});
$("#gridheight").attr({
"max" : CONFIG["grid_height"],
"min" : 0
});

	var Pixels = CONFIG["led_size"] + CONFIG["led_spacing"];
	canvas.width = Pixels * CONFIG["grid_length"];
	canvas.height = CONFIG["grid_height"] * Pixels;
	startDraw();
}

class Animation {
    constructor(leds) {
        this.leds = leds;
        this.stepCount = 0;
        this.currentIndex = 0;
        this.playing = false;
        this.use_color = "#ffffff"
        this.colors = [{}]
        this.clipboard = [];
        this.emptyGrid = false;
    }

    clickLed(x, y) {
        for (let i = 0; i < CONFIG["grid_height"] * CONFIG["grid_length"]; i++) {
            if (this.leds[i].checkCollision(x, y)) {
                if (colorPicking) {
                    let color = this.leds[i].getColor()
                    if (color != CONFIG["none_color"]) {
                        this.setColor(color.substr(1));
						$("#colorpicker").spectrum("set", color);
                    }
                }
                else if (mode == "pencil") {
                        this.leds[i].updateColor(this.use_color);
                        this.colors[this.currentIndex][this.use_color] = 1;
                }

                else if (mode == "eraser")
                        this.leds[i].updateColor(CONFIG["none_color"]);
                return true;
            }
        }
        return false;
    }

	saveToFile() {
    const ledDataArray = animation.leds.map(led => {
        return {
            x: led.x,
            y: led.y,
            colorState: led.colorState,
            currentState: led.currentState,
            size: led.size,
            spacing: led.spacing,
            posX: led.posX,
            posY: led.posY
        };
    });

    const animationData = {
        leds: ledDataArray,
        stepCount: animation.stepCount,
        currentIndex: animation.currentIndex,
        playing: animation.playing,
        use_color: animation.use_color,
        colors: animation.colors
    };

    const jsonString = JSON.stringify(animationData);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "animation_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

    loadFromFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json, .txt, .csv';

        input.onchange = (event) => {
            const file = event.target.files[0];

            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const animationData = e.target.result;
                    this.parseAndApplyAnimationData(animationData);
                    // this.ApplyAnimationData(animationData);
                };
                reader.readAsText(file);
            }
        };

        input.click();
    }

    ApplyAnimationData(animationData) {
        const parsedData = JSON.parse(animationData);

		// console.log(parsedData);
		
        this.leds.forEach((led, index) => {
            led.colorState = parsedData.leds[index].colorState;
        });

        this.stepCount = parsedData.stepCount;
        this.currentIndex = parsedData.currentIndex;
        this.playing = parsedData.playing;
        this.use_color = parsedData.use_color;
        this.colors = parsedData.colors;

        this.update();
    }
	
    parseAndApplyAnimationData(animationData) {
        const parsedData = JSON.parse(animationData);

        // Deteksi ukuran grid dari file yang dimuat
        const gridSizeX = parsedData.leds.reduce((max, led) => Math.max(max, led.x + 1), 0);
        const gridSizeY = parsedData.leds.reduce((max, led) => Math.max(max, led.y + 1), 0);

        // Perbarui CONFIG dengan ukuran grid yang terdeteksi
        CONFIG["grid_length"] = gridSizeX;
        CONFIG["grid_height"] = gridSizeY;
		$('#grid_length').val(gridSizeX);
		$('#grid_height').val(gridSizeY);

        // Perbarui ukuran canvas berdasarkan CONFIG yang diperbarui
        const Pixels = CONFIG["led_size"] + CONFIG["led_spacing"];
        canvas.width = Pixels * CONFIG["grid_length"];
        canvas.height = Pixels * CONFIG["grid_height"];

        // Update objek animasi yang ada
        this.leds = parsedData.leds.map(ledData => {
            const led = new Led(ledData.x, ledData.y);
            led.colorState = ledData.colorState;
            led.currentState = ledData.currentState;
            led.size = ledData.size;
            led.spacing = ledData.spacing;
            led.posX = ledData.posX;
            led.posY = ledData.posY;
            return led;
        });

        this.stepCount = parsedData.stepCount;
        this.currentIndex = parsedData.currentIndex;
        this.playing = parsedData.playing;
        this.use_color = parsedData.use_color;
        this.colors = parsedData.colors;

        // Pastikan semua langkah animasi ditampilkan
        for (let step = 0; step <= this.stepCount; step++) {
            this.updateLedState();
            this.draw();
        }

        // Tetapkan currentIndex ke langkah terakhir
        this.currentIndex = this.stepCount;

        // Pastikan canvas diperbarui
        this.update();
    }

	drawCircle(centerX, centerY, radius,color) {
		let x = radius;
		let y = 0;
		let p = 1 - radius;

		// Simetri titik-titik pertama (seperdelapan)
		this.plotPoints(centerX, centerY, x, y,color);

		while (x > y) {
			y++;

			// Keputusan di dalam oktet pertama
			if (p <= 0) {
				p = p + 2*y + 1;
			} else {
				x--;
				p = p + 2*y - 2*x + 1;
			}

			// Simetri titik-titik di semua oktet
			this.plotPoints(centerX, centerY, x, y,color);
			// console.log(centerX, centerY, x, y,color);
		}
		this.draw();
	}

	plotPoints(centerX, centerY, x, y,color) {
    // Simetri titik-titik di semua oktet
    this.drawPixel(centerX + x, centerY - y,color);
    this.drawPixel(centerX - x, centerY - y,color);
    this.drawPixel(centerX + x, centerY + y,color);
    this.drawPixel(centerX - x, centerY + y,color);
    this.drawPixel(centerX + y, centerY - x,color);
    this.drawPixel(centerX - y, centerY - x,color);
    this.drawPixel(centerX + y, centerY + x,color);
    this.drawPixel(centerX - y, centerY + x,color);
}

	// Fungsi copy untuk mendeteksi warna aktif dan posisinya
	copyData() {
		const copyRow = parseInt(document.getElementById("rowInput").value);
		const copyColumn = parseInt(document.getElementById("columnInput").value);
			$('#rowInput').val('');
			$('#columnInput').val('');

		this.clipboard = [];

		// Iterate through all LEDs
		for (let i = 0; i < this.leds.length; i++) {
			const led = this.leds[i];

			// Jika copyRow atau copyColumn tidak null, cek apakah LED berada di baris atau kolom yang sesuai
			if ((copyRow !== null && led.y === copyRow) || (copyColumn !== null && led.x === copyColumn)) {
				// Simpan informasi warna dan posisi ke clipboard
				this.clipboard.push({
					x: led.x,
					y: led.y,
					color: led.colorState[this.currentIndex],
				});
			} else if (isNaN(copyRow) && isNaN(copyColumn)) {
				// Jika tidak ada baris atau kolom yang ditentukan, salin seluruh data LED
				this.clipboard.push({
					x: led.x,
					y: led.y,
					color: led.colorState[this.currentIndex],
				});
			}
		}
		console.log(this.clipboard);
	}

	pasteData() {
		// Dapatkan nilai dari input row dan column
		const targetRow = document.getElementById("rowInput").value;
		const targetColumn = document.getElementById("columnInput").value;

		// Iterate through clipboard data
		for (let i = 0; i < this.clipboard.length; i++) {
			const data = this.clipboard[i];
        // Temukan LED yang sesuai dengan posisi yang diinginkan
        let targetLed;

        // Cek apakah kita memiliki nilai targetRow dan targetColumn
        if (targetRow !== "" && targetColumn !== "") {
            targetLed = this.leds.find(
                (led) => led.x === parseInt(targetColumn) && led.y === parseInt(targetRow)
            );
        } else {
            // Jika tidak, gunakan data posisi dari clipboard
            targetLed = this.leds.find(
                (led) => led.x === data.x && led.y === data.y
            );
        }

			// Jika LED ditemukan dan memiliki warna default, tempatkan warna dari clipboard ke LED
			if (targetLed && targetLed.colorState[this.currentIndex] === CONFIG["none_color"]) {
			// if (targetLed && targetLed.colorState[this.currentIndex] === CONFIG["none_color"]||targetLed.colorState[this.currentIndex] === data.color) {
				targetLed.colorState[this.currentIndex] = data.color;
			}
		}

		// Tambahkan langkah dan perbarui tampilan
		// this.newStep();
		this.draw();
		// console.log(this.leds);
	}
	
	
	checkEmptyGrid(){
    // Check if all LED colors match the default none_color
    const allColorsMatchNoneColor = this.leds.every((led) => {
        return led.colorState[this.currentIndex] === CONFIG["none_color"];
    });

    if (allColorsMatchNoneColor) {
		this.emptyGrid = true;
    } else {
		this.emptyGrid = false;
    }
}
	
	generateGradientAnimation(orientation, frame) {
		let ulang = CONFIG["repeat"];
		// Number of steps in the animation
		let steps = frame;
		let pixel = CONFIG["grid_length"];

		// Calculate color gradient steps
		const allColors = generateFullSpectrumColors(steps);
		steps = allColors.length;
		
			switch (orientation) {
				case 'testing':
				case 'VerticalToRight':
				case 'VerticalToLeft':
						if(steps > CONFIG["grid_length"]){
							steps = CONFIG["grid_length"]
							ulang += 1;
						}
					break;
					
				case 'HorizonUpDown':
				case 'HorizonDownUp':
						if(steps > CONFIG["grid_height"]){
							steps = CONFIG["grid_height"]
							ulang += 1;
						}
					break;
				case 'diagonal-topleft':
				case 'diagonal-topright':
				case 'diagonal-bottomleft':
				case 'diagonal-bottomright':
					steps = CONFIG["grid_length"] + CONFIG["grid_height"]-1;
					break;
			}
			
		// Repeat generation of total frames
		for (let repeat = 0; repeat < ulang; repeat++) {
		// Generate animation frames
		for (let i = 0; i < steps; i++) {
			const currentColor = allColors[(i + repeat * steps) % allColors.length]; 
			// console.log(steps, allColors.length);
			if(pixelMode) pixel = i;
			switch (orientation) {
				case 'testing':
					for (let y = 0; y < pixel; y++) {
						this.drawPixel(i, y, currentColor);
						this.drawPixel(CONFIG["grid_length"] - 1 - i, y, currentColor);
						this.drawPixel(y, i, currentColor);
						this.drawPixel(y, CONFIG["grid_height"] - 1 - i, currentColor);
					}
					break;
				case 'VerticalToRight':
					dir_move = 'right';
					for (let y = 0; y < CONFIG["grid_height"]; y++) {
						this.drawPixel(i, y, currentColor);
					}
					break;
				case 'VerticalToLeft':
					dir_move = 'left';
					for (let y = 0; y < CONFIG["grid_height"]; y++) {
						this.drawPixel(CONFIG["grid_length"] - 1 - i, y, currentColor);
					}
					break;
				case 'HorizonUpDown':
					dir_move = 'down';
					for (let x = 0; x < CONFIG["grid_length"]; x++) {
						this.drawPixel(x, i, currentColor);
					}
					break;
				case 'HorizonDownUp':
					dir_move = 'up';
					for (let x = 0; x < CONFIG["grid_length"]; x++) {
						this.drawPixel(x, CONFIG["grid_height"] - 1 - i, currentColor);
					}
					break;
				case 'fullMatrix':
					this.drawFullMatrixColor(currentColor);
					break;
				case 'diagonal-topleft':
					if(pixelMode) {
						for (let d = 0; d <= pixel; d++) {
							this.drawPixel(d, d, currentColor);
						}
					}else{
					for (let d = 0; d < pixel; d++) {
						const x = d;
						const y = i - d;
						if (y >= 0 && y < CONFIG["grid_height"]) {
							this.drawPixel(x, y, currentColor);
						}
					}
					}
					break;
				case 'diagonal-topright':
					if(pixelMode) {
					for (let d = 0; d <= pixel; d++) {
						this.drawPixel(CONFIG["grid_length"] - 1 - d, d, currentColor);
					}
					}else{
					for (let d = 0; d < pixel; d++) {
						const x = CONFIG["grid_length"] - 1 - d;
						const y = i - d;
						if (y >= 0 && y < CONFIG["grid_height"]) {
							this.drawPixel(x, y, currentColor);
						}
					}
					}
					break;
				case 'diagonal-bottomleft':
					if(pixelMode) {
					for (let d = 0; d <= pixel; d++) {
						this.drawPixel(d, CONFIG["grid_height"] - 1 - d, currentColor);
					}
					}else{
					for (let d = 0; d < pixel; d++) {
						const x = d;
						const y = CONFIG["grid_height"] - 1 - (i - d);
						if (y >= 0 && y < CONFIG["grid_height"]) {
							this.drawPixel(x, y, currentColor);
						}
					}
					}
					break;
				case 'diagonal-bottomright':
					if(pixelMode) {
					for (let d = 0; d <= pixel; d++) {
						this.drawPixel(CONFIG["grid_length"] - 1 - d, CONFIG["grid_height"] - 1 - d, currentColor);
					}
					}else{
					for (let d = 0; d < pixel; d++) {
						const x = CONFIG["grid_length"] - 1 - d;
						const y = CONFIG["grid_height"] - 1 - (i - d);
						if (y >= 0 && y < CONFIG["grid_height"]) {
							this.drawPixel(x, y, currentColor);
						}
					}
					}
					break;
			}
			

			this.draw();
			this.checkEmptyGrid();
			
				if (paste_Mode){
					this.stepForward();
				}else{	
					if (Trailcolor){
						this.newStep(true);
					}else{
						this.newStep();
					}
				}
			if(this.emptyGrid){
				this.deleteStep();
			}
			if (shift_Mode){
				this.movePixels(dir_move, false, false)
			}
		}
		}
			if (!paste_Mode){
			this.deleteStep();
			}
	}

	drawDiamond(orientation, frame) {
		let ulang = CONFIG["repeat"];
		let pixel = CONFIG["grid_length"];
		let steps = frame;
		// Calculate color gradient steps
		const allColors = generateFullSpectrumColors(steps);
		steps = allColors.length;
		switch (orientation) {
			case 'testing':
				steps = CONFIG["grid_height"];
				break;
		}
		// Repeat generation of total frames
		for (let repeat = 0; repeat < ulang; repeat++) {
			for (let i = 0; i < steps; i++) {
				const currentColor = allColors[(i + repeat * steps) % allColors.length]; 
				if(pixelMode) pixel = i;
				switch (orientation) {
					case 'testing':
						this.Rectangle(currentColor, i, i, CONFIG["grid_length"] - i - 1, CONFIG["grid_height"] - i - 1);
						break;
					case 'diamondinline':
						if ( CONFIG["grid_length"] % 2 === 0 && CONFIG["grid_height"] % 2 === 0 ){
							this.Diamond(currentColor, i, CONFIG["grid_length"], CONFIG["grid_height"],"inline");
						} else {
							this.tesDiamond(currentColor, i, CONFIG["grid_length"], CONFIG["grid_height"],"inline");
						}
						break;
					case 'diamondoutline':
						this.Diamond(currentColor, i, CONFIG["grid_length"], CONFIG["grid_height"],"outline");
						break;
					case 'diamondinfull':
						this.Diamond(currentColor, i, CONFIG["grid_length"], CONFIG["grid_height"],"infull");
						break;
					case 'diamondoutfull':
						this.Diamond(currentColor, i, CONFIG["grid_length"], CONFIG["grid_height"],"outfull");
						break;
					case 'diamondindouble':
						this.Diamond(currentColor, i, CONFIG["grid_length"], CONFIG["grid_height"],"indouble");
						break;
					case 'diamondoutdouble':
						this.Diamond(currentColor, i, CONFIG["grid_length"], CONFIG["grid_height"],"outdouble");
						break
				}
				this.draw();
				this.checkEmptyGrid();
				
				if (paste_Mode){
					this.stepForward();
				} else {	
					if (Trailcolor){
						this.newStep(true);
					}else{
						this.newStep();
					}
				}
				if(this.emptyGrid){
					this.deleteStep();
				}
			}
		}
			this.deleteStep();
	}

	Diamond(color, size, gridLength, gridHeight, mode, onlyShape = false) {
		const centerX = Math.floor(gridLength / 2);
		const centerY = Math.floor(gridHeight / 2);
		
		for (let y = 0; y <= gridHeight; y++) {
			for (let x = 0; x <= gridLength; x++) {
				const distanceIN = (centerX - Math.abs(centerX - x)) + (centerY - Math.abs(centerY - y));
				const distanceOUT = Math.abs(centerX - x) + Math.abs(centerY - y);
				switch (mode) {
					case 'inline':
						if (distanceIN === size) {
							this.DiamondHelper(x, y, centerX,centerY, color);
						}
					break;
					case 'outline':
						if (distanceOUT === size) {
							this.DiamondHelper(x, y, centerX,centerY, color);
						}
					break;
					case 'infull':
						if (distanceIN <= size) {
							this.DiamondHelper(x, y, centerX,centerY, color);
						}
					break;
					case 'outfull':
						if (distanceOUT >= size) {
							this.DiamondHelper(x, y, centerX,centerY, color);
						}
					break;
					case 'outdouble':
						if (Math.abs(distanceOUT-centerY) + Math.abs(distanceOUT-centerY) >= size) {
							this.DiamondHelper(x, y, centerX,centerY, color);
						}
					break;
					case 'indouble':
						if (Math.abs(distanceOUT-centerY) + Math.abs(distanceOUT-centerY) <= size) {
							this.DiamondHelper(x, y, centerX,centerY, color);
						}
					break;
				}
			}
		}
		if(onlyShape) {
			this.draw();
		}
	}

	DiamondHelper(x, y, centerX,centerY, color){
		let a = x;
		let b = y;
		if( a > centerX || b > centerY ){
			if( a > centerX ) a = x - 1;
			if( b > centerY ) b = y - 1;
		}
		if(y != centerY){
			if (x != centerX){
			this.drawPixel(a, b, color);
			}
		}
	}
	
	tesDiamond(color, size, gridLength, gridHeight, mode) {
		const centerX = Math.floor(gridLength / 2);
		const centerY = Math.floor(gridHeight / 2);
		
		for (let y = 0; y < gridHeight; y++) {
			for (let x = 0; x < gridLength; x++) {
				const distanceIN = (centerX - Math.abs(centerX - x)) + (centerY - Math.abs(centerY - y));
				const distanceOUT = Math.abs(centerX - x) + Math.abs(centerY - y);
				switch (mode) {
					case 'inline':
						if (distanceIN === size) {
							this.drawPixel(x, y, color);
						}
					break;
					case 'outline':
						if (distanceOUT === size) {
							this.drawPixel(x, y, color);
						}
					break;
					case 'infull':
						if (distanceIN <= size) {
							this.drawPixel(x, y, color);
						}
					break;
					case 'outfull':
						if (distanceOUT >= size) {
							this.drawPixel(x, y, color);
						}
					break;
					case 'outdouble':
						if (Math.abs(distanceOUT-centerY) + Math.abs(distanceOUT-centerY) >= size) {
							this.drawPixel(x, y, color);
						}
					break;
					case 'indouble':
						if (Math.abs(distanceOUT-centerY) + Math.abs(distanceOUT-centerY) <= size) {
							this.drawPixel(x, y, color);
						}
					break;
				}
			}
		}
	}

	Rectangle(color, x1, y1, x2, y2) {
		for (let x = x1; x <= x2; x++) {
			this.drawPixel(x, y1, color);  // Top
			this.drawPixel(x, y2, color);  // Bottom
		}
		for (let y = y1 + 1; y < y2; y++) {
			this.drawPixel(x1, y, color);  // Left
			this.drawPixel(x2, y, color);  // Right
		}
	}

	drawPixel(x, y, color) {
		const led = this.leds[y * CONFIG["grid_length"] + x];
		// Hanya mengganti warna jika led tersebut belum memiliki warna
		if (draw_mode) {
			// Hanya mengganti warna jika led tersebut belum memiliki warna
			if (led.colorState[this.currentIndex] === CONFIG["none_color"]) {
				led.colorState[this.currentIndex] = color;
                        this.colors[this.currentIndex][color] = 1;
				// this.updateLed(x,y,color);
			}
		} else {
			led.colorState[this.currentIndex] = color;
                        this.colors[this.currentIndex][color] = 1;
			// this.updateLed(x,y,color);
		}
	}

	drawFullMatrixColor(color) {
			for (let i = 0; i < this.leds.length; i++) {
				const led = this.leds[i];
				led.colorState[this.currentIndex] = color;
			}
		}
		
	drawRectangle(x, y, width, height) {
		  
		const maxX = CONFIG["grid_length"];
		const maxY = CONFIG["grid_height"];

		// Iterate through all LEDs
		for (let i = 0; i < maxX * maxY; i++) {
		  const led = this.leds[i];

		  // Check if the LED is within the rectangle boundaries
		  if (
			(led.x >= x && led.x < x + width && led.y >= y && led.y < y + height) &&
			// Check if the LED is on the border of the rectangle
			(led.x === x || led.x === x + width - 1 || led.y === y || led.y === y + height - 1)
		  ) {
			// Set the color for LEDs on the border of the rectangle
			led.colorState[this.currentIndex] = this.use_color;
		  } else {
			// Reset the color for LEDs inside the rectangle or outside the border
			led.colorState[this.currentIndex] = CONFIG["none_color"];
		  }
		}

		this.newStep();
		this.draw();
		// console.log(this.leds);
	  }

	fillRingRectangle(x, y, width, height) {
			const maxX = CONFIG["grid_length"];
			const maxY = CONFIG["grid_height"];

			for (let i = 0; i < maxX * maxY; i++) {
				const led = this.leds[i];

				// Check if the LED is within the specified rectangle
				const withinRectangle =
					led.x >= x &&
					led.x < x + width &&
					led.y >= y &&
					led.y < y + height;

				if (withinRectangle) {
					// Preserve existing active colors, only update default color
					if (led.colorState[this.currentIndex] === CONFIG["none_color"]) {
						led.colorState[this.currentIndex] = this.use_color;
					}
				}
			}

			this.newStep();
			this.draw();
			// console.log(this.leds);
		}

	fillRectangle(x, y, width, height) {
		  
		const maxX = CONFIG["grid_length"];
		const maxY = CONFIG["grid_height"];
		// Iterate through all LEDs
		for (let i = 0; i < maxX*maxY; i++) {
		  const led = this.leds[i];

		  // Check if the LED is within the rectangle boundaries
		  if (led.x >= x && led.x < x + width && led.y >= y && led.y < y + height) {
			// Set the color for LEDs within the rectangle
			led.colorState[this.currentIndex] = this.use_color;
		  } else {
			// Reset the color for LEDs outside the rectangle
			led.colorState[this.currentIndex] = CONFIG["none_color"];
		  }
		}

		  this.newStep();
		  this.draw();
		  // console.log(this.leds);
	  }

	changeColor() {
			const currentState = this.currentIndex;  // Assume currentState is 1

			// Iterate through all LEDs
			for (let i = 0; i < this.leds.length; i++) {
				const led = this.leds[i];
				if (led.colorState[currentState] !== CONFIG["none_color"]) {
					led.colorState[currentState] = this.use_color;
				}
			}
			  this.draw();
			  // console.log(this.leds);
		}
		
	
	cloneMove(){
		const allColors = generateFullSpectrumColors(CONFIG["C_anim"]);
		for (let x = 0; x < CONFIG["C_anim"]; x++){
			const currentColor = allColors[x];
			this.copyData();
			if(draw_mode){
				this.use_color = currentColor;
				}
				
			this.newStep();
			this.pasteData();
				if (!Trailcolor&&draw_mode){
			this.changeColor();
				}
			// console.log(currentColor);
			for (let y = 0; y < CONFIG["Move_val"]; y++){
				this.movePixels(dir_move,true,false);
			}
			
				if (Trailcolor){
			if(draw_mode){
			this.changeColor();
			}
			this.copyData();
			this.deleteStep();
			this.pasteData();
			this.copyData();
			this.newStep(true);
			this.pasteData();
				}
			
		}
	}


	movePixels(direction, loopEnd, addStep) {	
	  const shiftedRowData = [];
	  const shiftedColumnData = [];
	  let width = CONFIG["grid_length"];
	  let height = CONFIG["grid_height"];
	  
	  if (addStep){
		  this.newStep(true);
	  }
	  
		switch (direction) {
		case 'down':
			for (let y = height-1; y > 0; y--) {
			  for (let x = 0; x < width; x++) {
				const currentLed = this.leds[y * width + x];
				const upperLed = this.leds[(y - 1) * width + x];
				if (loopEnd){
					shiftedRowData.push(this.leds[y * width + x].colorState[this.currentIndex]);
				}
				if (currentLed.currentState === upperLed.currentState) {
				  currentLed.colorState[this.currentIndex] = upperLed.colorState[this.currentIndex];
				}
			  }
			}
			break;
		case 'up':
			for (let y = 0; y < height-1; y++) {
			  for (let x = 0; x < width; x++) {
				const currentLed = this.leds[y * width + x];
				const lowerLed = this.leds[(y + 1) * width + x];
				if (loopEnd){
					shiftedRowData.push(this.leds[y * width + x].colorState[this.currentIndex]);
				}
				if (currentLed.currentState === lowerLed.currentState) {
				  currentLed.colorState[this.currentIndex] = lowerLed.colorState[this.currentIndex];
				}
			  }
			}
			break;
		case 'right':
			for (let y = 0; y < height; y++) {
			  if (loopEnd){
				shiftedColumnData.push(this.leds[y * width + width-1].colorState[this.currentIndex]);
			}
			  for (let x = width-1; x > 0; x--) {
				const currentLed = this.leds[y * width + x];
				const leftLed = this.leds[y * width + (x - 1)];

				if (currentLed.currentState === leftLed.currentState) {
				  currentLed.colorState[this.currentIndex] = leftLed.colorState[this.currentIndex];
				}
			  }
			}
			  if (loopEnd){
				for (let y = 0; y < height; y++) {
				  const leftmostLed = this.leds[y * width];
				  leftmostLed.colorState[this.currentIndex] = shiftedColumnData[y];
				}
			  }
			break;
		case 'left':
			for (let y = 0; y < height; y++) {
			  if (loopEnd){
				shiftedColumnData.push(this.leds[y * width].colorState[this.currentIndex]);
			  }
			  for (let x = 0; x < width-1; x++) {
				const currentLed = this.leds[y * width + x];
				const rightLed = this.leds[y * width + (x + 1)];

				if (currentLed.currentState === rightLed.currentState) {
				  currentLed.colorState[this.currentIndex] = rightLed.colorState[this.currentIndex];
				}
			  }
			}
			  if (loopEnd){
				for (let y = 0; y < height; y++) {
				  const rightmostLed = this.leds[y * width + width-1];
				  rightmostLed.colorState[this.currentIndex] = shiftedColumnData[y];
				}
			  }
			break;
		}

	  // Reset the color state of the appropriate row or column based on the direction
	  if (direction === 'down' || direction === 'up') {
		const resetRow = (direction === 'down') ? 0 : height-1;
		for (let x = 0; x < width; x++) {
			if (loopEnd){
				this.leds[resetRow * width + x].colorState[this.currentIndex] = shiftedRowData[x];
			} else {
				this.leds[resetRow * width + x].colorState[this.currentIndex] = CONFIG["none_color"];
			}
		}
	  } else if (direction === 'right' || direction === 'left') {
		const resetColumn = (direction === 'right') ? 0 : width-1;
		for (let y = 0; y < height; y++) {
			if (loopEnd){
				this.leds[y * width + resetColumn].colorState[this.currentIndex] = shiftedColumnData[y];
			} else {
				this.leds[y * width + resetColumn].colorState[this.currentIndex] = CONFIG["none_color"];
			}
		}
	  }

	  this.draw();
	}

    getLedsWithColor(index, color) 
	{
        var led_indexes = []
        this.leds.forEach(led => {
            if (led.hasColorInState(index, color)) 
            {
                led_indexes.push(led.getIndex());
            }
        });
        return led_indexes;
    }

    /* Data format:
    uint8: total animation steps
    ---
    uin16: numbers of colors in this step,
    ----
    uint8: r,
    uint8: g,
    uint8: b,
    uint16: number of leds in this step
    uint16 led_indexes[] 
    ---
    uint16: number of colors in this step
    -----
    uint8 r,
    uint8 g.... and so on
    */  
    export() {
        let data = [];
        let totalAnimationSteps = this.stepCount + 1;
		let tulis = '========= data capture =========\n';

        writeUint8(totalAnimationSteps, data);
		tulis +=  'Total Animation Steps : ' + totalAnimationSteps +'\n';
        
        for (var i = 0; i < totalAnimationSteps; i++) 
        {

            let totalColorsInCurrentStep = Object.keys(this.colors[i]).length;

            if (totalColorsInCurrentStep === 0 && totalAnimationSteps === 0)
            {
                // console.log("Nothing to export.")
				$('#hasil').val("Nothing to export.");
                return;
            }

				tulis +=  '\n Step : ' + (i+1) +'\n';
				writeUint16(totalColorsInCurrentStep, data);
				tulis += '   Color in use : ' + totalColorsInCurrentStep +'\n';

            for (const color of Object.keys(this.colors[i])) 
            {
                let rgb = hexToRgb(color)
                writeUint8(rgb.r, data)
                writeUint8(rgb.g, data)
                writeUint8(rgb.b, data)
				tulis += '   HexColor : ' + color;
				tulis += '   RGB_Color : ' + rgb.r +','+ rgb.g +','+ rgb.b +'\n';
                let ledsWithThisColor = this.getLedsWithColor(i, color);
                writeUint16(ledsWithThisColor.length, data)
				tulis += '   Using in led pos : ' + ledsWithThisColor + '\n';
				tulis += '   Total led use this color : ' + ledsWithThisColor.length + '\n';
                ledsWithThisColor.forEach(elem => {
                    writeUint16(elem, data);
                })
            }
        }

		tulis += '\nFinished code data:\n'+ data;
		$('#testing').val(tulis);
		console.log(data);
        var blob = new Blob(data, { type: "application/octet-stream" });
		var blobUrl = window.URL.createObjectURL(blob);
 
    var downloadLink = document.createElement("a");
    downloadLink.href = blobUrl;
    downloadLink.download = 'animation';
    downloadLink.innerHTML = "Download File";
    downloadLink.onclick = destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();

    }

    update() {
        this.updateLedState();
        this.draw();
    }
    
    insertStep() {
        this.leds.forEach(led => {
            led.insert();
        });
    }
    
	newStep(copy = false) {
		
        this.stepCount++;
        var previousIndex = this.currentIndex;
        if (insertAtTheEnd) {
            this.currentIndex = this.stepCount;
            this.colors.push({});
			insertAtTheEnd = false;
        } else {
            this.currentIndex++;
            this.colors.splice(this.currentIndex, 0, {});
            this.insertStep();
        }

        this.update();

        if (copy && this.stepCount > 0) 
        {
            for (const color of Object.keys(this.colors[previousIndex])) 
            {
                this.colors[this.currentIndex][color] = 1;
            }

            this.leds.forEach(led => {
                led.copyIndex(previousIndex);
            });
        }
        this.update();
    }

    stepForward() {
        if (this.currentIndex < this.stepCount) {
            this.currentIndex++;
        }
        else {
            this.currentIndex = 0;
        }
        this.update();
    }
    
    clearAll() {
        this.leds.forEach(led => {
            led.updateColor(CONFIG["none_color"]);
        });
        this.update();
    }
	
    stepBackward(){
        this.currentIndex--;
        if (this.currentIndex < 0){
			this.currentIndex = this.stepCount;
		}
        this.update();
    }

    updateLedState() {
        this.leds.forEach(led => {
            led.updateState(this.currentIndex)
        });
    }

    animationStep() {

        if (this.stepCount == 0) 
        {
            this.stop();
            return;
        }
        this.currentIndex++;
        this.currentIndex = (this.currentIndex % (this.stepCount + 1))
        this.update();
    }
    
    setColor(color){
        this.use_color = "#" + color;
    }

    play() {	
        if (!playing) {
            playing = true;
            this.playingInterval = setInterval(() => {this.animationStep()}, CONFIG["animation_timing_ms"]);
        }
    }
     
    stop() {
        playing = false;
        clearTimeout(this.playingInterval);
        this.update();
    }
    
    deleteStep(shiftKey) {
     if (this.stepCount > 0)   {
        this.leds.forEach(led => {
            led.removeStep(this.currentIndex);
            led.updateState(this.currentIndex - 1);
        });

        if (shiftKey) {
            // Hapus semua langkah jika tombol Shift ditekan
            this.currentIndex = 0;
            this.stepCount = 0; 
			this.update();
			clearAll();
        } else {
            // Hapus satu langkah jika tidak ada tombol Shift
            this.colors.splice(this.currentIndex, 1);
			 if (this.currentIndex != 0)
				this.currentIndex--;
            this.stepCount--;
			this.update();
        }
     }
    }
    
    draw() {
        clearCanvas()
        updateCurrentStep()
        updateTotalSteps()
		this.leds.forEach(led => {
           led.draw(); 
        });
    }

}//----- class animation end

class Led {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.colorState = [CONFIG["none_color"]]
        this.currentState = 0;
        this.size = CONFIG["led_size"]
        this.spacing = CONFIG["led_spacing"]
        this.posX = this.x * this.size + this.x * this.spacing;
        this.posY = this.y * this.size + this.y * this.spacing;

    }

    removeStep(idx) {
        this.colorState.splice(idx, 1)
    }
	
    hasColorInState(state, color) {
        return this.colorState[state] == color;
    }

    getColor(){
        return this.colorState[this.currentState];
    }

    getIndex(){
        return this.y * CONFIG["grid_length"] + this.x;
    }

    insert() {
        this.colorState.splice(this.currentState + 1, 0,  CONFIG["none_color"]);
    }

    copyIndex(idx){
        this.colorState[this.currentState] = this.colorState[idx];
    }

    checkCollision(x, y) {
        return (x >= this.posX && x <= this.posX + this.size && y >= this.posY && y <= this.posY + this.size)
    }

    updateColor(color) {
        this.colorState[this.currentState] = color;
    }

    updateState(step) {
        this.currentState = step;
        if (step == this.colorState.length) {
            this.colorState.push(CONFIG["none_color"])
        }
    }

    draw() {
        if (this.colorState[this.currentState - 1] != CONFIG["none_color"] && this.colorState[this.currentState] == CONFIG["none_color"] && this.currentState != 0 && !playing) {
            CTX.fillStyle = this.colorState[this.currentState - 1];
            CTX.globalAlpha = 0.1;
            CTX.shadowBlur = 0;
        }
        else {
            CTX.fillStyle = this.colorState[this.currentState];
            CTX.shadowColor = this.colorState[this.currentState];
            CTX.globalAlpha = 1;
            CTX.shadowBlur = 0;
        }

        CTX.beginPath();
        CTX.fillRect(this.x * this.size + this.x * this.spacing, this.y * this.size + this.y * this.spacing, this.size, this.size);
        CTX.stroke();
    }

}//---- class led end

function startRotationAnimation(totalstep) {
    for (let x = 0; x <= totalstep; x++) {
	copyStep(true);
        rotateGrid(10);
    animation.draw();
    }
}

function rotateGrid(degrees) {
    // Ubah derajat rotasi menjadi radian
    var radians = (degrees * Math.PI) / 180;

    // Tentukan pusat rotasi (misalnya, pusat grid)
    var centerX = CONFIG["grid_length"] / 2;
    var centerY = CONFIG["grid_height"] / 2;

    // Iterasi melalui setiap LED dan terapkan transformasi rotasi
    animation.leds.forEach(function (led) {
        // Hitung koordinat LED terhadap pusat rotasi
        var x = led.x - centerX;
        var y = led.y - centerY;
        // Terapkan transformasi rotasi
        var rotatedX = x * Math.cos(radians) - y * Math.sin(radians);
        var rotatedY = x * Math.sin(radians) + y * Math.cos(radians);

        // Kembalikan koordinat LED ke tempat semula
        led.x = rotatedX + centerX;
        led.y = rotatedY + centerY;

		console.log(x,y,led.x,led.y);
        // Jika diperlukan, Anda juga dapat memperbarui posX dan posY
        led.posX = led.x * led.size + led.x * led.spacing;
        led.posY = led.y * led.size + led.y * led.spacing;
    });
}

function changeColor() {
    animation.changeColor();	
}

function gradient(direction, cond) {
	let frame = CONFIG["Frame"];
	pixelMode = cond;
	if (shift_Mode){
		Trailcolor = true;
		paste_Mode = true;
		draw_mode = true; 
		shift_Mode = false;
			switch (direction) {
				case 'testing':
				case 'VerticalToRight':
				case 'VerticalToLeft':
							frame = CONFIG["grid_length"]
					break;
				case 'HorizonUpDown':
				case 'HorizonDownUp':
							frame = CONFIG["grid_height"]
					break;
				case 'diagonal-topleft':
				case 'diagonal-topright':
				case 'diagonal-bottomleft':
				case 'diagonal-bottomright':
					frame = CONFIG["grid_length"] + CONFIG["grid_height"]-1;
					break;
			}
			animation.generateGradientAnimation(direction, frame );
	// console.log(direction,dir_move, shift_Mode,frame);
			for (let x=0;x<frame*2;x++){
				animation.movePixels(dir_move, true, true)
			}
			
		Trailcolor = false;
		paste_Mode = false;
		draw_mode = false; 
	} else {
		animation.generateGradientAnimation(direction, frame );	
	}
}

function Diamond(direction, cond) {
	let frame = CONFIG["Frame"];
	pixelMode = cond;
    animation.drawDiamond(direction, frame);	
}

function fillRectangle() {
	  const x= parseInt(CONFIG["xpos"]);
	  const y= parseInt(CONFIG["ypos"]);
	  const w= parseInt(CONFIG["gridwidth"]);
	  const h= parseInt(CONFIG["gridheight"]);
    animation.fillRectangle(x,y,w,h);	
}

function fillRingRectangle() {
	  const x= parseInt(CONFIG["xpos"]);
	  const y= parseInt(CONFIG["ypos"]);
	  const w= parseInt(CONFIG["gridwidth"]);
	  const h= parseInt(CONFIG["gridheight"]);
    animation.fillRingRectangle(x,y,w,h);	
}
function loopRectangle(){
	  const x= parseInt(CONFIG["xpos"]);
	  const y= parseInt(CONFIG["ypos"]);
	  const w= parseInt(CONFIG["gridwidth"]);
	  const h= parseInt(CONFIG["gridheight"]);
	for(let ypos = y; ypos <= h/2; ypos++){
		for(let xpos = x; xpos <= w/2; xpos++){
		}
	}
}
	  
	
function drawRectangle() {
	  const x= parseInt(CONFIG["xpos"]);
	  const y= parseInt(CONFIG["ypos"]);
	  const w= parseInt(CONFIG["gridwidth"]);
	  const h= parseInt(CONFIG["gridheight"]);
    animation.drawRectangle(x, y, w, h);	
}

function destroyClickedElement(event){
    document.body.removeChild(event.target);
}
 
function delteks() {
		$('#hasil').val('');
}

function startSelectionMode() {
    selectingArea = true;
	moveArea = false;
	selectedArea = { startX: 0, startY: 0, endX: 0, endY: 0, w: 0, h: 0 };
	$('#canvas').css({'cursor': "url('clone.png') -10 40, pointer"});
}

function clearCanvas() {
    CTX.clearRect(0, 0, canvas.width, canvas.height);
}

function updateCurrentStep() {
    $(".totalSteps").each(function() {
        this.innerHTML = animation.stepCount + 1;
    })
}

function updateTotalSteps() {
    $(".currentStep").each(function() {
        this.innerHTML = animation.currentIndex + 1;
    })
}

function startDraw(){
    var mouse_down = false;
    var c = document.getElementById("canvas");
    CTX = c.getContext("2d");
	var BB = c.getBoundingClientRect();
	var offsetX = BB.left;
	var offsetY = BB.top;
    var leds = []

    for (i = 0; i < CONFIG["grid_height"]; i++) 
    {
        for (j = 0; j < CONFIG["grid_length"]; j++) 
        {
            leds.push(new Led(j, i))
        }
    }

    animation = new Animation(leds);
    animation.draw();
	
	if (OpenFile){
		animation.loadFromFile(); // Load data on initialization
	}

    c.onclick = function(e) { 
        if (animation.clickLed(e.offsetX, e.offsetY) ) 
        {
            animation.draw();
        }
    }

    c.onmousedown = function(e) {
        mouse_down = true;
        if (selectingArea) {
            startSelection(e);
        }
		if (moveArea) {
			var mx = parseInt(e.clientX - offsetX);
			var my = parseInt(e.clientY - offsetY);
			
			// test each rect to see if mouse is inside
			if (mx > selectedArea.startX && mx < selectedArea.startX + (selectedArea.endX-selectedArea.startX) && my > selectedArea.startY && my < selectedArea.startY + (selectedArea.endY-selectedArea.startY)) {
				// if yes, set that rects isDragging=true
				moveArea = true;
			}
			// save the current mouse position
			startX = mx;
			startY = my;
		}
    }

    c.onmousemove = function(e) {
        if (mouse_down) 
        {
            if (selectingArea || moveArea) {
                moveSelection(e);
            } 
			else 
			{
				if (animation.clickLed(e.offsetX, e.offsetY) ) 
				{
					clearCanvas()
					animation.draw();
				}
            }
        }
    }
	
    c.onmouseup = function(e) { 
        mouse_down = false;
        if (selectingArea || moveArea) {
            endSelection(e);
        }
    }
	
    function startSelection(e) {
		ledDataCopy = []
        selectedArea.startX = e.offsetX;
        selectedArea.startY = e.offsetY;
    }

    function moveSelection(e) {
        if (selectingArea) {
			selectedArea.endX = e.offsetX;
			selectedArea.endY = e.offsetY;
			selectedArea.w = selectedArea.endX - selectedArea.startX;
			selectedArea.h = selectedArea.endY - selectedArea.startY;
		}
        animation.draw();
        if (selectingArea) {
			CTX.strokeStyle = "#00FF00";
			CTX.strokeRect(
				selectedArea.startX,
				selectedArea.startY,
				selectedArea.w,
				selectedArea.h
			);
		}
		if (moveArea) {
			// get the current mouse position
			var mx = parseInt(e.clientX - offsetX);
			var my = parseInt(e.clientY - offsetY);
			// calculate the distance the mouse has moved
			// since the last mousemove
			var dx = mx - startX;
			var dy = my - startY;
			// move each rect that isDragging 
			// by the distance the mouse has moved
			// since the last mousemove
			selectedArea.startX += dx;
			selectedArea.startY += dy;
			// redraw the scene with the new rect positions
			CTX.strokeStyle = "#FF0000";
			CTX.strokeRect(
				selectedArea.startX,
				selectedArea.startY,
				selectedArea.w,
				selectedArea.h
			);
			// reset the starting mouse position for the next mousemove
			startX = mx;
			startY = my;
			selectedArea.endX = selectedArea.startX + selectedArea.w;
			selectedArea.endY = selectedArea.startY + selectedArea.h;
		}	
    }

	function endSelection(e) {
        // Determine the selected LED grid area
        var area = {
            x: Math.min(selectedArea.startX, selectedArea.endX),
            y: Math.min(selectedArea.startY, selectedArea.endY),
            width: Math.abs(selectedArea.w),
            height: Math.abs(selectedArea.h),
        };
		
		if (moveArea) {
			var number = 0;
			animation.leds.forEach(led => {
				if (
					led.posX >= area.x &&
					led.posX <= area.x + area.width &&
					led.posY >= area.y &&
					led.posY <= area.y + area.height
				) {
					led.colorState[led.currentState] = ledDataCopy[number]
					number++;
				}
			});
			animation.update();
		}
		
		if (selectingArea) {
			selectingArea = false;
			moveArea = true;
			animation.leds.forEach(led => {
				if (
					led.posX >= area.x &&
					led.posX <= area.x + area.width &&
					led.posY >= area.y &&
					led.posY <= area.y + area.height
				) {
					ledDataCopy.push(led.colorState[led.currentState])
				}
			});
		}
	}
}

function stepForward() {
    animation.stepForward();
}

function stepBackward() {
    animation.stepBackward();
}

function play() {
    animation.play();
}

function stop(){
    animation.stop();
}

function setColor(color) {
	// $("#testing").val(color.toString(16));
	CONFIG["set_color"] = color;
	$("#colorpicker").spectrum("set", color);
    animation.setColor(color);
}

function setMode(m) {
    colorPicking = false;
	moveArea = false;
    mode = m
    if (mode == "pencil") {
        $('#canvas').css({'cursor': "url('pencilsmall.png') -10 40, pointer"});
    }
    else if (mode == "eraser") {
        $('#canvas').css({'cursor': "url('eraser.png') -10 40, pointer"});
    }
}

function clearAll() {
    animation.clearAll()
}

function exportFormat() {
    animation.export();
}

function removeStep(e) {
	var shiftKey = e.shiftKey;
    animation.deleteStep(shiftKey);
}

function newStep() {
    animation.newStep();
}

function copyStep() {
    animation.newStep(true)
}

function handleButtonClick(arah, e) {
	var ctrlKey = e.ctrlKey; 
	var shiftKey = e.shiftKey;
	animation.movePixels(arah, shiftKey, ctrlKey)
}
  
function moveMode(v, dir){
    move_mode = v;
	dir_move = dir;
}

function shiftMode(v){
    shift_Mode = v;
}

function drawmode(v){
    draw_mode = v;
}

function Trailling(v){
    Trailcolor = v;
}

function pasteMode(v){
    paste_Mode = v;
	// console.log(paste_Mode)
}

function insertAfter(){
    insertAtTheEnd = true;
    animation.newStep(true)
}

function colorPick(v) {
    colorPicking = v;
    if (colorPicking) {
        $('#canvas').css({'cursor': "url('eyedrop.png') -10 40, pointer"});
    }
    else {
        setMode(mode);
    }
}

function savelog() {
		console.log(animation.leds);
	let input = $('#hasil').val()
	$('#testing').val(input);
}

function openfile() {
	OpenFile = true;
	animation.loadFromFile();
}

$(document).ready(function () {
	//---- for debug only -------
	const console_log = window.console.log;
	window.console.log = function(...args){
		$('#hasil').val('');
		console_log(...args);
		var textarea = document.getElementById('hasil');
		if(!textarea) return;
		args.forEach(arg=>textarea.value += `${JSON.stringify(arg)}\n`);
	}
	//----------------------------
	
	startDraw();
	$( "#draggable" ).draggable();
	  
	$('#savefile').click(function () {
		const animationData = animation.getData();
		// console.log(animationData);
		saveTextAsFile()
	})
	  
	$("#colorpicker").spectrum({
		move: function(color) {
				setColor(color)
		},
			type: "flat",
			hideAfterPaletteSelect: true,
			showButtons: false,
			showAlpha: false,
			palette: [
					["#ef9a9a","#ce93d8","#9fa8da","#90caf9","#80deea","#80cbc4","#c5e1a5","#e6ee9c","#fff59d","#ffe082","#ffab91","#b0bec5"],
					["#e57373","#ba68c8","#7986cb","#64b5f6","#4dd0e1","#4db6ac","#aed581","#dce775","#fff176","#ffd54f","#ff8a65","#90a4ae"],
					["#ef5350","#ab47bc","#5c6bc0","#42a5f5","#26c6da","#26a69a","#9ccc65","#d4e157","#ffee58","#ffca28","#ff7043","#78909c"],
					["#f44336","#9c27b0","#3f51b5","#2196f3","#00bcd4","#009688","#8bc34a","#cddc39","#ffeb3b","#ffc107","#ff5722","#607d8b"],
					["#e53935","#8e24aa","#3949ab","#1e88e5","#00acc1","#00897b","#7cb342","#c0ca33","#fdd835","#ffb300","#f4511e","#546e7a"],
					["#d32f2f","#7b1fa2","#303f9f","#1976d2","#0097a7","#00796b","#689f38","#afb42b","#fbc02d","#ffa000","#e64a19","#455a64"],
					["#c62828","#6a1b9a","#283593","#1565c0","#00838f","#00695c","#558b2f","#9e9d24","#f9a825","#ff8f00","#d84315","#37474f"],
					["#b71c1c","#4a148c","#1a237e","#0d47a1","#006064","#004d40","#33691e","#827717","#f57f17","#ff6f00","#bf360c","#263238"],
					["#ff0000","#00ff00","#0000ff","#ffff00","#ff00ff","#00ffff","#f52887","#9400d3","#8b4513","#008000","#f0ffff","#b6b6b4"] //#b6b6b4
					]
	});

	$(document).keyup(function(e) {
			switch(e.which) {
				case 18:
					colorPick(false);
				break;
		}
	});

	$(document).keydown(function(e) {
		// console.log(e.which);
			// $('#testing').val(e.which);
		if (e.keyCode == 65 && e.ctrlKey) {
			e.target.select()
		} 
		else if (e.keyCode == 67 && e.ctrlKey) {
			e.target.copy()
		} 
		else if (e.keyCode == 88 && e.ctrlKey) {
			e.target.cut()
		} 
		else if (e.keyCode == 83 && e.ctrlKey) {
			savefile()
		} 
		else if (e.keyCode == 86 && e.ctrlKey) {
			e.target.paste()
		} 
		else if (e.which >= 49 && e.which <= 55) {
			// Check if the focus is not on an input element
			if (!$('input:focus').length) {
				var colorCode;
				switch (e.which) {
					case 49: colorCode = "FF0000"; break;
					case 50: colorCode = "00FF00"; break;
					case 51: colorCode = "0000FF"; break;
					case 52: colorCode = "FFFF00"; break;
					case 53: colorCode = "00FFFF"; break;
					case 54: colorCode = "FF00FF"; break;
					case 55: colorCode = "FFFFFF"; break;
				}

				// Call your setColor function with the chosen color code
				setColor(colorCode);
			console.log(colorCode);

				// Prevent the default action (scroll / move caret)
				e.preventDefault();
			}
		} else {
			switch(e.which) {
				case 83:
					startSelectionMode();
				break; 
				case 90:
					clearAll();
				break
				case 88:
					removeStep(e);
				break
				case 73:
				case 18:
					colorPick(true);
				break
				case 38:
					handleButtonClick('up', e);
					break;
				case 40: // Down arrow
					handleButtonClick('down', e);
					break;
				case 37: // Left arrow
					handleButtonClick('left', e);
					break;
				case 39: // Right arrow
					handleButtonClick('right', e);
				break
				case 69:
					setMode("eraser");
				break; 
				case 70:
					setMode("pencil");
				break;
				case 81:
					newStep();
				break;
				case 82:
					copyStep();
				break;
				case 65:
					stepBackward();
				break;
				case 67:
					animation.copyData();
				break;
				case 86:
					animation.pasteData();
				break;
				case 68:
					stepForward();
				break;
				case 46:
					clearAll();
				break;
				case 32: 
					if(playing) 
						animation.stop();
					else
						animation.play();
					break;
				break;
				default: return; // exit this handler for other keys
			}
		e.preventDefault(); // prevent the default action (scroll / move caret)
		}
	});

	$('.dropdown').dropdown({
		transition: 'drop', on: 'hover' 
	});
	  
})