// Plotter.js v0.1.3

var plotter = {
	bounds: new google.maps.LatLngBounds(),
	listener: null,
	map: null,
	multiple: 10.7639104,
	paths: null,
	plot: null,
	points: [],
	report: null,
	bind: function(settings){
		plotter.map = settings.map;
		plotter.multiple = settings.multiple;
		plotter.report = settings.report;
		plotter.plot = new google.maps.Polygon({ strokeWeight: settings.strokeWeight, fillColor: settings.fillColor });
		plotter.paths = new google.maps.MVCArray;
		plotter.plot.setMap(plotter.map);
		plotter.plot.setPath(new google.maps.MVCArray([plotter.paths]));
	},
	on: function(){
		plotter.listener = google.maps.event.addListener(plotter.map, 'click', function(event){
			plotter.paths.insertAt(plotter.paths.length, event.latLng);
			var point = new google.maps.Marker({
				icon: 'marker.png',
				position: event.latLng,
				map: plotter.map,
				draggable: true
			});
			point.setTitle("Point #" + plotter.paths.length);
			google.maps.event.addListener(point, 'click', function() {
				point.setMap(null);
				for (var i = 0, I = plotter.points.length; i < I && plotter.points[i] != point; ++i);
					plotter.points.splice(i, 1);
					plotter.paths.removeAt(i);
					plotter.calc();
			});
			google.maps.event.addListener(point, 'dragend', function() {
				for (var i = 0, I = plotter.points.length; i < I && plotter.points[i] != point; ++i);
					plotter.paths.setAt(i, point.getPosition());
					plotter.calc();
			});
			plotter.points.push(point);
			return plotter.calc();
		});
		plotter.map.setOptions({draggableCursor: 'crosshair'});
	},
	calc: function(){
		area_met = google.maps.geometry.spherical.computeArea(plotter.plot.getPath());
		var area_ft = (area_met * plotter.multiple).toFixed(2);
		var x = area_ft.split('.');
		var x1 = x[0];
		x2 = x.length > 1 ? '.' + x[1] : '';
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) { x1 = x1.replace(rgx, '$1' + ',' + '$2') }
		if (plotter.report){
			$(plotter.report).html(x1 + x2 + " sq ft");	
		} else {
			return x1 + x2 + " sq ft";
		}
	},
	data: function(){
		var output = '{coords: [';
		$(plotter.points).each(function(index){
			output += this.position.toString().replace("(", "{lat:").replace(",", ", lng:").replace(")", "}");
			if ( (index+1) != plotter.points.length ){ output +=  ", " }
		});
		output += "] }";
		return output;
	},
	off: function(){
		google.maps.event.removeListener(plotter.listener);
		$(plotter.points).each(function(index){
			for (index in plotter.points) {
				google.maps.event.trigger(plotter.points[index], 'click');
			}
		});
		plotter.map.setOptions({draggableCursor: ''});
	}
};
