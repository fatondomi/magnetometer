
/*

<!-- 'http://192.168.0.105:8080' -->
    http://192.168.0.171:8080
*/

var socket = io('http://192.168.0.105:8080');

socket.on("connected",(data)=>{
    // on connected function
    console.log("connected");
});

socket.on('dataPoint', function (data) {
    parsePackage(data);
});


chartDiv = document.getElementById("chartDiv");
multiplyXInput = document.getElementById("multiplyXInput");
multiplyYInput = document.getElementById("multiplyYInput");
sampleSizeInput = document.getElementById("sampleSizeInput");
consoleBox = document.getElementById("consoleBox");
sendBtn = document.getElementById("sendBtn");


// Graph(divId,pointsArray,drawCords)
pointGraph = new Graph("chartDiv",seriesRef,true);

chartDiv.addEventListener("wheel",      ()=>{ pointGraph.onWheel(event);     });
chartDiv.addEventListener("mousemove",  ()=>{ pointGraph.onMouseMove(event); });
chartDiv.addEventListener("mousedown",  ()=>{ pointGraph.onMouseDown();      });
chartDiv.addEventListener("mouseup",    ()=>{ pointGraph.onMouseUp();        });
chartDiv.addEventListener("mouseenter", ()=>{ pointGraph.onMouseEnter();     });
window.addEventListener  ("resize",     ()=>{ pointGraph.onResize();         });

multiplyXInput.addEventListener ("change", ()=>{ multiplyXInputChanged();  });
multiplyYInput.addEventListener ("change", ()=>{ multiplyYInputChanged();  });
sampleSizeInput.addEventListener("change", ()=>{ sampleSizeInputChanged(); });
consoleBox.addEventListener     ("change", ()=>{ sendBtnClicked();         });
sendBtn.addEventListener        ("click",  ()=>{ sendBtnClicked();         });