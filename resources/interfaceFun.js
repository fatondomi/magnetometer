
var chartDiv;
var pointGraph;
var multiplyXInput;
var multiplyYInput;
var sampleSizeInput;
var consoleBox;
var sendBtn;

var sampleSize = 50;
var sampleSizeRef = sampleSize - 1;
var dataIndexer = 0;
var timeRef = 0;
var series = [];
var seriesRef = [];

let mx = 1;
let my = 10;

for(let i=0; i<sampleSize; i++)
{
    series.push([1,sampleSize - i]);
    seriesRef.push([1,sampleSize - i]);
}

function parsePackage(pkg)
{
    timeRef = pkg.pt[0] / mx;
    series[dataIndexer][0] = pkg.pt[0] / mx;
    series[dataIndexer][1] = pkg.pt[1] / my;
    seriesRef[dataIndexer][1] = pkg.pt[1] / my;

    dataIndexer = (dataIndexer < sampleSizeRef)? (dataIndexer + 1) : 0;

    // relocate all points with reference to the new point
    for(let i=0; i<sampleSize; i++) { seriesRef[i][0] = series[i][0] - timeRef; }

    pointGraph.drawCS();
}

function multiplyXInputChanged()
{
    mx = multiplyXInput.value; mx = (mx<0)? 1 : mx;
}

function multiplyYInputChanged()
{
    my = multiplyYInput.value; my = (my<0)? 1 : my;
}

function sampleSizeInputChanged()
{
    sampleSize = Math.floor(sampleSizeInput.value);
    sampleSize = (sampleSize<10)? 10 : sampleSize;
    sampleSizeRef = sampleSize -1;

    if(sampleSize > series.length)
    {
        let difference = sampleSize - series.length;
        for(let i=0; i<difference; i++)
        {
            series.push([1,i+1]);
            seriesRef.push([1,i+1]);
        }
    }
    else if(sampleSize < series.length)
    {
        dataIndexer = (dataIndexer > sampleSize - 1)? 0 : dataIndexer;

        let difference = series.length - sampleSize;
        for(let i=0; i<difference; i++)
        {
            series.pop();
            seriesRef.pop();
        }
    }
}

function sendBtnClicked()
{
    socket.emit("uiCmd",consoleBox.value);
    consoleBox.value = "";
}