
class Graph
{
    constructor(divIdString, pointsArray, drawCordsBool) 
    {
        let cDiv = document.getElementById(divIdString);
        this.divId = divIdString;
        this.id = divIdString + "Canvas";

        (pointsArray == null)? (this.points = []) : (this.points = pointsArray);

        this.width = cDiv.clientWidth;          //width of canvas
        this.halfWidth = cDiv.clientWidth / 2;    // for simplyfining calc. 
        this.height = cDiv.clientHeight;        //height of canvas
        this.halfHeight = cDiv.clientHeight / 2;  // for simplyfining calc.

        this.gDimX = cDiv.clientWidth /  2 + 100; // dimension of x axix (from zero to max X)
        this.gDimY = cDiv.clientHeight / 2 + 100; // dimension of y axis (from zero to max Y)
        // add 100 px more to be sure that we fill the div completely

        this.cSoX = 0;  //cordinate system offset in x
        this.cSoY = 0;  //cordinate system offset in y
        this.cSoXprev = this.cSoX;  //previous cordinate system offset in x
        this.cSoYprev = this.cSoY;  //previous cordinate system offset in y

        //should  X: (value mouse on) Y: ...     be drawn
        (drawCordsBool == null)? (this.drawCords = false) : (this.drawCords = drawCordsBool);     
        this.mouseX = 0;    //mouse x position over canvas
        this.mouseY = 0;    //mouse y position over canvas
        this.panX = 0;      // how much was panned in X while dragging mouse
        this.panY = 0;      // how much was panned in Y while dragging mouse
        this.panMode = false;   // are we in panMode / is the user dragging the mouse

        this.graphUnit = 1;     // units of graph per line
        this.unitMultiplier = 1;    // units multiplier needed for zooming

        this.zoom = 4;  // how many scroll increments did the user scroll
        this.zoomed = true; // did we redraw the CS after zooming
        this.zoomInC = 2;   // how many times did we devide graph units while zooming in
        this.zoomInS = 0;   // another form of zoomInC to simplify calc.
        this.zScrollBreak = 12; // scroll increments before multiplying units

        this.callBackFun;

        //newCanvas.setAttribute("width",x); != newCanvas.style.width = x;

        let newCanvas = document.createElement("canvas");
        newCanvas.setAttribute("id", divIdString + "Canvas");
        newCanvas.setAttribute("width", cDiv.clientWidth); 
        newCanvas.setAttribute("height", cDiv.clientHeight);

        cDiv.appendChild(newCanvas);
        this.drawCS();
    }
    
    drawCS()
    {
        let c = document.getElementById(this.id);
        let ctx = c.getContext("2d");
        
        ctx.clearRect(0,0,this.width,this.height);
        
        ctx.fillStyle = "black";
        ctx.font = "16px Arial";//thirret vetem kete here me posht vlera e saj ruhet

        let count = 1;//used for drawing numbers in the for loops below
        
        let unitOver10 = 77 + 7 * this.zoom; unitOver10 /= 10;
        let count10p = 1;

        //drawing x cordinate line as long as it doesnt offset outside the canvas
        if(Math.abs(this.cSoY) < this.halfHeight) 
        { 
            this.drawLine(this.halfWidth - this.gDimX, this.halfHeight - this.cSoY, this.gDimX * 2, 0, "black", 1);
        }
        //y cordinate line as long as it doesnt offset outside the canvas
        if(Math.abs(this.cSoX) < this.halfWidth)
        { 
            this.drawLine(this.halfWidth + this.cSoX, this.halfHeight - this.gDimY, this.gDimY * 2, -90, "black", 1); 
        }

        //x line notations positive side
        //csox vjen tu rrit kur sistemi kordinativ zhvendoset djathtas dhe anasjelltas
        for(let i = 0; i < this.gDimX - this.cSoX; i += 7) {

            //every 20% of units px lines 
            if(Math.abs(this.cSoY) < this.halfHeight)
            { 
                this.drawLine(this.halfWidth + count10p * unitOver10 + this.cSoX, this.halfHeight - 2 - this.cSoY, 4, -90, "black", 1);
                count10p++; 
            }

            if(!(Math.abs(i) % (77 + this.zoom * 7)) && (Math.abs(i) > 0)) {

                //every (77 + 7*zoom) px lines
                this.drawLine(this.halfWidth + i + this.cSoX, 0, this.height, -90, "gray", 1);

                //countXunits and its triming proccess using zoomInS //for removing 0.00000000005 occurrences
                let countXunits = count * this.graphUnit;
                if (this.zoomInS >= 1)
                {
                    countXunits = Math.floor(countXunits * Math.pow(10, this.zoomInS)) / Math.pow(10, this.zoomInS);
                }

                //numbers every (77 + 7*zoom) px //not letting them go out of sight form ypan
                if ((this.halfHeight + 23 - this.cSoY) < 20) { ctx.fillText(countXunits, this.halfWidth + 6 + i + this.cSoX, 20); }
                else if ((this.halfHeight + 23 - this.cSoY) > (this.height - 8)) { ctx.fillText(countXunits, this.halfWidth + 6 + i + this.cSoX, this.height - 8); }
                else { ctx.fillText(countXunits, this.halfWidth + 6 + i + this.cSoX, this.halfHeight + 23 - this.cSoY); }
                count++;
            }
        }

        //x line notations negative side
        count = -1;
        count10p = 1;
        for(let i = 0; i < this.gDimX + this.cSoX; i += 7) {

            //every 14px lines
            if(Math.abs(this.cSoY) < this.halfWidth)
            {
                this.drawLine(this.halfWidth - unitOver10 * count10p + this.cSoX, this.halfHeight - 2 - this.cSoY, 4, -90, "black", 1);
                count10p++;
            }

            if(!(Math.abs(i) % (77 + this.zoom * 7)) && (Math.abs(i) > 0)) {

                //every (77 + 7*zoom) px lines
                this.drawLine(this.halfWidth - i + this.cSoX, 0, this.height, -90, "gray", 1);

                //countXunits and its triming proccess using zoomInS //for removing 0.00000000005 occurrences
                let countXunits = count * this.graphUnit;
                if (this.zoomInS >= 1) { countXunits = -(Math.floor(-countXunits * Math.pow(10, this.zoomInS)) / Math.pow(10, this.zoomInS)); }

                //numbers every (77 + 7*zoom) px //not letting the numbers go out of sight from ypan
                if (this.halfHeight + 23 - this.cSoY < 20) { ctx.fillText(countXunits, this.halfWidth + 5 - i + this.cSoX, 20); }
                else if ((this.halfHeight + 23 - this.cSoY) > (this.height - 8)) { ctx.fillText(countXunits, this.halfWidth + 5 - i + this.cSoX, this.height - 8); }
                else { ctx.fillText(countXunits, this.halfWidth + 5 - i + this.cSoX, this.halfHeight + 23 - this.cSoY); }
                count--;
            }
        }

        //y line notations positive side
        count = 1;
        count10p = 1;
        for(let i = 0 ; i < this.gDimY - this.cSoY; i += 7) {

            //every 14px lines
            if(Math.abs(this.cSoX) < this.halfWidth)
            {
                this.drawLine(this.halfWidth - 2 + this.cSoX, this.halfHeight - count10p * unitOver10 - this.cSoY, 4, 0, "black", 1);
                count10p++;
            }

            if(!(Math.abs(i) % (77 + this.zoom * 7)) && (Math.abs(i) > 0)) {

                //every (77 + 7*zoom) px lines
                this.drawLine(0, this.halfHeight - i - this.cSoY, this.width, 0, "gray", 1);

                //countXunits and its triming proccess using zoomInS //for removing 0.00000000005 occurrences // and also the negative sign displacement
                let countXunits = count * this.graphUnit;
                if(this.zoomInS >= 1) { countXunits = Math.floor(countXunits * Math.pow(10, this.zoomInS)) / Math.pow(10, this.zoomInS); }
                let numDisp = 8 - (this.numDigitsOver(countXunits) * 8) - (this.zoomInS * 8);
                (this.zoomInS > 0) ? numDisp -= 4 : 0;//decimal point displacement

                //numbers every (100 + 10*zoom) px //not letting the numbers go out of sight from xpan
                if((this.halfWidth + 7 + this.cSoX) < 8) { ctx.fillText(countXunits, 8, (this.halfHeight - 5) - i - this.cSoY); }
                else if((this.halfWidth + 7 + this.cSoX) > (this.width - 18)) { ctx.fillText(countXunits, this.width - 18 + numDisp, this.halfHeight - 5 - i - this.cSoY); }
                else { ctx.fillText(countXunits, this.halfWidth + 7 + this.cSoX, this.halfHeight - 5 - i - this.cSoY); }
                count++;
            }
        } 

        //y line notations negative side
        count = -1;
        count10p = 1;
        for(let i = 0; i < this.gDimY + this.cSoY; i += 7) {

            //every 14px lines
            if(Math.abs(this.cSoX) < this.halfWidth)
            {
                this.drawLine(this.halfWidth - 2 + this.cSoX, this.halfHeight + unitOver10 * count10p - this.cSoY, 4, 0, "black", 1);
                count10p++;
            }

            if(!(Math.abs(i) % (77 + this.zoom * 7)) && (Math.abs(i) > 0))
            {
                //every (77 + 7*zoom) px lines
                this.drawLine(0, this.halfHeight + i - this.cSoY, this.width, 0, "gray", 1);

                //countXunits and its triming proccess using zoomInS //for removing 0.00000000005 occurrences // and also the negative sign displacement
                let countXunits = count * this.graphUnit;
                if(this.zoomInS >= 1) { countXunits = -(Math.floor(-countXunits * Math.pow(10, this.zoomInS)) / Math.pow(10, this.zoomInS)); }
                let numDisp = 8 - (this.numDigitsOver(countXunits) * 8) - (this.zoomInS * 8);
                (this.zoomInS > 0) ? numDisp -= 4 : 0;//decimal point displacement

                //numbers every (100 + 10*zoom) px //not letting the numbers go out of sight from pan
                if((this.halfWidth + 7 + this.cSoX) < 8) { ctx.fillText(countXunits, 8, this.halfHeight - 5 + i - this.cSoY); }
                else if((this.halfWidth + 7 + this.cSoX) > (this.width - 23)) { ctx.fillText(countXunits, this.width - 23 + numDisp, this.halfHeight - 5 + i - this.cSoY); }
                else { ctx.fillText(countXunits, this.halfWidth + 8 + this.cSoX, this.halfHeight - 5 + i - this.cSoY); }
                count--;
            }
        }

        if(this.points.length > 0)
        {
            let pointHolder = [];
            for(let i = 0; i < this.points.length; i++)
            {
                pointHolder = this.convert(this.points[i]);
                ctx.beginPath();
                ctx.strokeStyle = "red";
                ctx.lineWidth = 2;
                ctx.arc(pointHolder[0], pointHolder[1], 3, 0, 2 * Math.PI);
                ctx.stroke();
            }
        }

        if(this.callBackFun != null) { this.callBackFun(); }

        if(this.drawCords)
        {
            ctx.fillStyle = "black";
            let xCord = (Math.floor(((this.mouseX / (77 + 7 * this.zoom)) * this.graphUnit) * 100) / 100);
            let yCord = (Math.floor(((this.mouseY / (77 + 7 * this.zoom)) * this.graphUnit) * 100) / 100);
            let xBwidth = 58 + this.numDigitsOver(xCord) * 9;
            let yBwidth = 58 + this.numDigitsOver(yCord) * 9;
            (xCord < 0)? (xBwidth += 4) : 0;
            (yCord < 0)? (yBwidth += 4) : 0;
            (xBwidth < yBwidth)? (xBwidth = yBwidth) : 0;
            ctx.clearRect(31, 31, xBwidth, 48);
            //ctx.font = "16px Arial";
            ctx.fillText("X : "+(Math.floor(((this.mouseX / (77 + 7 * this.zoom)) * this.graphUnit) * 100) / 100), 34, 50);
            ctx.fillText("Y : "+(Math.floor(((this.mouseY / (77 + 7 * this.zoom)) * this.graphUnit) * 100) / 100), 34, 70);
        }
    }

    callBackDrawing(funx)
    {   
        this.callBackFun = funx;
        this.drawCS();
    }

    focus()
    {
        let outerDia = 0;
        let innerDia = 0;
        let upperPt = 0;
        let lowerPt = 0;

        this.points.forEach(element => {
            outerDia = (outerDia < element[0])? element[0] : outerDia;
            innerDia = (innerDia > element[0])? element[0] : innerDia;
            upperPt = (upperPt < element[1])? element[1] : upperPt;
            lowerPt = (lowerPt > element[1])? element[1] : lowerPt;
        });

        let pointRangeX = outerDia - innerDia;
        let pointRangeY = upperPt - lowerPt;
        let units2 = 1;
        let unitsMultiplier2 = 1;

        while((units2 * 12) < pointRangeX || (units2 * 8) < pointRangeY)
        {
            if(unitsMultiplier2 == 1) { units2 *= 2; unitsMultiplier2 = 2; }
            else if(unitsMultiplier2 == 2) { units2 *= 5; units2 /= 2; unitsMultiplier2 = 2.5; }
            else{ units2 *= 2; unitsMultiplier2 = 1; }
        }
        
        this.cSoX = -(((outerDia + innerDia) / 2) / units2) * (77 + this.zoom * 7);
        this.cSoXprev = this.cSoX;
        this.cSoY = -(((upperPt + lowerPt) / 2) / units2)*(77 + this.zoom * 7);
        this.cSoYprev = this.cSoY;
        this.graphUnit = units2;

        this.drawCS();
    }

    onWheel(e)
    {
        //zooming section
        //recording the before zoom mouse position
        let pozX = (this.mouseX * this.graphUnit) / (77 + 7 * this.zoom);
        let pozY = (this.mouseY * this.graphUnit) / (77 + 7 * this.zoom);

        //moving cordinate system to the before zoom mouse position
        this.cSoX = this.cSoX + this.mouseX; this.cSoXprev = this.cSoXprev + this.mouseX;
        this.cSoY = this.cSoY + this.mouseY; this.cSoYprev = this.cSoYprev + this.mouseY;

        if(e.wheelDelta > 0) {
            //zoom in section
            this.zoom++;

            if(this.zoom >= this.zScrollBreak)
            {
                if(this.zScrollBreak == 12) { this.zScrollBreak = 11; }
                else if(this.zScrollBreak == 11) { this.zScrollBreak = 15; }
                else if(this.zScrollBreak == 15) { this.zScrollBreak = 12; }
                this.zoom = 0;

                //changing units //refreshing zoomInC, zoomInS more details about these constants at their declaration
                this.zoomInC++; this.zoomInS = Math.floor(this.zoomInC / 3);

                //changing between units multipliers and multiplying units
                if(this.unitMultiplier == 1) { this.graphUnit /= 2; this.unitMultiplier = 2.5; }
                else if(this.unitMultiplier == 2.5) { this.graphUnit *= 2; this.graphUnit /= 5; this.unitMultiplier = 2; }
                else { this.graphUnit /= 2; this.unitMultiplier = 1; }
            }

            //adjusting offsets for zoom based on old mouse position
            this.cSoX = this.cSoX - (pozX * ((77 + 7 * this.zoom) / this.graphUnit));
            this.cSoY = this.cSoY - (pozY * ((77 + 7 * this.zoom) / this.graphUnit));

            this.cSoXprev = this.cSoXprev - (pozX * ((77 + 7 * this.zoom) / this.graphUnit));
            this.cSoYprev = this.cSoYprev - (pozY * ((77 + 7 * this.zoom) / this.graphUnit));
        }
        else {
            //zoom out section
            this.zoom--;

            if(this.zoom <= 0)
            {
                if(this.zScrollBreak == 12) { this.zoom = 15; this.zScrollBreak = 15; }
                else if(this.zScrollBreak == 15) { this.zoom = 11; this.zScrollBreak = 11; }
                else if(this.zScrollBreak == 11) { this.zoom = 12; this.zScrollBreak = 12; }

                //changing units //refreshing zoomInC, zoomInS more details about these constants at their declaration
                this.zoomInC--; (this.zoomInC < 0) ? this.zoomInC = 0 : 0; this.zoomInS = Math.floor(this.zoomInC / 3);

                //changing between units multiplyers and multiplying units
                if(this.unitMultiplier == 1) { this.graphUnit *= 2; this.unitMultiplier = 2; }
                else if(this.unitMultiplier == 2) { this.graphUnit *= 5; this.graphUnit /= 2; this.unitMultiplier = 2.5; }
                else { this.graphUnit *= 2; this.unitMultiplier = 1; }
            }

            //adjusting offsets for zoom based on old mouse position
            this.cSoX = this.cSoX - (pozX * ((77 + 7 * this.zoom) / this.graphUnit));
            this.cSoY = this.cSoY - (pozY * ((77 + 7 * this.zoom) / this.graphUnit));

            this.cSoXprev = this.cSoXprev - (pozX * ((77 + 7 * this.zoom) / this.graphUnit));
            this.cSoYprev = this.cSoYprev - (pozY * ((77 + 7 * this.zoom) / this.graphUnit));
        }

        //we didnt redraw CS yet for zooming to take effect
        this.drawCS();

        //refreshing mouse position //there is a need to since we changed offsets
        this.mouseX =   e.pageX - (window.innerWidth  / 2) - this.cSoXprev;
        this.mouseY = -(e.pageY - (window.innerHeight / 2)) - this.cSoYprev;
    }

    onMouseMove(e)
    {
        //refreshing mouse position after mouse is moved
        this.mouseX =   e.pageX - (window.innerWidth  / 2) -  this.cSoXprev;
        this.mouseY = -(e.pageY - (window.innerHeight / 2)) - this.cSoYprev;

        //loop();

        if(this.panMode)
        {
            //redraw CS
            this.cSoX = this.cSoXprev + this.mouseX - this.panX; 
            this.cSoY = this.cSoYprev + this.mouseY - this.panY;
            this.drawCS();
        }
        else
        {
            if(this.drawCords)
            {
                let c = document.getElementById(this.id);
                let ctx = c.getContext("2d");
                let xCord = (Math.floor(((this.mouseX / (77 + 7 * this.zoom)) * this.graphUnit) * 100) / 100);
                let yCord = (Math.floor(((this.mouseY / (77 + 7 * this.zoom)) * this.graphUnit) * 100) / 100);
                let xBwidth = 58 + this.numDigitsOver(xCord) * 9;
                let yBwidth = 58 + this.numDigitsOver(yCord) * 9;
                (xCord < 0)? (xBwidth += 4) : 0;
                (yCord < 0)? (yBwidth += 4) : 0;
                (xBwidth < yBwidth)? (xBwidth = yBwidth):0;
                ctx.clearRect(31,31,xBwidth,48);
                //ctx.font = "16px Arial";
                ctx.fillText("X : "+(Math.floor(((this.mouseX / (77 + 7 * this.zoom)) * this.graphUnit) * 100) / 100), 34, 50);
                ctx.fillText("Y : "+(Math.floor(((this.mouseY / (77 + 7 * this.zoom)) * this.graphUnit) * 100) / 100), 34, 70);
            }
        }
    }

    onMouseDown()
    {
        //turning panMode on //recording mouse position where pan initiated //changing pointer sprite
        this.panMode = true;
        this.panX = this.mouseX;
        this.panY = this.mouseY;
        
        let cDiv = document.getElementById(this.divId);
        cDiv.style.cursor = '-webkit-grabbing';
    }

    onMouseUp()
    {    
        //turning panMode off //chaning offsets and pointer sprite
        this.panMode = false;
        this.cSoXprev = this.cSoX;
        this.cSoYprev = this.cSoY;
        
        let cDiv = document.getElementById(this.divId);
        cDiv.style.cursor = '-webkit-grab';
    }

    onMouseEnter()
    {
        let cDiv = document.getElementById(this.divId);
        cDiv.style.cursor = '-webkit-grab';
    }

    onMouseLeave()
    {   
        //turning panMode off after mouse leaves window
        this.panMode = false;
        this.cSoXprev = this.cSoX;
        this.cSoYprev = this.cSoY;
    }

    onResize()
    {
        let cDiv = document.getElementById(this.divId);

        this.width =  cDiv.clientWidth;
        this.height = cDiv.clientHeight;

        this.halfWidth =  cDiv.clientWidth / 2;
        this.halfHeight = cDiv.clientHeight / 2;

        this.gDimX = this.halfWidth + 100;
        this.gDimY = this.halfHeight + 100;

        let c = document.getElementById(this.id);
        c.setAttribute("width", this.width);
        c.setAttribute("height",this.height);
        this.drawCS();
    }
    
    convert(pointArray)
    {
        let newPoint = [
            (this.width /  2) + this.cSoX + (pointArray[0] * ((77 + this.zoom * 7) / this.graphUnit)),
            (this.height / 2) - this.cSoY - (pointArray[1] * ((77 + this.zoom * 7) / this.graphUnit))
        ];
        return newPoint;
    }

    drawLine(in_x, in_y, in_length, in_angle, in_color, in_width)
    {
        let c = document.getElementById(this.id);
        let ctx = c.getContext("2d");
        ctx.strokeStyle = in_color;
        ctx.lineWidth = in_width;
        ctx.beginPath();
        ctx.moveTo(in_x, in_y);
        let point = this.rotatePoint(in_length, 0, in_angle);
        ctx.lineTo(in_x + point[0], in_y - point[1]);
        ctx.stroke();
    }

    numDigitsOver(num)
    {
        let aValueNum = Math.abs(Math.floor(num));
        let dOver = 0;
        while(aValueNum >= 1) {
            dOver++;
            aValueNum = Math.floor(aValueNum / 10);
        }
        if(dOver == 0) { return 1; }
        return dOver;
    }

    rotatePoint(in_x, in_y, in_angle) 
    {
        let module = Math.sqrt(Math.pow(in_x, 2) + Math.pow(in_y, 2));
        let angle = 0;
        if(in_x >= 0)
        {
            angle = Math.atan(in_y / in_x);
        }
        else if(in_y >= 0)
        {
            angle = Math.PI - Math.atan(in_y / (- in_x));
        }
        else
        {
            angle = Math.PI + Math.atan((- in_y) / (- in_x));
        }
        angle += (in_angle * Math.PI / 180);
        return [ module * Math.cos(angle), module * Math.sin(angle) ];
    }
}