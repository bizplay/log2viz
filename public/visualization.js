function Request(line) {
// 	this.point = p;
// 	this.vector = v;
	this.path = line.path;
	this.fwd = line.fwd;
	this.time = line.request_time;
}

var fontsize = 12;
var radius = fontsize / 4;
var leftbar = 5;
var rightbar = 650;
var maxlines = 40;
var fwds = [];
var requests = [];
var paths = [];

function addLineToVisualization(line) {
  if( line.fwd != undefined && line.path != undefined && fwds.length < maxlines) {
    var fillcolor = {
			hue: Math.random() * 3600,
			saturation: 1,
			brightness: 1
		};

    var fwdText = new PointText({
	    point: view.center,
	    justification: 'left',
	    fontSize: fontsize,
	    fillColor: fillcolor,
	    content: line.fwd
    });
    fwds.push(fwdText);

    var path_exists = false;
    var pathText = undefined;
    for (var i = 0; i < paths.length; i++) {
      if( paths[i].path.content == line.path ) {
        path_exists = true;
        pathText = paths[i];
        paths[i].requests += 1;
      }
    }

    if( !path_exists ) {
      pathText = new PointText({
	      point: view.center,
	      justification: 'left',
	      fontSize: fontsize,
	      fillColor: fillcolor,
	      content: line.path
      });
      pathText = {
        requests: 1,
        path: pathText
      };
      paths.push(pathText);
    }

    var request = {
      fwd: fwdText,
      path: pathText,
      responseTime: line.response_time,
      point: undefined,
      init: true,
      vectorLength: undefined,
      onResponse: false
    };
    requests.push(request);
  }
}

function startVisualization(elem) {
  paper.setup(elem);

  view.onFrame = function(event) {

    // Place text on screen
    for (var i = 0; i < fwds.length; i++) {
      fwds[i].point = new Point(leftbar, fontsize * (i + 1));
    }
    for (var i = 0; i < paths.length; i++) {
      paths[i].path.point = new Point(rightbar, fontsize * (i + 1));
    }

    for (var i = 0; i < requests.length; i++) {
      if( requests[i].init == true ) {
        // Init request circles
        requests[i].point = new Path.Circle({
          center: requests[i].fwd.position,
          radius: radius,
          fillColor: requests[i].fwd.fillColor
        });
        requests[i].vectorLength = requests[i].path.path.point.subtract(requests[i].point.position).length;
        requests[i].init = false;
      } else {
        // Do animation
        if( requests[i].onResponse == false) {
          var vector = requests[i].path.path.point.subtract(requests[i].point.position);
          vector.length = requests[i].vectorLength;
          requests[i].point.position = requests[i].point.position.add(vector.divide(30));
          if (vector.x < 5) {
            console.log("onResponse");
	          requests[i].onResponse = true;
            requests[i].vectorLength = requests[i].fwd.point.subtract(requests[i].point.position).length;
	        }
        } else {
          var vector = requests[i].fwd.point.subtract(requests[i].point.position);
          vector.length = requests[i].vectorLength;
          requests[i].point.position = requests[i].point.position.add(vector.divide(30 * requests[i].responseTime / 1000));
          if (vector.x > 5) {
	          requests[i].point.remove();
	          requests[i].fwd.remove();
	          for (var n = 0; n < paths.length; n++) {
              if( paths[n].path.content == requests[i].path.path.content ) {
                paths[n].requests -= 1;
                if( paths[n].requests == 0 ) {
                  paths[n].path.remove();
                  paths.splice(n, 1);
                }
              }
            }
            fwds.splice(i, 1);
	          requests.splice(i, 1);
	        }
	      }
      }
    }
  };
}
